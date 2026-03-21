import express from 'express';
import { endBreak, getAttendance, punchIn, punchOut, startBreak } from '../controllers/attendence.controller.js';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import '../validation/attendance.validation.js';

const router = express.Router();

router.post('/punch-in', authenticateMiddleware, punchIn);
router.post('/start-break', authenticateMiddleware, startBreak);
router.post('/end-break', authenticateMiddleware, endBreak);
router.post('/punch-out', authenticateMiddleware, punchOut);
router.get('/', authenticateMiddleware, getAttendance);

export default router;
