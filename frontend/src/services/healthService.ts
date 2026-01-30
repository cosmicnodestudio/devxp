import api, { ApiResponse } from './api';

export interface Service {
  id: string;
  name: string;
  type: string | null;
  url: string;
  is_critical: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ServiceHealthCheck {
  service: Service;
  status: 'up' | 'down' | 'degraded' | 'unknown';
  response_time: number | null;
  error_message?: string;
  checked_at: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceHealthCheck[];
  summary: {
    total: number;
    up: number;
    down: number;
    degraded: number;
    critical_down: number;
  };
}

class HealthService {
  async checkHealth(): Promise<{ status: string; uptime: number }> {
    const response = await api.get<ApiResponse<{ status: string; uptime: number }>>('/health');
    return response.data.data!;
  }

  async getServicesStatus(): Promise<ServiceHealthCheck[]> {
    const response = await api.get<ApiResponse<{ services: ServiceHealthCheck[] }>>('/health/services');
    return response.data.data!.services;
  }

  async checkAllServices(): Promise<ServiceHealthCheck[]> {
    const response = await api.post<ApiResponse<{ services: ServiceHealthCheck[] }>>('/health/services/check');
    return response.data.data!.services;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await api.get<ApiResponse<SystemHealth>>('/health/system');
    return response.data.data!;
  }
}

export default new HealthService();
