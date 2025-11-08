import express from 'express';
import { addQuery, createTask, deleteTask, getTasks, replyQuery, taskById, updateTask } from '../controllers/tasks.controller.js';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';

const router = express.Router()

router.post('/create',authenticateMiddleware, createTask)
router.get('/',authenticateMiddleware, getTasks)
router.put('/:id',authenticateMiddleware, updateTask)
router.get('/:id',authenticateMiddleware, taskById)
router.delete('/:id',authenticateMiddleware, deleteTask)
router.post('/query/:id',authenticateMiddleware, addQuery)
router.post('/reply/:taskId/:queryId',authenticateMiddleware, replyQuery)

export default router