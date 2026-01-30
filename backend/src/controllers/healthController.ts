import { Request, Response, NextFunction } from 'express';
import healthService from '../services/healthService';
import { wsService } from '../services/websocketService';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

export class HealthController {
  // Basic health check
  async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      // Check database connection
      await pool.query('SELECT 1');

      res.json({
        success: true,
        message: 'Service is healthy',
        data: {
          status: 'up',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV,
        },
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        success: false,
        message: 'Service is unhealthy',
        data: {
          status: 'down',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  // Get all services status
  async getServicesStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await healthService.getLatestServicesStatus();

      res.json({
        success: true,
        data: { services },
      });
    } catch (error) {
      next(error);
    }
  }

  // Check all services health (triggers new health checks)
  async checkAllServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await healthService.checkAllServicesHealth();

      // Broadcast update to all WebSocket clients
      const systemHealth = await healthService.getSystemHealth();
      wsService.notifySystemHealthUpdate(systemHealth);

      res.json({
        success: true,
        message: 'Health checks completed',
        data: { services },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get system health overview
  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const systemHealth = await healthService.getSystemHealth();

      const statusCode = systemHealth.status === 'down' ? 503 : 200;

      res.status(statusCode).json({
        success: systemHealth.status !== 'down',
        data: systemHealth,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get service status history
  async getServiceHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      const history = await healthService.getServiceStatusHistory(id, limit);

      res.json({
        success: true,
        data: { history },
      });
    } catch (error) {
      next(error);
    }
  }

  // Check specific service health
  async checkServiceHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await healthService.getServiceById(id);
      const healthCheck = await healthService.checkServiceHealth(service);

      res.json({
        success: true,
        data: healthCheck,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new HealthController();
