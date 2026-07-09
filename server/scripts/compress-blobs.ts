import { put, del } from '@vercel/blob';
import { query, execute } from '../db/database.postgres';
import { config } from '../config/env';
import { compressImage } from '../utils/imageCompression';

/**
 * Komprimerer eksisterende galleri-billeder i Vercel Blob.
 *
 * De billeder der allerede ligger i blobben blev uploadet i fuld opløsning
 * (op til 5 MB) uden komprimering, og det er dem der driver egress-forbruget
 * lige nu. Nye uploads hjælper ikke på det der allerede er der — derfor dette
 * engangs-script.
 *
 * For hvert billede der stadig er refereret i gallery_images:
 *   1. Hent den nuværende blob-fil.
 *   2. Komprimér (nedskalér til maks. bredde + WebP) via delt helper.
 *   3. Hvis besparelsen er betydelig: upload den komprimerede fil som ny blob,
 *      opdatér image_url i databasen og slet den gamle blob.
 *
 * Idempotent: allerede-komprimerede billeder giver ingen betydelig besparelse
 * og springes over, så scriptet kan køres flere gange uden skade.
 *
 * Kør uden flag = dry-run (viser kun hvad der ville ske).
 * Kør med --apply = udfører faktisk komprimering, DB-opdatering og sletning.
 *
 * Kræver at .env peger på det rigtige miljø (blob-token + DB). Til produktion:
 *   vercel env pull .env --environment=production
 */

// Minimumsbesparelse før det er værd at genoploade (og betale en download-egress
// for at hente originalen). Under dette springes billedet over.
const MIN_SAVING_RATIO = 0.1; // 10 %

/** Genkender en Vercel Blob-URL under gallery/-prefixet. */
function isGalleryBlobUrl(url: string): boolean {
  return /blob\.vercel-storage\.com\/gallery\//.test(url);
}

function newBlobPath(ext: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `gallery/${timestamp}-${randomString}${ext}`;
}

function formatKB(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function main() {
  const shouldApply = process.argv.includes('--apply');
  const token = config.blob.readWriteToken;

  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN mangler i miljøet. Afbryder.');
    process.exit(1);
  }

  console.log(`\n🔍 Mode: ${shouldApply ? 'ANVEND (--apply)' : 'DRY-RUN (ingen ændringer)'}\n`);

  // Alle billeder der stadig er refereret i databasen (inkl. deaktiverede,
  // så vi ikke lader tunge filer ligge og vente på at blive genaktiveret).
  const rows = await query<{ id: number; image_url: string | null; is_active: boolean }>(
    'SELECT id, image_url, is_active FROM gallery_images'
  );

  const targets = rows.filter(
    (r): r is { id: number; image_url: string; is_active: boolean } =>
      !!r.image_url && isGalleryBlobUrl(r.image_url)
  );

  const skipped = rows.length - targets.length;
  console.log(
    `📚 ${rows.length} rækker i gallery_images` +
      (skipped > 0 ? ` (${skipped} har ingen blob-URL og springes over).` : '.')
  );
  console.log(`🖼️  ${targets.length} blob-billeder at behandle.\n`);

  if (targets.length === 0) {
    console.log('✅ Ingen blob-billeder at komprimere.');
    process.exit(0);
  }

  let processed = 0;
  let originalTotal = 0;
  let compressedTotal = 0;

  for (const row of targets) {
    const url = row.image_url;
    const label = url.split('/').pop() || url;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(
          `   ⚠️  #${row.id} ${label} (${row.is_active ? 'aktiv' : 'inaktiv'}): ` +
            `kunne ikke hentes (HTTP ${res.status}), springer over.`
        );
        continue;
      }
      const original = Buffer.from(await res.arrayBuffer());

      const { buffer: compressed, contentType, ext } = await compressImage(original);

      const saving = original.length - compressed.length;
      const ratio = saving / original.length;

      if (ratio < MIN_SAVING_RATIO) {
        console.log(
          `   ⏭️  #${row.id} ${label}: allerede optimeret (${formatKB(original.length)}), springer over.`
        );
        continue;
      }

      processed++;
      originalTotal += original.length;
      compressedTotal += compressed.length;

      console.log(
        `   ${shouldApply ? '✅' : '•'} #${row.id} ${label}: ` +
          `${formatKB(original.length)} → ${formatKB(compressed.length)} ` +
          `(-${(ratio * 100).toFixed(0)} %)`
      );

      if (!shouldApply) continue;

      // 1. Upload komprimeret som ny blob.
      const uploaded = await put(newBlobPath(ext), compressed, {
        access: 'public',
        contentType,
        token,
      });

      // 2. Peg databasen på den nye URL.
      await execute('UPDATE gallery_images SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
        uploaded.url,
        row.id,
      ]);

      // 3. Slet den gamle blob (efter DB er opdateret, så vi aldrig peger på en slettet fil).
      await del(url, { token });
    } catch (err) {
      console.log(`   ❌ #${row.id} ${label}: fejl — ${(err as Error).message}`);
    }
  }

  const savedMB = ((originalTotal - compressedTotal) / 1024 / 1024).toFixed(2);
  console.log('');
  if (processed === 0) {
    console.log('✅ Intet at komprimere — alle billeder er allerede optimeret.');
  } else if (shouldApply) {
    console.log(`🗜️  Komprimerede ${processed} billeder og sparede ${savedMB} MB pr. fuld visning.`);
  } else {
    console.log(
      `ℹ️  Dry-run — ${processed} billeder ville blive komprimeret og spare ~${savedMB} MB pr. fuld visning.`
    );
    console.log('   Kør igen med --apply for faktisk at udføre ændringerne.');
  }
  console.log('');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fejl under komprimering:', err);
  process.exit(1);
});
