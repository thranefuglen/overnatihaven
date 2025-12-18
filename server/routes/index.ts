import { Router } from 'express';
import inquiryRoutes from './inquiryRoutes';
import contactRoutes from './contactRoutes';
import galleryRoutes from './galleryRoutes';
import authRoutes from './authRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/inquiries', inquiryRoutes);
router.use('/contacts', contactRoutes);
router.use('/gallery', galleryRoutes);
router.use('/auth', authRoutes);

export default router;
