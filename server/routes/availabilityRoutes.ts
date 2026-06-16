import { Router } from 'express';
import { availabilityController } from '../controllers/availabilityController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public endpoint
router.get('/', availabilityController.getAvailability.bind(availabilityController));

// Admin endpoints (protected). /season MUST be before /:date.
router.put('/season', authenticateToken, availabilityController.updateSeason.bind(availabilityController));
router.put('/:date', authenticateToken, availabilityController.upsertDay.bind(availabilityController));
router.delete('/:date', authenticateToken, availabilityController.resetDay.bind(availabilityController));

export default router;
