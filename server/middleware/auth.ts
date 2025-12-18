import { Request, Response, NextFunction } from 'express';
import { MockAuthService } from '../services/mockService';
import { logger } from '../config/logger';

/**
 * Extend Request interface to include user information
 */
declare module 'express' {
  interface Request {
    user?: {
      id: number;
      username: string;
    };
  }
}

/**
 * Authentication middleware to verify JWT token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token er påkrævet',
      });
      return;
    }

      const decoded = MockAuthService.verifyToken(token);
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      username: decoded.username,
    };

    next();
  } catch (error) {
    logger.warn('Authentication failed', { 
      error: (error as Error).message,
      headers: req.headers 
    });
    
    res.status(403).json({
      success: false,
      message: 'Ugyldig eller udløbet token',
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
    const decoded = MockAuthService.verifyToken(token);
      req.user = {
        id: decoded.userId,
        username: decoded.username,
      };
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
}