import { Router } from 'express';
import { inquiryController } from '../controllers/inquiryController';
import { validateBody } from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';
import { createInquirySchema } from '../types';

const router = Router();

// Public routes
router.post(
  '/',
  validateBody(createInquirySchema),
  asyncHandler(inquiryController.createInquiry.bind(inquiryController))
);

router.get(
  '/availability',
  asyncHandler(inquiryController.checkAvailability.bind(inquiryController))
);

// Admin routes (TODO: Add authentication middleware)
router.get(
  '/',
  asyncHandler(inquiryController.getAllInquiries.bind(inquiryController))
);

router.get(
  '/:id',
  asyncHandler(inquiryController.getInquiryById.bind(inquiryController))
);

export default router;
