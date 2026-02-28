import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { logger } from '../config/logger';

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

/**
 * Upload a file buffer to Vercel Blob (production) or /tmp (local dev).
 * Returns the public URL for the uploaded file.
 */
export async function uploadToBlob(
  buffer: Buffer,
  originalname: string,
  mimetype: string
): Promise<string> {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalname).toLowerCase();
  const filename = `${timestamp}-${randomString}${ext}`;

  if (config.blob.readWriteToken) {
    // Production: upload to Vercel Blob
    const { put } = await import('@vercel/blob');
    const blob = await put(`gallery/${filename}`, buffer, {
      access: 'public',
      contentType: mimetype,
      token: config.blob.readWriteToken,
    });
    logger.info('File uploaded to Vercel Blob', { url: blob.url });
    return blob.url;
  } else {
    // Local dev fallback: save to /tmp/uploads/
    const tmpDir = '/tmp/uploads';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, buffer);
    logger.info('File saved to local /tmp fallback', { filePath });
    return `/tmp-uploads/${filename}`;
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
