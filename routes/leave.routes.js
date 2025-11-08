import express from 'express';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { applyLeave, getLeaveById, getLeaveHistory, updateLeaveStatus } from '../controllers/leave.controller.js';

const router = express.Router()

router.post('/apply', authenticateMiddleware, applyLeave)
router.put('/:id', authenticateMiddleware, updateLeaveStatus)
router.get('/', authenticateMiddleware, getLeaveHistory)
router.get('/:id', authenticateMiddleware, getLeaveById)

export default router