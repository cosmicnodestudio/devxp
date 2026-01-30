import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { createUserSchema, loginSchema } from '../models/User';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = createUserSchema.parse(req.body);
      const result = await authService.register(userData);

      logger.info('User registration successful', { email: userData.email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);

      logger.info('User login successful', { email });

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const user = await authService.getUserById(req.user.id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update current user
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const user = await authService.updateUser(req.user.id, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
