import api, { ApiResponse } from './api';

export interface Api {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  base_url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  status: 'active' | 'inactive' | 'deprecated';
  category: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateApiData {
  name: string;
  description?: string;
  base_url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  status?: 'active' | 'inactive' | 'deprecated';
  category?: string;
  tags?: string[];
}

export interface UpdateApiData extends Partial<CreateApiData> {}

export interface ApiStatistics {
  total: number;
  active: number;
  inactive: number;
  deprecated: number;
  byCategory: Record<string, number>;
}

class ApiService {
  async getAllApis(filters?: { status?: string; category?: string }): Promise<Api[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);

    const response = await api.get<ApiResponse<{ apis: Api[] }>>(
      `/apis${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data.data!.apis;
  }

  async getApiById(id: string): Promise<Api> {
    const response = await api.get<ApiResponse<{ api: Api }>>(`/apis/${id}`);
    return response.data.data!.api;
  }

  async createApi(data: CreateApiData): Promise<Api> {
    const response = await api.post<ApiResponse<{ api: Api }>>('/apis', data);
    return response.data.data!.api;
  }

  async updateApi(id: string, data: UpdateApiData): Promise<Api> {
    const response = await api.put<ApiResponse<{ api: Api }>>(`/apis/${id}`, data);
    return response.data.data!.api;
  }

  async deleteApi(id: string): Promise<void> {
    await api.delete(`/apis/${id}`);
  }

  async getStatistics(): Promise<ApiStatistics> {
    const response = await api.get<ApiResponse<{ statistics: ApiStatistics }>>('/apis/statistics');
    return response.data.data!.statistics;
  }
}

export default new ApiService();
