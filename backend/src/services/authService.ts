import { pool, query } from '../config/database';
import { CreateUser, UpdateUser, User, UserResponse } from '../models/User';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

export class AuthService {
  // Register new user
  async register(userData: CreateUser): Promise<{ user: UserResponse; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError(409, 'User with this email already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(userData.password);

      // Create user
      const result = await query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role, is_active, created_at, updated_at`,
        [userData.email, passwordHash, userData.name, userData.role || 'developer']
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return { user, token };
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  // Login user
  async login(email: string, password: string): Promise<{ user: UserResponse; token: string }> {
    try {
      // Find user by email
      const result = await query(
        `SELECT id, email, password_hash, name, role, is_active, created_at, updated_at
         FROM users
         WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        throw new AppError(401, 'Invalid credentials');
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw new AppError(403, 'Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid credentials');
      }

      // Remove password_hash from response
      const { password_hash, ...userWithoutPassword } = user;

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return { user: userWithoutPassword, token };
    } catch (error) {
      logger.error('Error logging in user:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const result = await query(
        `SELECT id, email, name, role, is_active, created_at, updated_at
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'User not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId: string, updates: UpdateUser): Promise<UserResponse> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.email) {
        fields.push(`email = $${paramCount++}`);
        values.push(updates.email);
      }

      if (updates.password) {
        const passwordHash = await hashPassword(updates.password);
        fields.push(`password_hash = $${paramCount++}`);
        values.push(passwordHash);
      }

      if (updates.name) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }

      if (updates.role) {
        fields.push(`role = $${paramCount++}`);
        values.push(updates.role);
      }

      if (updates.is_active !== undefined) {
        fields.push(`is_active = $${paramCount++}`);
        values.push(updates.is_active);
      }

      if (fields.length === 0) {
        throw new AppError(400, 'No fields to update');
      }

      values.push(userId);

      const result = await query(
        `UPDATE users
         SET ${fields.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, email, name, role, is_active, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'User not found');
      }

      logger.info('User updated successfully', { userId });

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }
}

export default new AuthService();
