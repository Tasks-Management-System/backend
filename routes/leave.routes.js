import express from 'express';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { applyLeave, getLeaveById, getLeaveHistory, updateLeaveStatus } from '../controllers/leave.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  ApplyLeaveBodySchema,
  LeaveIdParamSchema,
  UpdateLeaveStatusBodySchema,
} from '../validation/leave.validation.js';

const router = express.Router();

router.post('/apply', authenticateMiddleware, authorize('employee', 'hr', 'manager'), validate({ body: ApplyLeaveBodySchema }), applyLeave);
router.put('/:id', authenticateMiddleware, authorize('admin', 'hr'), validate({ params: LeaveIdParamSchema, body: UpdateLeaveStatusBodySchema }), updateLeaveStatus);
router.get('/', authenticateMiddleware, getLeaveHistory);
router.get('/:id', authenticateMiddleware, validate({ params: LeaveIdParamSchema }), getLeaveById);

export default router;
