import { Router } from 'express';
import { galleryController } from '../controllers/galleryController';
import { authenticateToken } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';

const router = Router();

// Public gallery endpoints
router.get('/', galleryController.getActiveImages.bind(galleryController));

// Admin gallery endpoints (protected)
router.get('/admin', authenticateToken, galleryController.getAllImages.bind(galleryController));

// Reorder images - MUST be before /admin/:id routes
router.put('/admin/reorder', authenticateToken, galleryController.reorderImages.bind(galleryController));

// Specific ID routes
router.get('/admin/:id', authenticateToken, galleryController.getImageById.bind(galleryController));

// Create image with file upload
router.post(
  '/admin', 
  authenticateToken, 
  upload.single('image'), 
  handleUploadError,
  galleryController.createImage.bind(galleryController)
);

// Update image with optional file upload (support both PUT and PATCH)
router.put(
  '/admin/:id', 
  authenticateToken, 
  upload.single('image'), 
  handleUploadError,
  galleryController.updateImage.bind(galleryController)
);

router.patch(
  '/admin/:id', 
  authenticateToken, 
  upload.single('image'), 
  handleUploadError,
  galleryController.updateImage.bind(galleryController)
);

// Toggle image status
router.put('/admin/:id/toggle', authenticateToken, galleryController.toggleImageStatus.bind(galleryController));

// Delete image
router.delete('/admin/:id', authenticateToken, galleryController.deleteImage.bind(galleryController));

export default router;