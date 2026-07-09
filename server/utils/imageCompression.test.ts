import sharp from 'sharp';
import { compressImage, MAX_WIDTH } from './imageCompression';

/**
 * Genererer et syntetisk JPEG-billede i fuld opløsning som stand-in for en
 * uploadet original.
 */
async function makeJpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 180, b: 90 },
    },
  })
    .jpeg({ quality: 100 })
    .toBuffer();
}

describe('compressImage', () => {
  it('nedskalerer billeder bredere end MAX_WIDTH til MAX_WIDTH', async () => {
    const input = await makeJpeg(3000, 2000);

    const { buffer } = await compressImage(input);
    const meta = await sharp(buffer).metadata();

    expect(meta.width).toBe(MAX_WIDTH);
    // Bevarer aspect ratio (3:2).
    expect(meta.height).toBe(Math.round((MAX_WIDTH * 2000) / 3000));
  });

  it('opskalerer ikke billeder smallere end MAX_WIDTH', async () => {
    const input = await makeJpeg(800, 600);

    const { buffer } = await compressImage(input);
    const meta = await sharp(buffer).metadata();

    expect(meta.width).toBe(800);
    expect(meta.height).toBe(600);
  });

  it('konverterer output til WebP', async () => {
    const input = await makeJpeg(1000, 1000);

    const result = await compressImage(input);
    const meta = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe('image/webp');
    expect(result.ext).toBe('.webp');
    expect(meta.format).toBe('webp');
  });

  it('producerer en mindre fil for et stort billede i fuld opløsning', async () => {
    const input = await makeJpeg(3000, 2000);

    const { buffer } = await compressImage(input);

    expect(buffer.length).toBeLessThan(input.length);
  });
});
