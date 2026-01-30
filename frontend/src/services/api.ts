import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    console.log('[API Interceptor] Request to:', config.url);
    console.log('[API Interceptor] Token exists:', !!token);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Interceptor] Authorization header added');
    } else {
      console.log('[API Interceptor] No token - request without auth');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Interceptor] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('[API Interceptor] Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Interceptor] Response error:', error.response?.status, error.message);

    if (error.response?.status === 401) {
      console.warn('[API Interceptor] 401 Unauthorized - clearing auth and redirecting');
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export default api;
