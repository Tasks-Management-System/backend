import express from 'express';
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from '../controllers/project.controller.js';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  CreateProjectBodySchema,
  PaginationQuerySchema,
  ProjectIdParamSchema,
  UpdateProjectBodySchema,
} from '../validation/project.validation.js';

const router = express.Router();

router.post('/create', authenticateMiddleware, authorize('super-admin', 'admin', 'manager'), validate({ body: CreateProjectBodySchema }), createProject);
router.get('/', authenticateMiddleware, validate({ query: PaginationQuerySchema }), getAllProjects);
router.get('/:id', authenticateMiddleware, validate({ params: ProjectIdParamSchema }), getProjectById);
router.put('/:id', authenticateMiddleware, authorize('super-admin', 'admin', 'manager'), validate({ params: ProjectIdParamSchema, body: UpdateProjectBodySchema }), updateProject);
router.delete('/:id', authenticateMiddleware, authorize('super-admin', 'admin', 'manager'), validate({ params: ProjectIdParamSchema }), deleteProject);

export default router;
