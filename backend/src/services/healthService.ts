import axios from 'axios';
import { query } from '../config/database';
import { Service, ServiceStatus, HealthCheckResponse } from '../models/Service';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export class HealthService {
  // Get all services
  async getAllServices(): Promise<Service[]> {
    try {
      const result = await query('SELECT * FROM services ORDER BY name');
      return result.rows;
    } catch (error) {
      logger.error('Error fetching services:', error);
      throw error;
    }
  }

  // Get service by ID
  async getServiceById(serviceId: string): Promise<Service> {
    try {
      const result = await query('SELECT * FROM services WHERE id = $1', [serviceId]);

      if (result.rows.length === 0) {
        throw new Error('Service not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching service:', error);
      throw error;
    }
  }

  // Check health of a single service
  async checkServiceHealth(service: Service): Promise<HealthCheckResponse> {
    const startTime = Date.now();

    try {
      const response = await axios.get(service.url, {
        timeout: config.healthCheck.timeout,
        validateStatus: (status) => status < 500, // Consider 4xx as up
      });

      const responseTime = Date.now() - startTime;
      const status = response.status < 400 ? 'up' : 'degraded';

      // Save status to database
      await this.saveServiceStatus(service.id, {
        status,
        response_time: responseTime,
        error_message: null,
      });

      logger.info('Service health check completed', {
        serviceName: service.name,
        status,
        responseTime,
      });

      return {
        service,
        status,
        response_time: responseTime,
        checked_at: new Date(),
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error.message || 'Unknown error';

      // Save error status to database
      await this.saveServiceStatus(service.id, {
        status: 'down',
        response_time: responseTime,
        error_message: errorMessage,
      });

      logger.warn('Service health check failed', {
        serviceName: service.name,
        error: errorMessage,
      });

      return {
        service,
        status: 'down',
        response_time: responseTime,
        error_message: errorMessage,
        checked_at: new Date(),
      };
    }
  }

  // Check health of all services
  async checkAllServicesHealth(): Promise<HealthCheckResponse[]> {
    try {
      const services = await this.getAllServices();

      const healthChecks = await Promise.all(
        services.map(service => this.checkServiceHealth(service))
      );

      return healthChecks;
    } catch (error) {
      logger.error('Error checking all services health:', error);
      throw error;
    }
  }

  // Get latest status for all services
  async getLatestServicesStatus(): Promise<HealthCheckResponse[]> {
    try {
      const result = await query(`
        SELECT DISTINCT ON (s.id)
          s.*,
          ss.status,
          ss.response_time,
          ss.error_message,
          ss.checked_at
        FROM services s
        LEFT JOIN service_status ss ON s.id = ss.service_id
        ORDER BY s.id, ss.checked_at DESC
      `);

      return result.rows.map(row => ({
        service: {
          id: row.id,
          name: row.name,
          type: row.type,
          url: row.url,
          is_critical: row.is_critical,
          metadata: row.metadata,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
        status: row.status || 'unknown',
        response_time: row.response_time,
        error_message: row.error_message,
        checked_at: row.checked_at || new Date(),
      }));
    } catch (error) {
      logger.error('Error fetching latest services status:', error);
      throw error;
    }
  }

  // Save service status to database
  private async saveServiceStatus(
    serviceId: string,
    statusData: {
      status: 'up' | 'down' | 'degraded' | 'unknown';
      response_time: number;
      error_message: string | null;
    }
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO service_status (service_id, status, response_time, error_message)
         VALUES ($1, $2, $3, $4)`,
        [serviceId, statusData.status, statusData.response_time, statusData.error_message]
      );
    } catch (error) {
      logger.error('Error saving service status:', error);
      // Don't throw - we don't want health checks to fail because of database issues
    }
  }

  // Get service status history
  async getServiceStatusHistory(
    serviceId: string,
    limit: number = 100
  ): Promise<ServiceStatus[]> {
    try {
      const result = await query(
        `SELECT * FROM service_status
         WHERE service_id = $1
         ORDER BY checked_at DESC
         LIMIT $2`,
        [serviceId, limit]
      );

      return result.rows;
    } catch (error) {
      logger.error('Error fetching service status history:', error);
      throw error;
    }
  }

  // Get overall system health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: HealthCheckResponse[];
    summary: {
      total: number;
      up: number;
      down: number;
      degraded: number;
      critical_down: number;
    };
  }> {
    try {
      const services = await this.getLatestServicesStatus();

      const summary = {
        total: services.length,
        up: services.filter(s => s.status === 'up').length,
        down: services.filter(s => s.status === 'down').length,
        degraded: services.filter(s => s.status === 'degraded').length,
        critical_down: services.filter(
          s => s.status === 'down' && s.service.is_critical
        ).length,
      };

      let systemStatus: 'healthy' | 'degraded' | 'down' = 'healthy';

      if (summary.critical_down > 0) {
        systemStatus = 'down';
      } else if (summary.down > 0 || summary.degraded > 0) {
        systemStatus = 'degraded';
      }

      return {
        status: systemStatus,
        services,
        summary,
      };
    } catch (error) {
      logger.error('Error getting system health:', error);
      throw error;
    }
  }
}

export default new HealthService();
