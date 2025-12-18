import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getDatabase } from '../db/database';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { AdminUser, LoginInput, AuthResponse } from '../types';

/**
 * Authentication service for handling JWT tokens and password hashing
 */
export class AuthService {
  /**
   * Generate JWT token for user
   */
  generateToken(userId: number, username: string): string {
    return jwt.sign(
      { 
        userId, 
        username,
        type: 'admin'
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      logger.warn('Invalid JWT token', { error: (error as Error).message });
      throw new Error('Invalid token');
    }
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Authenticate user with username and password
   */
  async login(credentials: LoginInput): Promise<AuthResponse> {
    const { username, password } = credentials;
    const db = getDatabase();

    try {
      // Find user by username (SQLite version)
      const user = db.prepare(
        'SELECT id, username, password_hash FROM admin_users WHERE username = ?'
      ).get(username) as AdminUser | undefined;

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user.id, user.username);

      logger.info('Admin user logged in', { userId: user.id, username: user.username });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    } catch (error) {
      logger.error('Login failed', {
        username,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<AdminUser | null> {
    const db = getDatabase();
    try {
      const user = db.prepare(
        'SELECT id, username FROM admin_users WHERE id = ?'
      ).get(userId) as AdminUser | undefined;

      return user || null;
    } catch (error) {
      logger.error('Error fetching user by ID', {
        userId,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Create new admin user
   */
  async createUser(userData: { username: string; password: string }): Promise<AdminUser> {
    const db = getDatabase();
    try {
      const { username, password } = userData;

      // Check if user already exists
      const existingUser = db.prepare(
        'SELECT id FROM admin_users WHERE username = ?'
      ).get(username);

      if (existingUser) {
        throw new Error('User with this username already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const result = db.prepare(
        'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)'
      ).run(username, passwordHash);

      const userId = result.lastInsertRowid as number;

      // Fetch created user
      const user = await this.getUserById(userId);

      if (!user) {
        throw new Error('Failed to create user');
      }

      logger.info('New admin user created', { userId, username });
      return user;
    } catch (error) {
      logger.error('Error creating admin user', {
        userData: { username: userData.username },
        error: (error as Error).message
      });
      throw error;
    }
  }
}

export const authService = new AuthService();