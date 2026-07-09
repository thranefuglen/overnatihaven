import { list, del } from '@vercel/blob';
import { query } from '../db/database.postgres';
import { config } from '../config/env';

/**
 * Rydder forældreløse filer op i Vercel Blob.
 *
 * En blob-fil regnes som forældreløs, hvis dens URL ikke længere optræder
 * som image_url på nogen række i gallery_images-tabellen. Det dækker både:
 *   - billeder der er hard-deleted (rækken fjernet, filen efterladt)
 *   - gamle filer efterladt efter et "erstat billede"-upload
 *
 * Deaktiverede billeder (is_active = false) har stadig en række med image_url
 * og bevares derfor.
 *
 * Kør uden flag = dry-run (viser kun hvad der ville ske).
 * Kør med --delete = sletter faktisk de forældreløse filer.
 */
async function main() {
  const shouldDelete = process.argv.includes('--delete');
  const token = config.blob.readWriteToken;

  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN mangler i miljøet. Afbryder.');
    process.exit(1);
  }

  console.log(`\n🔍 Mode: ${shouldDelete ? 'SLET (--delete)' : 'DRY-RUN (ingen sletning)'}\n`);

  // 1. Alle image_url'er der stadig er i brug i databasen
  const rows = await query<{ image_url: string | null }>(
    'SELECT image_url FROM gallery_images'
  );
  const referenced = new Set(
    rows
      .map((r) => r.image_url)
      .filter((u): u is string => !!u)
  );
  console.log(`📚 ${referenced.size} billeder refereret i databasen.`);

  // 2. Alle blobs under gallery/-prefixet (paginér for en sikkerheds skyld)
  const blobs: { url: string; pathname: string; size: number }[] = [];
  let cursor: string | undefined;
  do {
    const res = await list({ token, prefix: 'gallery/', cursor, limit: 1000 });
    blobs.push(...res.blobs);
    cursor = res.cursor;
  } while (cursor);
  console.log(`🗂️  ${blobs.length} filer fundet under gallery/ i blobben.\n`);

  // 3. Find forældreløse
  const orphans = blobs.filter((b) => !referenced.has(b.url));

  if (orphans.length === 0) {
    console.log('✅ Ingen forældreløse filer. Alt er rent.');
    process.exit(0);
  }

  const totalBytes = orphans.reduce((sum, b) => sum + b.size, 0);
  const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

  console.log(`Fundet ${orphans.length} forældreløse filer (${totalMB} MB):`);
  for (const b of orphans) {
    console.log(`   • ${b.pathname}  (${(b.size / 1024).toFixed(0)} KB)`);
  }
  console.log('');

  if (!shouldDelete) {
    console.log('ℹ️  Dry-run — der blev ikke slettet noget.');
    console.log('   Kør igen med --delete for faktisk at fjerne filerne ovenfor.\n');
    process.exit(0);
  }

  // 4. Slet
  await del(
    orphans.map((b) => b.url),
    { token }
  );
  console.log(`🗑️  Slettede ${orphans.length} filer og frigjorde ${totalMB} MB.\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fejl under oprydning:', err);
  process.exit(1);
});
