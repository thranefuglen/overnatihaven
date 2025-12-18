import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public auth endpoints
router.post('/login', authController.login.bind(authController));

// Protected auth endpoints
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.get('/validate', authenticateToken, authController.validateToken.bind(authController));

// Admin user creation (for initial setup - consider removing or protecting further)
router.post('/users', authController.createUser.bind(authController));

export default router;