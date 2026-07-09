import { head } from '@vercel/blob';
import { query } from '../db/database.postgres';
import { config } from '../config/env';

/**
 * Read-only diagnose af galleri-blobs. Ændrer INTET.
 *
 * Når `compress-blobs` melder HTTP 403 på et billede, kan det skyldes to vidt
 * forskellige ting:
 *   A) Filen findes stadig, men offentlig CDN-læsning er spærret
 *      (fx blob-store over kvote/suspenderet, eller ikke offentlig).
 *   B) Filen er reelt væk — rækken i DB peger på en slettet/ukendt blob.
 *
 * Testen: `head(url, { token })` går via Vercel's API (styringsplan) i stedet
 * for den offentlige CDN. Hvis head FINDER filen, men et almindeligt `fetch`
 * giver 403, er det tilfælde A (adgangs-/kvoteproblem, ikke manglende filer).
 * Hvis head også fejler med not-found, er det tilfælde B (døde DB-rækker).
 */
async function main() {
  const token = config.blob.readWriteToken;
  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN mangler i miljøet. Afbryder.');
    process.exit(1);
  }

  const rows = await query<{ id: number; image_url: string | null; is_active: boolean }>(
    'SELECT id, image_url, is_active FROM gallery_images'
  );
  const targets = rows.filter(
    (r): r is { id: number; image_url: string; is_active: boolean } =>
      !!r.image_url && /blob\.vercel-storage\.com\//.test(r.image_url)
  );

  console.log(`\n🔎 Diagnosticerer ${targets.length} blob-billeder (read-only)…\n`);

  const hosts = new Map<string, number>();
  let existsButBlocked = 0; // head OK, fetch fejler → tilfælde A
  let missing = 0; // head fejler → tilfælde B
  let ok = 0; // begge OK

  for (const row of targets) {
    const url = row.image_url;
    const label = url.split('/').pop() || url;
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return '(ugyldig URL)';
      }
    })();
    hosts.set(host, (hosts.get(host) ?? 0) + 1);

    let fetchStatus: number | string;
    try {
      fetchStatus = (await fetch(url)).status;
    } catch (err) {
      fetchStatus = `fetch-fejl: ${(err as Error).message}`;
    }

    let headResult: string;
    try {
      const meta = await head(url, { token });
      headResult = `findes (${(meta.size / 1024).toFixed(0)} KB)`;
      if (fetchStatus === 200) ok++;
      else existsButBlocked++;
    } catch (err) {
      headResult = `head-fejl: ${(err as Error).message}`;
      missing++;
    }

    console.log(`   #${row.id} ${label} [${row.is_active ? 'aktiv' : 'inaktiv'}]`);
    console.log(`        host: ${host}`);
    console.log(`        fetch: HTTP ${fetchStatus}   |   head: ${headResult}`);
  }

  console.log('\n────────────── OPSUMMERING ──────────────');
  console.log('Hosts (blob-stores) i spil:');
  for (const [host, count] of hosts) {
    console.log(`   • ${host}  → ${count} billeder`);
  }
  console.log('');
  console.log(`   ✅ Læsbare (fetch 200):                 ${ok}`);
  console.log(`   🔒 Findes, men fetch blokeret (A):      ${existsButBlocked}`);
  console.log(`   👻 Findes ikke via head (B, døde rækker): ${missing}`);
  console.log('');

  if (existsButBlocked > 0 && missing === 0) {
    console.log('➡️  Tilfælde A: Filerne findes, men offentlig læsning er spærret.');
    console.log('   Tjek blob-storens status i Vercel-dashboardet (kvote/egress-loft/adgang).');
    console.log('   Bekræft også at du kører mod det RIGTIGE miljø (prod vs dev).');
  } else if (missing > 0 && existsButBlocked === 0) {
    console.log('➡️  Tilfælde B: DB-rækkerne peger på blobs der ikke findes (døde rækker).');
    console.log('   Disse billeder er reelt væk — overvej at fjerne/erstatte rækkerne.');
  } else if (existsButBlocked > 0 && missing > 0) {
    console.log('➡️  Blandet: både spærrede og manglende filer — se pr. række ovenfor.');
  } else {
    console.log('➡️  Alt kunne læses — intet at diagnosticere.');
  }
  console.log('');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fejl under diagnose:', err);
  process.exit(1);
});
