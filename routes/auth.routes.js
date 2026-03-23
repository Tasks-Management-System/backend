import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
  refreshToken,
  verifyUserEmail,
} from '../controllers/auth.controller.js';
import { authenticateMiddleware } from '../middleware/authenticate.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { uploadImage } from '../middleware/multer.middleare.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  LoginBodySchema,
  RegisterBodySchema,
  UpdateUserBodySchema,
  UserIdParamSchema,
  RefreshTokenBodySchema,
} from '../validation/auth.validation.js';

const router = express.Router();

router.post('/register', validate({ body: RegisterBodySchema }), registerUser);
router.post('/login', validate({ body: LoginBodySchema }), loginUser);
router.get('/verify-email', verifyUserEmail);
router.post('/logout', authenticateMiddleware, logoutUser);
router.post('/refresh-token', validate({ body: RefreshTokenBodySchema }), refreshToken);

router.get('/', authenticateMiddleware, authorize('admin', 'hr'), getAllUsers);
router.get('/:id', authenticateMiddleware, validate({ params: UserIdParamSchema }), getUser);
router.put('/:id', authenticateMiddleware, uploadImage.single('profileImage'), validate({ params: UserIdParamSchema, body: UpdateUserBodySchema }), updateUser);
router.delete('/:id', authenticateMiddleware, authorize('admin'), validate({ params: UserIdParamSchema }), deleteUser);

export default router;
