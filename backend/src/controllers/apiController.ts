import { Request, Response, NextFunction } from 'express';
import apiService from '../services/apiService';
import { createApiSchema, updateApiSchema } from '../models/Api';
import { AuthRequest } from '../middlewares/auth';
import { logger } from '../utils/logger';

export class ApiController {
  // Get all APIs
  async getAllApis(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, category } = req.query;

      const filters: any = {};

      if (status) filters.status = status as string;
      if (category) filters.category = category as string;

      const apis = await apiService.getAllApis(filters);

      res.json({
        success: true,
        data: {
          apis,
          count: apis.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get API by ID
  async getApiById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const api = await apiService.getApiById(id);

      res.json({
        success: true,
        data: { api },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new API
  async createApi(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const apiData = createApiSchema.parse(req.body);
      const api = await apiService.createApi(req.user.id, apiData);

      logger.info('API created', { apiId: api.id, userId: req.user.id });

      res.status(201).json({
        success: true,
        message: 'API created successfully',
        data: { api },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update API
  async updateApi(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const { id } = req.params;
      const updates = updateApiSchema.parse(req.body);
      const api = await apiService.updateApi(id, req.user.id, updates);

      logger.info('API updated', { apiId: id, userId: req.user.id });

      res.json({
        success: true,
        message: 'API updated successfully',
        data: { api },
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete API
  async deleteApi(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const { id } = req.params;
      await apiService.deleteApi(id, req.user.id);

      logger.info('API deleted', { apiId: id, userId: req.user.id });

      res.json({
        success: true,
        message: 'API deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get API statistics
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.query.my === 'true' ? req.user?.id : undefined;
      const statistics = await apiService.getApiStatistics(userId);

      res.json({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ApiController();
