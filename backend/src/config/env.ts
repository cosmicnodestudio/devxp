import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  API_PREFIX: z.string().default('/api'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().default('devxp'),
  DB_USER: z.string().default('devxp_user'),
  DB_PASSWORD: z.string().default('devxp_password_123'),
  DB_POOL_MIN: z.string().transform(Number).default('2'),
  DB_POOL_MAX: z.string().transform(Number).default('10'),
  DB_SSL_MODE: z.string().default('disable'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),

  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_DIR: z.string().default('./logs'),
  LOG_FILE: z.string().default('devxp.log'),

  // Security
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // External Services
  PAGBANK_API_URL: z.string().optional(),
  PAGBANK_API_KEY: z.string().optional(),
  PAGBANK_TIMEOUT: z.string().transform(Number).default('5000'),

  IBM_API_URL: z.string().optional(),
  IBM_API_KEY: z.string().optional(),
  IBM_TIMEOUT: z.string().transform(Number).default('5000'),

  DEVOPS_API_URL: z.string().optional(),
  DEVOPS_API_TOKEN: z.string().optional(),
  DEVOPS_TIMEOUT: z.string().transform(Number).default('5000'),

  // Health Check
  HEALTH_CHECK_INTERVAL: z.string().transform(Number).default('5'),
  HEALTH_CHECK_TIMEOUT: z.string().transform(Number).default('3000'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.flatten().fieldErrors);
      process.exit(1);
    }
    throw error;
  }
};

const env = parseEnv();

// Export typed configuration
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    poolMin: env.DB_POOL_MIN,
    poolMax: env.DB_POOL_MAX,
    sslMode: env.DB_SSL_MODE,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  bcrypt: {
    rounds: env.BCRYPT_ROUNDS,
  },

  logging: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
    file: env.LOG_FILE,
  },

  security: {
    corsOrigin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },

  externalServices: {
    pagbank: {
      url: env.PAGBANK_API_URL,
      apiKey: env.PAGBANK_API_KEY,
      timeout: env.PAGBANK_TIMEOUT,
    },
    ibm: {
      url: env.IBM_API_URL,
      apiKey: env.IBM_API_KEY,
      timeout: env.IBM_TIMEOUT,
    },
    devops: {
      url: env.DEVOPS_API_URL,
      token: env.DEVOPS_API_TOKEN,
      timeout: env.DEVOPS_TIMEOUT,
    },
  },

  healthCheck: {
    interval: env.HEALTH_CHECK_INTERVAL,
    timeout: env.HEALTH_CHECK_TIMEOUT,
  },
} as const;

export default config;
