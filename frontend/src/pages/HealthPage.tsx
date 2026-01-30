import { useEffect, useState, useCallback } from 'react';
import healthService, { SystemHealth } from '../services/healthService';
import { Activity, RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { formatDateTime, getStatusColor } from '../utils/helpers';
import { useWebSocket } from '../hooks/useWebSocket';

const WS_URL = `ws://${window.location.hostname}:4000/ws`;

export default function HealthPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'system-health-update') {
      setSystemHealth(message.data);
      setLastCheck(new Date());
    }
  }, []);

  const { isConnected } = useWebSocket(WS_URL, handleWebSocketMessage);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const data = await healthService.getSystemHealth();
      setSystemHealth(data);
      setLastCheck(new Date());
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setChecking(true);
      // Force a new health check on all services
      await healthService.checkAllServices();
      // Then reload the health data
      const data = await healthService.getSystemHealth();
      setSystemHealth(data);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking health:', error);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle2 className="text-green-600" size={20} />;
      case 'down':
        return <XCircle className="text-red-600" size={20} />;
      case 'degraded':
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <AlertCircle className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600">Real-time service monitoring</p>
            <div className={`flex items-center space-x-1 text-sm ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isConnected ? 'Live' : 'Disconnected'}</span>
            </div>
          </div>
          {lastCheck && (
            <p className="text-sm text-gray-500 mt-1 flex items-center space-x-1">
              <Clock size={14} />
              <span>Last update: {formatDateTime(lastCheck.toISOString())}</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={checking ? 'animate-spin' : ''} size={20} />
            <span>{checking ? 'Checking...' : 'Check Now'}</span>
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Overall System Status</h2>
            <p className={`text-3xl font-bold capitalize ${
              systemHealth?.status === 'healthy' ? 'text-green-600' :
              systemHealth?.status === 'degraded' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {systemHealth?.status}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Activity size={48} className={
              systemHealth?.status === 'healthy' ? 'text-green-600' :
              systemHealth?.status === 'degraded' ? 'text-yellow-600' :
              'text-red-600'
            } />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Services</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {systemHealth?.summary.total || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600">Services Up</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {systemHealth?.summary.up || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600">Degraded</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {systemHealth?.summary.degraded || 0}
          </p>
        </div>

        <div className="card">
          <p className="text-sm font-medium text-gray-600">Services Down</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {systemHealth?.summary.down || 0}
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
        <div className="space-y-4">
          {systemHealth?.services.map(service => (
            <div
              key={service.service.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(service.status)}
                    <h3 className="font-semibold text-gray-900">{service.service.name}</h3>
                    {service.service.is_critical && (
                      <span className="badge bg-red-100 text-red-700">Critical</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Type: </span>
                      <span className="text-gray-900">{service.service.type || 'N/A'}</span>
                    </div>

                    <div>
                      <span className="text-gray-500">URL: </span>
                      <a
                        href={service.service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-mono text-xs"
                      >
                        {service.service.url}
                      </a>
                    </div>

                    {service.response_time && (
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-500">Response: </span>
                        <span className="text-gray-900">{service.response_time}ms</span>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-500">Last checked: </span>
                      <span className="text-gray-900">
                        {formatDateTime(service.checked_at)}
                      </span>
                    </div>
                  </div>

                  {service.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Error:</strong> {service.error_message}
                    </div>
                  )}
                </div>

                <div>
                  <span className={`badge ${getStatusColor(service.status)}`}>
                    {service.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
