import express from 'express';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import {
  createSalary,
  deleteSalary,
  generatePDF,
  getSalary,
  getSalaryById,
  updateSalary,
} from '../controllers/salary.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  CreateSalaryBodySchema,
  SalaryIdParamSchema,
  SalaryQuerySchema,
  UpdateSalaryBodySchema,
} from '../validation/salary.validation.js';

const router = express.Router();

router.post('/create', authenticateMiddleware, authorize('admin', 'hr'), validate({ body: CreateSalaryBodySchema }), createSalary);
router.get('/', authenticateMiddleware, authorize('admin', 'hr'), validate({ query: SalaryQuerySchema }), getSalary);
// /pdf/:id must be declared before /:id to avoid route shadowing
router.get('/pdf/:id', authenticateMiddleware, validate({ params: SalaryIdParamSchema }), generatePDF);
router.get('/:id', authenticateMiddleware, validate({ params: SalaryIdParamSchema }), getSalaryById);
router.put('/:id', authenticateMiddleware, authorize('admin', 'hr'), validate({ params: SalaryIdParamSchema, body: UpdateSalaryBodySchema }), updateSalary);
router.delete('/:id', authenticateMiddleware, authorize('admin'), validate({ params: SalaryIdParamSchema }), deleteSalary);

export default router;
