import express from 'express';
import { addQuery, createTask, deleteTask, getTasks, replyQuery, taskById, updateTask, addComment, deleteComment, addAttachment, deleteAttachment, getTaskTemplates } from '../controllers/tasks.controller.js';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import multer from 'multer';
import {
  AddQueryBodySchema,
  AddCommentBodySchema,
  CreateTaskBodySchema,
  ReplyQueryBodySchema,
  ReplyQueryParamSchema,
  TaskIdParamSchema,
  TaskQuerySchema,
  UpdateTaskBodySchema,
} from '../validation/task.validation.js';

const upload = multer({ dest: 'upload/tasks/', limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

router.post(
  '/create',
  authenticateMiddleware,
  authorize('super-admin', 'admin', 'manager', 'hr', 'employee'),
  validate({ body: CreateTaskBodySchema }),
  createTask
);
router.get('/templates', authenticateMiddleware, getTaskTemplates);
router.get('/', authenticateMiddleware, validate({ query: TaskQuerySchema }), getTasks);
router.post('/query/:id', authenticateMiddleware, validate({ params: TaskIdParamSchema, body: AddQueryBodySchema }), addQuery);
router.post('/reply/:taskId/:queryId', authenticateMiddleware, authorize('admin', 'manager'), validate({ params: ReplyQueryParamSchema, body: ReplyQueryBodySchema }), replyQuery);
router.post('/:id/comments', authenticateMiddleware, validate({ params: TaskIdParamSchema, body: AddCommentBodySchema }), addComment);
router.delete('/:id/comments/:commentId', authenticateMiddleware, deleteComment);
router.post('/:id/attachments', authenticateMiddleware, upload.single('file'), addAttachment);
router.delete('/:id/attachments/:attachmentId', authenticateMiddleware, deleteAttachment);
router.put('/:id', authenticateMiddleware, validate({ params: TaskIdParamSchema, body: UpdateTaskBodySchema }), updateTask);
router.get('/:id', authenticateMiddleware, validate({ params: TaskIdParamSchema }), taskById);
router.delete('/:id', authenticateMiddleware, authorize('admin', 'manager'), validate({ params: TaskIdParamSchema }), deleteTask);

export default router;
