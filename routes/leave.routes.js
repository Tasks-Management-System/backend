import express from 'express';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import {
  applyLeave,
  getLeaveById,
  getLeaveHistory,
  getPendingLeaveRequests,
  leaveEmailAction,
  updateLeaveStatus,
} from '../controllers/leave.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  ApplyLeaveBodySchema,
  LeaveHistoryQuerySchema,
  LeaveIdParamSchema,
  UpdateLeaveStatusBodySchema,
} from '../validation/leave.validation.js';

const router = express.Router();

router.get('/email-action', leaveEmailAction);
router.post('/apply', authenticateMiddleware, authorize('employee', 'hr', 'manager'), validate({ body: ApplyLeaveBodySchema }), applyLeave);
router.get('/pending', authenticateMiddleware, authorize('admin', 'hr', 'super-admin'), getPendingLeaveRequests);
router.put('/:id', authenticateMiddleware, authorize('admin', 'hr', 'super-admin'), validate({ params: LeaveIdParamSchema, body: UpdateLeaveStatusBodySchema }), updateLeaveStatus);
router.get('/', authenticateMiddleware, validate({ query: LeaveHistoryQuerySchema }), getLeaveHistory);
router.get('/:id', authenticateMiddleware, validate({ params: LeaveIdParamSchema }), getLeaveById);

export default router;
