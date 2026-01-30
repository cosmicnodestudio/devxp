import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { config } from './config/env';
import { logger, stream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';
import { pool } from './config/database';
import morgan from 'morgan';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: config.security.corsOrigin,
        credentials: true,
      })
    );

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    if (config.isDevelopment) {
      this.app.use(morgan('dev', { stream }));
    } else {
      this.app.use(morgan('combined', { stream }));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.security.rateLimit.windowMs,
      max: config.security.rateLimit.max,
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use('/api/', limiter);

    logger.info('Middlewares initialized');
  }

  private initializeRoutes() {
    // API routes
    this.app.use(config.apiPrefix, routes);

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'DevXP API Server',
        version: '1.0.0',
        environment: config.env,
        docs: `${req.protocol}://${req.get('host')}/api`,
      });
    });

    logger.info('Routes initialized');
  }

  private initializeErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    logger.info('Error handling initialized');
  }

  public async testDatabaseConnection() {
    try {
      const result = await pool.query('SELECT NOW()');
      logger.info('Database connection test successful', {
        timestamp: result.rows[0].now,
      });
      return true;
    } catch (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
  }

  public async shutdown() {
    logger.info('Shutting down gracefully...');

    try {
      await pool.end();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database connections:', error);
    }
  }
}

export default App;
