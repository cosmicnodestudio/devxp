import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        logger.info('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial connection message
      ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected' }));
    });

    logger.info('WebSocket server initialized on /ws');
  }

  broadcast(type: string, data: any) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    logger.info(`Broadcast ${type} to ${this.clients.size} clients`);
  }

  notifyHealthUpdate(serviceId: string, status: string) {
    this.broadcast('health-update', { serviceId, status });
  }

  notifySystemHealthUpdate(systemHealth: any) {
    this.broadcast('system-health-update', systemHealth);
  }
}

export const wsService = new WebSocketService();
