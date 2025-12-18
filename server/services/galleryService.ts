import { galleryRepository } from '../repositories/galleryRepository';
import { GalleryImage, CreateGalleryImageInput, UpdateGalleryImageInput, ReorderGalleryInput } from '../types';
import { logger } from '../config/logger';

/**
 * Service for gallery image business logic
 */
export class GalleryService {
  /**
   * Get all active gallery images for public display
   */
  async getActiveImages(): Promise<GalleryImage[]> {
    try {
      const images = await galleryRepository.getActiveImages();
      logger.info('Fetched active gallery images', { count: images.length });
      return images;
    } catch (error) {
      logger.error('Error fetching active gallery images', { 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get all gallery images for admin
   */
  async getAllImages(): Promise<GalleryImage[]> {
    try {
      const images = await galleryRepository.getAllImages();
      logger.info('Fetched all gallery images for admin', { count: images.length });
      return images;
    } catch (error) {
      logger.error('Error fetching all gallery images', { 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get gallery image by ID
   */
  async getImageById(id: number): Promise<GalleryImage | null> {
    try {
      const image = await galleryRepository.getImageById(id);
      if (!image) {
        logger.warn('Gallery image not found', { id });
      }
      return image;
    } catch (error) {
      logger.error('Error fetching gallery image by ID', { 
        id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Create new gallery image
   */
  async createImage(imageData: CreateGalleryImageInput): Promise<GalleryImage> {
    try {
      // Validate required fields
      if (!imageData.image_url && !imageData.file_path) {
        throw new Error('Enten image_url eller file_path er påkrævet');
      }

      const image = await galleryRepository.createImage(imageData);
      logger.info('Created new gallery image', { 
        id: image.id, 
        title: image.title 
      });
      return image;
    } catch (error) {
      logger.error('Error creating gallery image', { 
        title: imageData.title, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Update gallery image
   */
  async updateImage(id: number, imageData: UpdateGalleryImageInput): Promise<GalleryImage> {
    try {
      const existingImage = await galleryRepository.getImageById(id);
      if (!existingImage) {
        throw new Error('Billede ikke fundet');
      }

      const updatedImage = await galleryRepository.updateImage(id, imageData);
      if (!updatedImage) {
        throw new Error('Opdatering fejlede');
      }

      logger.info('Updated gallery image', { 
        id, 
        title: updatedImage.title 
      });
      return updatedImage;
    } catch (error) {
      logger.error('Error updating gallery image', { 
        id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Delete gallery image
   */
  async deleteImage(id: number): Promise<void> {
    try {
      const existingImage = await galleryRepository.getImageById(id);
      if (!existingImage) {
        throw new Error('Billede ikke fundet');
      }

      const deleted = await galleryRepository.deleteImage(id);
      if (!deleted) {
        throw new Error('Sletning fejlede');
      }

      logger.info('Deleted gallery image', { 
        id, 
        title: existingImage.title 
      });
    } catch (error) {
      logger.error('Error deleting gallery image', { 
        id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Reorder gallery images
   */
  async reorderImages(reorderData: ReorderGalleryInput): Promise<void> {
    try {
      const { imageIds } = reorderData;

      // Validate that all image IDs exist
      for (const id of imageIds) {
        const image = await galleryRepository.getImageById(id);
        if (!image) {
          throw new Error(`Billede med ID ${id} ikke fundet`);
        }
      }

      await galleryRepository.reorderImages(imageIds);
      logger.info('Reordered gallery images', { 
        imageIds, 
        count: imageIds.length 
      });
    } catch (error) {
      logger.error('Error reordering gallery images', { 
        imageIds: reorderData.imageIds, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Toggle image active status
   */
  async toggleImageStatus(id: number): Promise<GalleryImage> {
    try {
      const existingImage = await galleryRepository.getImageById(id);
      if (!existingImage) {
        throw new Error('Billede ikke fundet');
      }

      const updatedImage = await galleryRepository.updateImage(id, {
        is_active: !existingImage.is_active,
      });

      if (!updatedImage) {
        throw new Error('Status opdatering fejlede');
      }

      logger.info('Toggled gallery image status', { 
        id, 
        title: updatedImage.title, 
        is_active: updatedImage.is_active 
      });
      return updatedImage;
    } catch (error) {
      logger.error('Error toggling gallery image status', { 
        id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }
}

export const galleryService = new GalleryService();