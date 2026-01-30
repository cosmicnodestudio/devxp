import { z } from 'zod';

// API model schema
export const apiSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  base_url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  headers: z.record(z.string()).default({}),
  status: z.enum(['active', 'inactive', 'deprecated']).default('active'),
  category: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  created_at: z.date(),
  updated_at: z.date(),
});

// API creation schema
export const createApiSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  base_url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
  headers: z.record(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'deprecated']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// API update schema
export const updateApiSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  base_url: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
  headers: z.record(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'deprecated']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Types
export type Api = z.infer<typeof apiSchema>;
export type CreateApi = z.infer<typeof createApiSchema>;
export type UpdateApi = z.infer<typeof updateApiSchema>;
