import App from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import healthService from './services/healthService';
import { wsService } from './services/websocketService';

const app = new App();

// Start server
const server = app.app.listen(config.port, async () => {
  logger.info(`🚀 Server is running on port ${config.port}`);
  logger.info(`📝 Environment: ${config.env}`);
  logger.info(`🌐 API URL: http://localhost:${config.port}${config.apiPrefix}`);

  // Initialize WebSocket
  wsService.initialize(server);

  // Test database connection
  const dbConnected = await app.testDatabaseConnection();
  if (!dbConnected) {
    logger.error('❌ Database connection failed. Shutting down...');
    process.exit(1);
  }

  logger.info('✅ Server started successfully');

  // Start periodic health checks (every 5 minutes)
  if (!config.isTest) {
    setInterval(async () => {
      try {
        logger.debug('Running periodic health checks...');
        await healthService.checkAllServicesHealth();

        // Broadcast update to all WebSocket clients
        const systemHealth = await healthService.getSystemHealth();
        wsService.notifySystemHealthUpdate(systemHealth);
        logger.debug('Health check broadcast sent to WebSocket clients');
      } catch (error) {
        logger.error('Error in periodic health checks:', error);
      }
    }, config.healthCheck.interval * 60 * 1000);

    logger.info(`⏰ Health checks scheduled every ${config.healthCheck.interval} minutes`);
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    await app.shutdown();

    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

export default server;
