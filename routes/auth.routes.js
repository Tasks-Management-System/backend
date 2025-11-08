import express from 'express';
import { deleteUser, getAllUsers, getUser, loginUser, logoutUser, registerUser, updateUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);
router.post('/logout', logoutUser);
export default router;