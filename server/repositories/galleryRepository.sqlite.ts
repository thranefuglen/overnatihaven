import { getDatabase } from '../db/database';
import { GalleryImage, CreateGalleryImageInput, UpdateGalleryImageInput } from '../types';

/**
 * Repository for gallery images database operations
 */
export class GalleryRepository {
  /**
   * Get all active gallery images ordered by sort_order
   */
  async getActiveImages(): Promise<GalleryImage[]> {
    const db = getDatabase();
    try {
      const rows = db.prepare(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at 
         FROM gallery_images 
         WHERE is_active = 1 
         ORDER BY sort_order ASC, created_at DESC`
      ).all();
      // Convert SQLite integers to booleans
      return rows.map((row: any) => ({
        ...row,
        is_active: Boolean(row.is_active)
      })) as GalleryImage[];
    } catch (error) {
      console.error('Error fetching active gallery images:', error);
      throw error;
    }
  }

  /**
   * Get all gallery images (including inactive) for admin
   */
  async getAllImages(): Promise<GalleryImage[]> {
    const db = getDatabase();
    try {
      const rows = db.prepare(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at 
         FROM gallery_images 
         ORDER BY sort_order ASC, created_at DESC`
      ).all();
      // Convert SQLite integers to booleans
      return rows.map((row: any) => ({
        ...row,
        is_active: Boolean(row.is_active)
      })) as GalleryImage[];
    } catch (error) {
      console.error('Error fetching all gallery images:', error);
      throw error;
    }
  }

  /**
   * Get gallery image by ID
   */
  async getImageById(id: number): Promise<GalleryImage | null> {
    const db = getDatabase();
    try {
      const row = db.prepare(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at 
         FROM gallery_images 
         WHERE id = ?`
      ).get(id) as any;
      
      if (!row) return null;
      
      // Convert SQLite integer to boolean
      return {
        ...row,
        is_active: Boolean(row.is_active)
      } as GalleryImage;
    } catch (error) {
      console.error('Error fetching gallery image by ID:', error);
      throw error;
    }
  }

  /**
   * Create new gallery image
   */
  async createImage(imageData: CreateGalleryImageInput): Promise<GalleryImage> {
    const db = getDatabase();
    try {
      const { title, description, image_url, is_active, sort_order } = imageData;
      
      // Get the next sort order if not provided
      let finalSortOrder = sort_order || 0;
      if (finalSortOrder === 0) {
        const maxSortResult = db.prepare(
          'SELECT MAX(sort_order) as max_sort FROM gallery_images'
        ).get() as { max_sort: number | null };
        const maxSort = maxSortResult?.max_sort || 0;
        finalSortOrder = maxSort + 1;
      }

      const result = db.prepare(
        `INSERT INTO gallery_images (title, description, image_url, is_active, sort_order) 
         VALUES (?, ?, ?, ?, ?)`
      ).run(title, description, image_url, is_active ? 1 : 0, finalSortOrder);

      const insertId = result.lastInsertRowid as number;
      
      // Return the created image
      const createdImage = await this.getImageById(insertId);
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
    const db = getDatabase();
    try {
      const { title, description, image_url, file_path, is_active, sort_order } = imageData;
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(title);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (image_url !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(image_url);
      }
      if (file_path !== undefined) {
        updateFields.push('image_path = ?');
        updateValues.push(file_path);
      }
      if (is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(is_active ? 1 : 0);
      }
      if (sort_order !== undefined) {
        updateFields.push('sort_order = ?');
        updateValues.push(sort_order);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const result = db.prepare(
        `UPDATE gallery_images SET ${updateFields.join(', ')} WHERE id = ?`
      ).run(...updateValues);

      if (result.changes === 0) {
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
    const db = getDatabase();
    try {
      const result = db.prepare('DELETE FROM gallery_images WHERE id = ?').run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      throw error;
    }
  }

  /**
   * Reorder gallery images
   */
  async reorderImages(imageIds: number[]): Promise<void> {
    const db = getDatabase();
    try {
      const updateStmt = db.prepare(
        'UPDATE gallery_images SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      );

      // SQLite doesn't need explicit transactions for better-sqlite3 by default
      // but we can wrap it for safety
      for (let i = 0; i < imageIds.length; i++) {
        updateStmt.run(i + 1, imageIds[i]);
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
    const db = getDatabase();
    try {
      const result = db.prepare(
        'SELECT MAX(sort_order) as max_sort FROM gallery_images'
      ).get() as { max_sort: number | null };
      return result?.max_sort || 0;
    } catch (error) {
      console.error('Error getting max sort order:', error);
      throw error;
    }
  }
}

export const galleryRepository = new GalleryRepository();