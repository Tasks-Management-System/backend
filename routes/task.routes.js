import express from 'express';
import { addQuery, createTask, deleteTask, getTasks, replyQuery, taskById, updateTask } from '../controllers/tasks.controller.js';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  AddQueryBodySchema,
  CreateTaskBodySchema,
  ReplyQueryBodySchema,
  ReplyQueryParamSchema,
  TaskIdParamSchema,
  TaskQuerySchema,
  UpdateTaskBodySchema,
} from '../validation/task.validation.js';

const router = express.Router();

router.post('/create', authenticateMiddleware, authorize('admin', 'manager'), validate({ body: CreateTaskBodySchema }), createTask);
router.get('/', authenticateMiddleware, validate({ query: TaskQuerySchema }), getTasks);
router.post('/query/:id', authenticateMiddleware, validate({ params: TaskIdParamSchema, body: AddQueryBodySchema }), addQuery);
router.post('/reply/:taskId/:queryId', authenticateMiddleware, authorize('admin', 'manager'), validate({ params: ReplyQueryParamSchema, body: ReplyQueryBodySchema }), replyQuery);
router.put('/:id', authenticateMiddleware, validate({ params: TaskIdParamSchema, body: UpdateTaskBodySchema }), updateTask);
router.get('/:id', authenticateMiddleware, validate({ params: TaskIdParamSchema }), taskById);
router.delete('/:id', authenticateMiddleware, authorize('admin', 'manager'), validate({ params: TaskIdParamSchema }), deleteTask);

export default router;
