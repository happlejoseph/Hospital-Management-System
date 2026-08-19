

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { authRoles } from '../middleware/roleMiddleware.js';
import { deleteUser, getAllUsers, getProfile, getUserById, updateProfile, updateUser } from '../controllers/userController.js';



const router = express.Router();



router.get('/', authMiddleware, authRoles('admin'), getAllUsers);

router.get('/profile', authMiddleware, getProfile);

router.put('/profile', authMiddleware, updateProfile);

router.post('/:id', authMiddleware, authRoles('admin'), updateUser)

router.get('/:id', authMiddleware, authRoles('admin'), getUserById);

router.delete('/:id', authMiddleware, authRoles('admin'), deleteUser);



export default router;