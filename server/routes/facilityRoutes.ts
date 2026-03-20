import { Router } from 'express';
import { facilityController } from '../controllers/facilityController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public endpoint
router.get('/', facilityController.getActiveFacilities.bind(facilityController));

// Admin endpoints (protected)
router.get('/admin', authenticateToken, facilityController.getAllFacilities.bind(facilityController));
router.post('/admin', authenticateToken, facilityController.createFacility.bind(facilityController));

// Reorder MUST be before /:id routes
router.patch('/admin/reorder', authenticateToken, facilityController.reorderFacilities.bind(facilityController));

router.put('/admin/:id', authenticateToken, facilityController.updateFacility.bind(facilityController));
router.patch('/admin/:id/toggle', authenticateToken, facilityController.toggleFacility.bind(facilityController));
router.delete('/admin/:id', authenticateToken, facilityController.deleteFacility.bind(facilityController));

export default router;
