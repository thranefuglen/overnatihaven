import { put } from '@vercel/blob';
import { query, execute } from '../db/database.postgres';
import { config } from '../config/env';
import { compressImage, THUMB_WIDTH } from '../utils/imageCompression';

/**
 * Backfill af thumbnail-varianter for eksisterende galleri-billeder.
 *
 * Nye uploads får automatisk en ~THUMB_WIDTH px thumbnail ved siden af
 * fuld-størrelses-varianten (se uploadToBlob), men billeder uploadet før
 * denne ændring har kun fuld størrelse. Karrusellen falder i så fald tilbage
 * til image_url og henter unødigt meget data — derfor dette engangs-script.
 *
 * For hver række med en blob-image_url og uden thumb_url:
 *   1. Hent fuld-størrelses-filen.
 *   2. Generér thumbnail via delt helper.
 *   3. Upload som ny blob (med 1-års cache-header) og sæt thumb_url i databasen.
 *
 * Idempotent: rækker der allerede har thumb_url springes over.
 *
 * Kør uden flag = dry-run (viser kun hvad der ville ske).
 * Kør med --apply = udfører faktisk upload og DB-opdatering.
 *
 * Kræver at .env peger på det rigtige miljø (blob-token + DB). Til produktion:
 *   vercel env pull .env --environment=production
 */

const CACHE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 1 år — filerne er immutable

/** Genkender en Vercel Blob-URL under gallery/-prefixet. */
function isGalleryBlobUrl(url: string): boolean {
  return /blob\.vercel-storage\.com\/gallery\//.test(url);
}

function newThumbPath(ext: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `gallery/${timestamp}-${randomString}-thumb${ext}`;
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

  const rows = await query<{ id: number; image_url: string | null; thumb_url: string | null }>(
    'SELECT id, image_url, thumb_url FROM gallery_images'
  );

  const targets = rows.filter(
    (r): r is { id: number; image_url: string; thumb_url: null } =>
      !r.thumb_url && !!r.image_url && isGalleryBlobUrl(r.image_url)
  );

  console.log(`📚 ${rows.length} rækker i gallery_images.`);
  console.log(`🖼️  ${targets.length} billeder mangler thumbnail.\n`);

  if (targets.length === 0) {
    console.log('✅ Alle billeder har allerede en thumbnail.');
    process.exit(0);
  }

  let processed = 0;
  let thumbTotal = 0;

  for (const row of targets) {
    const label = row.image_url.split('/').pop() || row.image_url;

    try {
      const res = await fetch(row.image_url);
      if (!res.ok) {
        console.log(`   ⚠️  #${row.id} ${label}: kunne ikke hentes (HTTP ${res.status}), springer over.`);
        continue;
      }
      const original = Buffer.from(await res.arrayBuffer());

      const thumb = await compressImage(original, THUMB_WIDTH);

      processed++;
      thumbTotal += thumb.buffer.length;

      console.log(
        `   ${shouldApply ? '✅' : '•'} #${row.id} ${label}: ` +
          `${formatKB(original.length)} → thumbnail ${formatKB(thumb.buffer.length)}`
      );

      if (!shouldApply) continue;

      const uploaded = await put(newThumbPath(thumb.ext), thumb.buffer, {
        access: 'public',
        contentType: thumb.contentType,
        cacheControlMaxAge: CACHE_MAX_AGE_SECONDS,
        token,
      });

      await execute(
        'UPDATE gallery_images SET thumb_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [uploaded.url, row.id]
      );
    } catch (err) {
      console.log(`   ❌ #${row.id} ${label}: fejl — ${(err as Error).message}`);
    }
  }

  console.log('');
  if (processed === 0) {
    console.log('✅ Intet at gøre — ingen billeder kunne behandles.');
  } else if (shouldApply) {
    console.log(`🖼️  Oprettede ${processed} thumbnails (${formatKB(thumbTotal)} i alt).`);
  } else {
    console.log(`ℹ️  Dry-run — ${processed} thumbnails ville blive oprettet (${formatKB(thumbTotal)} i alt).`);
    console.log('   Kør igen med --apply for faktisk at udføre ændringerne.');
  }
  console.log('');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fejl under thumbnail-backfill:', err);
  process.exit(1);
});
