import { Router } from 'express';
import healthController from '../controllers/healthController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { z } from 'zod';

const router = Router();

// Validation schemas
const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Public health check endpoint
router.get('/', healthController.healthCheck);

// Protected endpoints
router.get('/system', authenticateToken, healthController.getSystemHealth);
router.get('/services', authenticateToken, healthController.getServicesStatus);
router.post('/services/check', authenticateToken, healthController.checkAllServices);
router.get('/services/:id', authenticateToken, validate(idParamSchema), healthController.checkServiceHealth);
router.get('/services/:id/history', authenticateToken, validate(idParamSchema), healthController.getServiceHistory);

export default router;
