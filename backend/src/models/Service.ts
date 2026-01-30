import { z } from 'zod';

// Service model schema
export const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string().nullable(),
  url: z.string().url(),
  is_critical: z.boolean().default(false),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.date(),
  updated_at: z.date(),
});

// Service status schema
export const serviceStatusSchema = z.object({
  id: z.string().uuid(),
  service_id: z.string().uuid(),
  status: z.enum(['up', 'down', 'degraded', 'unknown']),
  response_time: z.number().nullable(),
  error_message: z.string().nullable(),
  checked_at: z.date(),
});

// Types
export type Service = z.infer<typeof serviceSchema>;
export type ServiceStatus = z.infer<typeof serviceStatusSchema>;

// Health check response
export interface HealthCheckResponse {
  service: Service;
  status: 'up' | 'down' | 'degraded' | 'unknown';
  response_time: number | null;
  error_message?: string;
  checked_at: Date;
}
