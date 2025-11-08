import express from 'express'
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js'
import { createHiring, deleteHiring, getAllHirings, getHiringById, updateHiring } from '../controllers/hiring.controller.js'
import { upload } from '../middleware/multer.middleare.js'

const router = express.Router()

router.post('/create',authenticateMiddleware,upload.single('resume'), createHiring)
router.get('/', authenticateMiddleware, getAllHirings)
router.get('/:id', authenticateMiddleware, getHiringById)
router.put('/update/:id', authenticateMiddleware,upload.single('resume'), updateHiring)
router.delete('/:id', authenticateMiddleware, deleteHiring)
export default router