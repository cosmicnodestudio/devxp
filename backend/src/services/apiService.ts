import { query } from '../config/database';
import { Api, CreateApi, UpdateApi } from '../models/Api';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

export class ApiService {
  // Get all APIs with optional filters
  async getAllApis(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<Api[]> {
    try {
      let sql = 'SELECT * FROM apis WHERE 1=1';
      const values: any[] = [];
      let paramCount = 1;

      if (filters?.status) {
        sql += ` AND status = $${paramCount++}`;
        values.push(filters.status);
      }

      if (filters?.category) {
        sql += ` AND category = $${paramCount++}`;
        values.push(filters.category);
      }

      if (filters?.userId) {
        sql += ` AND user_id = $${paramCount++}`;
        values.push(filters.userId);
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching APIs:', error);
      throw error;
    }
  }

  // Get API by ID
  async getApiById(apiId: string): Promise<Api> {
    try {
      const result = await query('SELECT * FROM apis WHERE id = $1', [apiId]);

      if (result.rows.length === 0) {
        throw new AppError(404, 'API not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching API:', error);
      throw error;
    }
  }

  // Create new API
  async createApi(userId: string, apiData: CreateApi): Promise<Api> {
    try {
      const result = await query(
        `INSERT INTO apis (user_id, name, description, base_url, method, headers, status, category, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          userId,
          apiData.name,
          apiData.description || null,
          apiData.base_url,
          apiData.method || 'GET',
          JSON.stringify(apiData.headers || {}),
          apiData.status || 'active',
          apiData.category || null,
          apiData.tags || [],
        ]
      );

      logger.info('API created successfully', { apiId: result.rows[0].id, userId });

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating API:', error);
      throw error;
    }
  }

  // Update API
  async updateApi(apiId: string, userId: string, updates: UpdateApi): Promise<Api> {
    try {
      // Check if API exists and belongs to user
      const existing = await query(
        'SELECT * FROM apis WHERE id = $1',
        [apiId]
      );

      if (existing.rows.length === 0) {
        throw new AppError(404, 'API not found');
      }

      // Allow admins to update any API
      // For now, we'll just check ownership
      if (existing.rows[0].user_id !== userId) {
        throw new AppError(403, 'Not authorized to update this API');
      }

      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }

      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }

      if (updates.base_url) {
        fields.push(`base_url = $${paramCount++}`);
        values.push(updates.base_url);
      }

      if (updates.method) {
        fields.push(`method = $${paramCount++}`);
        values.push(updates.method);
      }

      if (updates.headers) {
        fields.push(`headers = $${paramCount++}`);
        values.push(JSON.stringify(updates.headers));
      }

      if (updates.status) {
        fields.push(`status = $${paramCount++}`);
        values.push(updates.status);
      }

      if (updates.category !== undefined) {
        fields.push(`category = $${paramCount++}`);
        values.push(updates.category);
      }

      if (updates.tags) {
        fields.push(`tags = $${paramCount++}`);
        values.push(updates.tags);
      }

      if (fields.length === 0) {
        throw new AppError(400, 'No fields to update');
      }

      values.push(apiId);

      const result = await query(
        `UPDATE apis
         SET ${fields.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      logger.info('API updated successfully', { apiId });

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating API:', error);
      throw error;
    }
  }

  // Delete API
  async deleteApi(apiId: string, userId: string): Promise<void> {
    try {
      // Check if API exists and belongs to user
      const existing = await query(
        'SELECT * FROM apis WHERE id = $1',
        [apiId]
      );

      if (existing.rows.length === 0) {
        throw new AppError(404, 'API not found');
      }

      if (existing.rows[0].user_id !== userId) {
        throw new AppError(403, 'Not authorized to delete this API');
      }

      await query('DELETE FROM apis WHERE id = $1', [apiId]);

      logger.info('API deleted successfully', { apiId });
    } catch (error) {
      logger.error('Error deleting API:', error);
      throw error;
    }
  }

  // Get API statistics
  async getApiStatistics(userId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    deprecated: number;
    byCategory: Record<string, number>;
  }> {
    try {
      let whereClause = '';
      const values: any[] = [];

      if (userId) {
        whereClause = 'WHERE user_id = $1';
        values.push(userId);
      }

      const countResult = await query(
        `SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
          COUNT(CASE WHEN status = 'deprecated' THEN 1 END) as deprecated
         FROM apis ${whereClause}`,
        values
      );

      const categoryResult = await query(
        `SELECT category, COUNT(*) as count
         FROM apis
         ${whereClause}
         GROUP BY category`,
        values
      );

      const byCategory: Record<string, number> = {};
      categoryResult.rows.forEach(row => {
        byCategory[row.category || 'uncategorized'] = parseInt(row.count);
      });

      return {
        total: parseInt(countResult.rows[0].total),
        active: parseInt(countResult.rows[0].active),
        inactive: parseInt(countResult.rows[0].inactive),
        deprecated: parseInt(countResult.rows[0].deprecated),
        byCategory,
      };
    } catch (error) {
      logger.error('Error fetching API statistics:', error);
      throw error;
    }
  }
}

export default new ApiService();
