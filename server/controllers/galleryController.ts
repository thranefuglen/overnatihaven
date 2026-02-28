import { Request, Response } from 'express';
import { galleryRepository } from '../repositories/galleryRepository';
import { uploadToBlob } from '../middleware/upload';

import {
  createGalleryImageSchema,
  updateGalleryImageSchema,
  reorderGallerySchema
} from '../types';
import { logger } from '../config/logger';

/**
 * Controller for gallery image endpoints
 */
export class GalleryController {
  /**
   * Get all active gallery images (public endpoint)
   */
  async getActiveImages(_req: Request, res: Response): Promise<void> {
    try {
      const images = await galleryRepository.getActiveImages();
      
      res.status(200).json({
        success: true,
        data: images,
        count: images.length,
      });
    } catch (error) {
      logger.error('Error in getActiveImages controller', { 
        error: (error as Error).message 
      });
      
      res.status(500).json({
        success: false,
        message: 'Kunne ikke hente billeder',
      });
    }
  }

  /**
   * Get all gallery images (admin endpoint)
   */
  async getAllImages(_req: Request, res: Response): Promise<void> {
    try {
      const images = await galleryRepository.getAllImages();
      
      res.status(200).json({
        success: true,
        data: images,
        count: images.length,
      });
    } catch (error) {
      logger.error('Error in getAllImages controller', { 
        error: (error as Error).message 
      });
      
      res.status(500).json({
        success: false,
        message: 'Kunne ikke hente billeder',
      });
    }
  }

  /**
   * Get gallery image by ID
   */
  async getImageById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Ugyldigt billede ID',
        });
        return;
      }

      const image = await galleryRepository.getImageById(id);
      
      if (!image) {
        res.status(404).json({
          success: false,
          message: 'Billede ikke fundet',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: image,
      });
    } catch (error) {
      logger.error('Error in getImageById controller', { 
        id: req.params.id,
        error: (error as Error).message 
      });
      
      res.status(500).json({
        success: false,
        message: 'Kunne ikke hente billede',
      });
    }
  }

  /**
   * Create new gallery image
   */
  async createImage(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createGalleryImageSchema.parse(req.body);

      // Upload file to blob storage if provided
      if (req.file) {
        const blobUrl = await uploadToBlob(req.file.buffer, req.file.originalname, req.file.mimetype);
        validatedData.image_url = blobUrl;
      }

      const image = await galleryRepository.createImage({
        title: validatedData.title,
        description: validatedData.description,
        image_url: validatedData.image_url || '',
        sort_order: validatedData.sort_order || 0,
        is_active: true
      });
      
      res.status(201).json({
        success: true,
        message: 'Billede oprettet succesfuldt',
        data: image,
      });
    } catch (error) {
      logger.error('Error in createImage controller', { 
        body: req.body,
        error: (error as Error).message 
      });
      
      res.status(500).json({
        success: false,
        message: 'Kunne ikke oprette billede',
      });
    }
  }

  /**
   * Update gallery image
   */
  async updateImage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Ugyldigt billede ID',
        });
        return;
      }

      const validatedData = updateGalleryImageSchema.parse(req.body);

      // Upload file to blob storage if provided
      if (req.file) {
        const blobUrl = await uploadToBlob(req.file.buffer, req.file.originalname, req.file.mimetype);
        validatedData.image_url = blobUrl;
      }

      const image = await galleryRepository.updateImage(id, validatedData);
      
      if (!image) {
        res.status(404).json({
          success: false,
          message: 'Billede ikke fundet',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Billede opdateret succesfuldt',
        data: image,
      });
    } catch (error) {
      logger.error('Error in updateImage controller', { 
        id: req.params.id,
        body: req.body,
        error: (error as Error).message 
      });
      
      const statusCode = (error as Error).message.includes('ikke fundet') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message || 'Kunne ikke opdatere billede',
      });
    }
  }

  /**
   * Delete gallery image
   */
  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Ugyldigt billede ID',
        });
        return;
      }

      const deleted = await galleryRepository.deleteImage(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Billede ikke fundet',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Billede slettet succesfuldt',
      });
    } catch (error) {
      logger.error('Error in deleteImage controller', { 
        id: req.params.id,
        error: (error as Error).message 
      });
      
      const statusCode = (error as Error).message.includes('ikke fundet') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message || 'Kunne ikke slette billede',
      });
    }
  }

  /**
   * Reorder gallery images
   */
  async reorderImages(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Reorder request received', { body: req.body });
      const validatedData = reorderGallerySchema.parse(req.body);
      
      await galleryRepository.reorderImages(validatedData.imageIds);
      
      res.status(200).json({
        success: true,
        message: 'Billeder reorganiseret succesfuldt',
      });
    } catch (error) {
      logger.error('Error in reorderImages controller', { 
        body: req.body,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Check if it's a Zod validation error
      if (error && typeof error === 'object' && 'issues' in error) {
        res.status(400).json({
          success: false,
          message: 'Ugyldig data',
          errors: (error as any).issues
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: (error as Error).message || 'Kunne ikke reorganisere billeder',
      });
    }
  }

  /**
   * Toggle image active status
   */
  async toggleImageStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Ugyldigt billede ID',
        });
        return;
      }

      const currentImage = await galleryRepository.getImageById(id);
      
      if (!currentImage) {
        res.status(404).json({
          success: false,
          message: 'Billede ikke fundet',
        });
        return;
      }
      
      const image = await galleryRepository.updateImage(id, {
        is_active: !currentImage.is_active
      });
      
      res.status(200).json({
        success: true,
        message: `Billede ${image?.is_active ? 'aktiveret' : 'deaktiveret'} succesfuldt`,
        data: image,
      });
    } catch (error) {
      logger.error('Error in toggleImageStatus controller', { 
        id: req.params.id,
        error: (error as Error).message 
      });
      
      const statusCode = (error as Error).message.includes('ikke fundet') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message || 'Kunne ikke ændre billede status',
      });
    }
  }
}

export const galleryController = new GalleryController();