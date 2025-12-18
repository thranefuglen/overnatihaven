import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { validateBody } from '../middleware/validator';
import { asyncHandler } from '../middleware/errorHandler';
import { createContactSchema } from '../types';

const router = Router();

// Public routes
router.post(
  '/',
  validateBody(createContactSchema),
  asyncHandler(contactController.createContact.bind(contactController))
);

// Admin routes (TODO: Add authentication middleware)
router.get(
  '/',
  asyncHandler(contactController.getAllContacts.bind(contactController))
);

router.get(
  '/:id',
  asyncHandler(contactController.getContactById.bind(contactController))
);

export default router;
