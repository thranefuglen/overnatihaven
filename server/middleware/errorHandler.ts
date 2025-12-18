import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { isDevelopment } from '../config/env';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: unknown;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Der opstod en fejl';
  let errors: unknown = undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Valideringsfejl';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Log error
  logger.error('Error occurred', {
    statusCode,
    message,
    errors,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Send response
  const response: Record<string, unknown> = {
    success: false,
    message,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  if (isDevelopment && err.stack) {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
}

/**
 * Handle 404 errors
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Rute ikke fundet: ${req.method} ${req.path}`,
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
