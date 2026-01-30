import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import apiService, { ApiStatistics } from '../services/apiService';
import healthService, { SystemHealth } from '../services/healthService';
import { Database, Activity, TrendingUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { useWebSocket } from '../hooks/useWebSocket';

const WS_URL = `ws://${window.location.hostname}:4000/ws`;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [apiStats, setApiStats] = useState<ApiStatistics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'system-health-update') {
      setSystemHealth(message.data);
    }
  }, []);

  const { isConnected } = useWebSocket(WS_URL, handleWebSocketMessage);

  useEffect(() => {
    console.log('[Dashboard] Component mounted');
    console.log('[Dashboard] Token exists:', !!localStorage.getItem('token'));
    console.log('[Dashboard] User exists:', !!localStorage.getItem('user'));
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('[Dashboard] Loading dashboard data...');
      console.log('[Dashboard] Making API calls...');
      const [stats, health] = await Promise.all([
        apiService.getStatistics(),
        healthService.getSystemHealth(),
      ]);
      console.log('[Dashboard] Data loaded successfully:', { stats, health });
      setApiStats(stats);
      setSystemHealth(health);
    } catch (error) {
      console.error('[Dashboard] Error loading data:', error);
      console.error('[Dashboard] Error details:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
      console.log('[Dashboard] Loading finished');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="text-green-600" size={24} />;
      case 'degraded':
        return <AlertCircle className="text-yellow-600" size={24} />;
      case 'down':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return <AlertCircle className="text-gray-600" size={24} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="mt-2 text-primary-100">
          Here's what's happening with your developer portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total APIs */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total APIs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{apiStats?.total || 0}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Database className="text-primary-600" size={24} />
            </div>
          </div>
        </div>

        {/* Active APIs */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active APIs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{apiStats?.active || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Services Up */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Services Up</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {systemHealth?.summary.up || 0}/{systemHealth?.summary.total || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-xl font-bold text-gray-900 mt-2 capitalize">
                {systemHealth?.status || 'Unknown'}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              {getHealthIcon(systemHealth?.status || 'unknown')}
            </div>
          </div>
        </div>
      </div>

      {/* API Categories */}
      {apiStats && Object.keys(apiStats.byCategory).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            API Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(apiStats.byCategory).map(([category, count]) => (
              <div key={category} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 capitalize">{category}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Services Status */}
      {systemHealth && systemHealth.services.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Status</h2>
          <div className="space-y-3">
            {systemHealth.services.map(service => (
              <div
                key={service.service.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'up' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{service.service.name}</p>
                    <p className="text-sm text-gray-500">{service.service.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium capitalize ${
                    service.status === 'up' ? 'text-green-600' :
                    service.status === 'degraded' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {service.status}
                  </p>
                  {service.response_time && (
                    <p className="text-xs text-gray-500">{service.response_time}ms</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
