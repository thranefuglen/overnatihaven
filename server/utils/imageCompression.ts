import sharp from 'sharp';

/**
 * Delt billedkomprimering brugt af blob-optimeringen.
 *
 * Galleri- og hero-billeder serveres direkte fra Vercel Blob i fuld opløsning,
 * hvilket driver egress-forbruget op. Denne helper nedskalerer til en fornuftig
 * maksbredde og konverterer til WebP, så hver fil bliver 10-30× mindre uden
 * synligt kvalitetstab på et website.
 */

/** Maks. bredde i pixels. Billeder bredere end dette nedskaleres; smallere røres ikke. */
export const MAX_WIDTH = 1600;

/** WebP-kvalitet (0-100). 80 er et godt kompromis mellem størrelse og udseende. */
export const WEBP_QUALITY = 80;

export interface CompressedImage {
  buffer: Buffer;
  contentType: string;
  /** Filendelse inkl. punktum, fx ".webp". */
  ext: string;
}

/**
 * Komprimér et billed-buffer: respektér EXIF-orientering, nedskalér til
 * maks. MAX_WIDTH og konvertér til WebP. Returnerer altid WebP.
 */
export async function compressImage(input: Buffer): Promise<CompressedImage> {
  const image = sharp(input, { failOn: 'none' });
  const metadata = await image.metadata();

  // .rotate() uden argument anvender EXIF-orienteringen og fjerner den bagefter,
  // så billedet vender rigtigt når EXIF-data strippes ved konvertering.
  let pipeline = image.rotate();

  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const buffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();

  return {
    buffer,
    contentType: 'image/webp',
    ext: '.webp',
  };
}
