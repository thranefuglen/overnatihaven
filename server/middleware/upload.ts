import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { compressImage, THUMB_WIDTH } from '../utils/imageCompression';

/**
 * Configure multer with memory storage (file lives in req.file.buffer)
 * Works in both Vercel serverless and local dev environments
 */
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = config.upload.allowedTypes;
  const fileMime = file.mimetype.toLowerCase();

  if (allowedTypes.includes(fileMime)) {
    cb(null, true);
  } else {
    cb(new Error(`Ugyldig filtype. Tilladte typer: ${allowedTypes.join(', ')}`));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1,
  },
});

export interface UploadedImage {
  /** URL til fuld-størrelses-varianten (maks. MAX_WIDTH, WebP). */
  url: string;
  /** URL til thumbnail-varianten (maks. THUMB_WIDTH, WebP) til karrusel/grid. */
  thumbUrl: string;
}

/**
 * Filerne er immutable — hvert upload får et nyt unikt filnavn — så browseren
 * må cache dem så længe som muligt. Gengangere henter dermed aldrig billederne
 * igen, hvilket skærer direkte i blob-egress.
 */
const CACHE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 1 år

/**
 * Upload a file buffer to Vercel Blob (production) or /tmp (local dev).
 *
 * The buffer is compressed first (downscaled + converted to WebP) to keep
 * Vercel Blob egress low — the raw upload could be up to 5 MB, the compressed
 * version is typically 10-30× smaller. A ~THUMB_WIDTH px thumbnail variant is
 * uploaded alongside for the gallery carousel, so visitors only pay for the
 * full-size file when they open the lightbox.
 */
export async function uploadToBlob(
  buffer: Buffer,
  originalname: string
): Promise<UploadedImage> {
  const [full, thumb] = await Promise.all([
    compressImage(buffer),
    compressImage(buffer, THUMB_WIDTH),
  ]);

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const filename = `${timestamp}-${randomString}${full.ext}`;
  const thumbFilename = `${timestamp}-${randomString}-thumb${thumb.ext}`;

  if (config.blob.readWriteToken) {
    // Production: upload to Vercel Blob
    const { put } = await import('@vercel/blob');
    const [blob, thumbBlob] = await Promise.all([
      put(`gallery/${filename}`, full.buffer, {
        access: 'public',
        contentType: full.contentType,
        cacheControlMaxAge: CACHE_MAX_AGE_SECONDS,
        token: config.blob.readWriteToken,
      }),
      put(`gallery/${thumbFilename}`, thumb.buffer, {
        access: 'public',
        contentType: thumb.contentType,
        cacheControlMaxAge: CACHE_MAX_AGE_SECONDS,
        token: config.blob.readWriteToken,
      }),
    ]);
    logger.info('File uploaded to Vercel Blob', {
      url: blob.url,
      thumbUrl: thumbBlob.url,
      originalName: originalname,
      originalBytes: buffer.length,
      optimizedBytes: full.buffer.length,
      thumbBytes: thumb.buffer.length,
    });
    return { url: blob.url, thumbUrl: thumbBlob.url };
  } else {
    // Local dev fallback: save to /tmp/uploads/
    const tmpDir = '/tmp/uploads';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(path.join(tmpDir, filename), full.buffer);
    fs.writeFileSync(path.join(tmpDir, thumbFilename), thumb.buffer);
    logger.info('File saved to local /tmp fallback', {
      filePath: path.join(tmpDir, filename),
      originalName: originalname,
    });
    return {
      url: `/tmp-uploads/${filename}`,
      thumbUrl: `/tmp-uploads/${thumbFilename}`,
    };
  }
}

/**
 * Middleware to handle file upload errors
 */
export function handleUploadError(error: any, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof multer.MulterError) {
    let message = 'Fil upload fejlede';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `Filen er for stor. Max størrelse er ${config.upload.maxFileSize / 1024 / 1024}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'For mange filer. Kun én fil tilladt';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Uventet fil felt';
        break;
      default:
        message = `Upload error: ${error.message}`;
    }

    logger.warn('Multer upload error', {
      error: error.message,
      code: error.code,
    });

    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  if (error.message.includes('Ugyldig filtype')) {
    logger.warn('Invalid file type', {
      error: error.message,
      mimetype: req.file?.mimetype,
    });

    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  next(error);
}
