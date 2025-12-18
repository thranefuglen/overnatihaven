import multer, { Express } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { logger } from '../config/logger';

/**
 * Ensure upload directory exists
 */
function ensureUploadDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info('Created upload directory', { dir });
  }
}

/**
 * Configure multer storage
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.upload.uploadDir;
    ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${timestamp}-${randomString}${ext}`;
    cb(null, filename);
  },
});

/**
 * File filter for allowed image types
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = config.upload.allowedTypes;
  const fileMime = file.mimetype.toLowerCase();
  
  if (allowedTypes.includes(fileMime)) {
    cb(null, true);
  } else {
    cb(new Error(`Ugyldig filtype. Tilladte typer: ${allowedTypes.join(', ')}`));
  }
};

/**
 * Configure multer middleware
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1, // Only one file at a time
  },
});

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
      code: error.code 
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
      mimetype: req.file?.mimetype 
    });
    
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }
  
  next(error);
}

/**
 * Delete uploaded file
 */
export function deleteFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File deleted', { filePath });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error deleting file', { 
      filePath, 
      error: (error as Error).message 
    });
    return false;
  }
}

/**
 * Get file info
 */
export function getFileInfo(filePath: string): { exists: boolean; size?: number; type?: string } | null {
  try {
    if (!fs.existsSync(filePath)) {
      return { exists: false };
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Simple MIME type detection based on extension
    let type = 'application/octet-stream';
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        type = 'image/jpeg';
        break;
      case '.png':
        type = 'image/png';
        break;
      case '.webp':
        type = 'image/webp';
        break;
      case '.gif':
        type = 'image/gif';
        break;
    }
    
    return {
      exists: true,
      size: stats.size,
      type,
    };
  } catch (error) {
    logger.error('Error getting file info', { 
      filePath, 
      error: (error as Error).message 
    });
    return null;
  }
}