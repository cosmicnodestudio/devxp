import { z } from 'zod';

// User model schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'developer', 'viewer']).default('developer'),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

// User creation schema (without sensitive fields)
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(2).max(255),
  role: z.enum(['admin', 'developer', 'viewer']).optional(),
});

// User update schema
export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).max(100).optional(),
  name: z.string().min(2).max(255).optional(),
  role: z.enum(['admin', 'developer', 'viewer']).optional(),
  is_active: z.boolean().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Types
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// User response (without password)
export type UserResponse = Omit<User, 'password_hash'>;
