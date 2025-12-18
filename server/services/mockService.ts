import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from '../config/logger';

// Mock admin user
const mockAdminUser = {
  id: 1,
  username: 'admin',
  password_hash: '$2b$10$rOzJqQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQjQjQjQuOzJqQjQjQjQjQjQ'
};

// Mock gallery images
const mockGalleryImages = [
  {
    id: 1,
    title: 'Telt i haven',
    description: 'Smukt telt omgivet af grønne træer og blomster',
    image_url: 'https://images.unsplash.com/photo-1523987351232-1ca2c5be4eb5?w=800&h=600&fit=crop',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Camping plads',
    description: 'Rummelig camping plads med god plads til flere telte',
    image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Haven ved solnedgang',
    description: 'Den smukke have ved solnedgangstidspunkt',
    image_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
}

export interface GalleryImage {
  id: number;
  title?: string;
  description?: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Mock authentication service
 */
export class MockAuthService {
  /**
   * Authenticate user
   */
  static async login(username: string, password: string): Promise<{ token: string; user: Omit<AdminUser, 'password_hash'> } | null> {
    try {
      // Find user
      if (username !== mockAdminUser.username) {
        return null;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, mockAdminUser.password_hash);
      if (!isValidPassword) {
        return null;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: mockAdminUser.id, username: mockAdminUser.username },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      const { password_hash, ...userWithoutPassword } = mockAdminUser;

      return { token, user: userWithoutPassword };
    } catch (error) {
      logger.error('Login failed', { error, username });
      return null;
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return null;
    }
  }
}

/**
 * Mock gallery service
 */
export class MockGalleryService {
  /**
   * Get all active gallery images (for public frontend)
   */
  static getActiveImages(): GalleryImage[] {
    return mockGalleryImages
      .filter(img => img.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Get all gallery images (for admin)
   */
  static getAllImages(): GalleryImage[] {
    return mockGalleryImages.sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Get image by ID
   */
  static getImageById(id: number): GalleryImage | null {
    return mockGalleryImages.find(img => img.id === id) || null;
  }

  /**
   * Create new image
   */
  static createImage(imageData: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>): GalleryImage {
    const newImage: GalleryImage = {
      id: Math.max(...mockGalleryImages.map(img => img.id)) + 1,
      ...imageData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockGalleryImages.push(newImage);
    return newImage;
  }

  /**
   * Update image
   */
  static updateImage(id: number, updates: Partial<GalleryImage>): GalleryImage | null {
    const imageIndex = mockGalleryImages.findIndex(img => img.id === id);
    if (imageIndex === -1) {
      return null;
    }

    mockGalleryImages[imageIndex] = {
      ...mockGalleryImages[imageIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return mockGalleryImages[imageIndex];
  }

  /**
   * Delete image
   */
  static deleteImage(id: number): boolean {
    const imageIndex = mockGalleryImages.findIndex(img => img.id === id);
    if (imageIndex === -1) {
      return false;
    }

    mockGalleryImages.splice(imageIndex, 1);
    return true;
  }

  /**
   * Reorder images
   */
  static reorderImages(imageIds: number[]): boolean {
    try {
      imageIds.forEach((id, index) => {
        const image = mockGalleryImages.find(img => img.id === id);
        if (image) {
          image.sort_order = index + 1;
          image.updated_at = new Date().toISOString();
        }
      });
      return true;
    } catch (error) {
      logger.error('Failed to reorder images', { error });
      return false;
    }
  }
}