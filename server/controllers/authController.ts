import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { createAdminUserSchema } from '../types';
import { logger } from '../config/logger';

/**
 * Controller for authentication endpoints
 */
export class AuthController {
  /**
   * Login endpoint
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Brugernavn og adgangskode er påkrævet'
        });
        return;
      }

      // Authenticate user
      const result = await authService.login({ username, password });

      res.json({
        success: true,
        message: 'Login succesfuldt',
        data: result
      });

    } catch (error) {
      logger.error('Login error', { error });
      res.status(401).json({
        success: false,
        message: 'Ugyldigt brugernavn eller adgangskode'
      });
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Mangler token'
        });
        return;
      }

      const decoded = authService.verifyToken(token);
      
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Ugyldig token'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: decoded.userId,
          username: decoded.username
        }
      });
    } catch (error) {
      logger.error('Get current user error', { error });
      res.status(500).json({
        success: false,
        message: 'Der opstod en fejl'
      });
    }
  }

  /**
   * Create new admin user (for initial setup)
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = createAdminUserSchema.parse(req.body);
      
      const user = await authService.createUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'Admin bruger oprettet succesfuldt',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      logger.error('Error creating admin user', { 
        body: { username: req.body.username, email: req.body.email },
        error: (error as Error).message 
      });
      
      const statusCode = (error as Error).message.includes('already exists') ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message || 'Kunne ikke oprette bruger',
      });
    }
  }

  /**
   * Logout endpoint (client-side token removal)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a JWT-based system, logout is typically handled client-side
      // by removing the token from storage
      logger.info('User logged out', { 
        userId: req.user?.id,
        username: req.user?.username 
      });
      
      res.status(200).json({
        success: true,
        message: 'Logout succesfuldt',
      });
    } catch (error) {
      logger.error('Error during logout', { 
        userId: req.user?.id,
        error: (error as Error).message 
      });
      
      res.status(500).json({
        success: false,
        message: 'Logout fejlede',
      });
    }
  }

  /**
   * Validate token endpoint
   */
  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Ugyldig token',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token er gyldig',
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      logger.error('Error validating token', { 
        error: (error as Error).message 
      });
      
      res.status(401).json({
        success: false,
        message: 'Token validering fejlede',
      });
    }
  }
}

export const authController = new AuthController();