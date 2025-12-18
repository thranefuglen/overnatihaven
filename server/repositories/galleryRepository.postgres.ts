import { query, queryOne, execute } from '../db/database.postgres';
import { GalleryImage, CreateGalleryImageInput, UpdateGalleryImageInput } from '../types';

/**
 * Repository for gallery images database operations (Postgres version)
 */
export class GalleryRepository {
  /**
   * Get all active gallery images ordered by sort_order
   */
  async getActiveImages(): Promise<GalleryImage[]> {
    try {
      const rows = await query<GalleryImage>(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at
         FROM gallery_images
         WHERE is_active = true
         ORDER BY sort_order ASC, created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error fetching active gallery images:', error);
      throw error;
    }
  }

  /**
   * Get all gallery images (including inactive) for admin
   */
  async getAllImages(): Promise<GalleryImage[]> {
    try {
      const rows = await query<GalleryImage>(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at
         FROM gallery_images
         ORDER BY sort_order ASC, created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error fetching all gallery images:', error);
      throw error;
    }
  }

  /**
   * Get gallery image by ID
   */
  async getImageById(id: number): Promise<GalleryImage | null> {
    try {
      const row = await queryOne<GalleryImage>(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at
         FROM gallery_images
         WHERE id = $1`,
        [id]
      );
      return row;
    } catch (error) {
      console.error('Error fetching gallery image by ID:', error);
      throw error;
    }
  }

  /**
   * Create new gallery image
   */
  async createImage(imageData: CreateGalleryImageInput): Promise<GalleryImage> {
    try {
      const { title, description, image_url, is_active, sort_order } = imageData;

      // Get the next sort order if not provided
      let finalSortOrder = sort_order || 0;
      if (finalSortOrder === 0) {
        const maxSortResult = await queryOne<{ max_sort: number | null }>(
          'SELECT MAX(sort_order) as max_sort FROM gallery_images'
        );
        const maxSort = maxSortResult?.max_sort || 0;
        finalSortOrder = maxSort + 1;
      }

      const result = await queryOne<{ id: number }>(
        `INSERT INTO gallery_images (title, description, image_url, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [title, description, image_url, is_active, finalSortOrder]
      );

      if (!result) {
        throw new Error('Failed to create image');
      }

      // Return the created image
      const createdImage = await this.getImageById(result.id);
      if (!createdImage) {
        throw new Error('Failed to retrieve created image');
      }

      return createdImage;
    } catch (error) {
      console.error('Error creating gallery image:', error);
      throw error;
    }
  }

  /**
   * Update gallery image
   */
  async updateImage(id: number, imageData: UpdateGalleryImageInput): Promise<GalleryImage | null> {
    try {
      const { title, description, image_url, file_path, is_active, sort_order } = imageData;

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        updateValues.push(title);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(description);
      }
      if (image_url !== undefined) {
        updateFields.push(`image_url = $${paramIndex++}`);
        updateValues.push(image_url);
      }
      if (file_path !== undefined) {
        updateFields.push(`image_path = $${paramIndex++}`);
        updateValues.push(file_path);
      }
      if (is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`);
        updateValues.push(is_active);
      }
      if (sort_order !== undefined) {
        updateFields.push(`sort_order = $${paramIndex++}`);
        updateValues.push(sort_order);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const result = await execute(
        `UPDATE gallery_images SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        updateValues
      );

      if (result.rowCount === 0) {
        return null;
      }

      return await this.getImageById(id);
    } catch (error) {
      console.error('Error updating gallery image:', error);
      throw error;
    }
  }

  /**
   * Delete gallery image
   */
  async deleteImage(id: number): Promise<boolean> {
    try {
      const result = await execute('DELETE FROM gallery_images WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      throw error;
    }
  }

  /**
   * Reorder gallery images
   */
  async reorderImages(imageIds: number[]): Promise<void> {
    try {
      // Update each image's sort_order
      for (let i = 0; i < imageIds.length; i++) {
        await execute(
          'UPDATE gallery_images SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [i + 1, imageIds[i]]
        );
      }
    } catch (error) {
      console.error('Error reordering gallery images:', error);
      throw error;
    }
  }

  /**
   * Get max sort order
   */
  async getMaxSortOrder(): Promise<number> {
    try {
      const result = await queryOne<{ max_sort: number | null }>(
        'SELECT MAX(sort_order) as max_sort FROM gallery_images'
      );
      return result?.max_sort || 0;
    } catch (error) {
      console.error('Error getting max sort order:', error);
      throw error;
    }
  }
}

export const galleryRepository = new GalleryRepository();
