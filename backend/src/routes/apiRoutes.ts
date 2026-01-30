import { Router } from 'express';
import apiController from '../controllers/apiController';
import { authenticateToken } from '../middlewares/auth';
import { validate } from '../middlewares/validator';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createApiSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    base_url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    headers: z.record(z.string()).optional(),
    status: z.enum(['active', 'inactive', 'deprecated']).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateApiSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    base_url: z.string().url().optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    headers: z.record(z.string()).optional(),
    status: z.enum(['active', 'inactive', 'deprecated']).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', apiController.getAllApis);
router.get('/statistics', apiController.getStatistics);
router.get('/:id', validate(idParamSchema), apiController.getApiById);
router.post('/', validate(createApiSchema), apiController.createApi);
router.put('/:id', validate(idParamSchema.merge(updateApiSchema)), apiController.updateApi);
router.delete('/:id', validate(idParamSchema), apiController.deleteApi);

export default router;
