import { Router } from 'express';
import authRoutes from './authRoutes';
import apiRoutes from './apiRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/apis', apiRoutes);
router.use('/health', healthRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DevXP API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      apis: '/api/apis',
      health: '/api/health',
    },
  });
});

export default router;
