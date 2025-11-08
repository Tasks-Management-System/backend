import express from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from "../controllers/project.controller.js";
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js";

const router  = express.Router()

router.post('/create', authenticateMiddleware, createProject)
router.get('/', authenticateMiddleware, getAllProjects)
router.get('/:id', authenticateMiddleware, getProjectById)
router.put('/:id', authenticateMiddleware, updateProject)
router.delete('/:id', authenticateMiddleware, deleteProject)


export default router;