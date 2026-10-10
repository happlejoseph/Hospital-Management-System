

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { authRoles } from '../middleware/roleMiddleware.js';
import { createAdmin, createPharmacist, deleteUser, getAllAdmins, getAllPharmacists, getAllUsers, getProfile, getUserById, updateProfile, updateUser } from '../controllers/userController.js';



const router = express.Router();



router.get('/', authMiddleware, authRoles('admin'), getAllUsers);
router.get('/admins', authMiddleware, authRoles('admin'), getAllAdmins);
router.post('/admin', authMiddleware, authRoles('admin'), createAdmin);
router.get('/pharmacists', authMiddleware, authRoles('admin'), getAllPharmacists);
router.post('/pharmacist', authMiddleware, authRoles('admin'), createPharmacist);

router.get('/profile', authMiddleware, getProfile);

router.put('/profile', authMiddleware, updateProfile);

router.put('/:id', authMiddleware, authRoles('admin'), updateUser);

router.get('/:id', authMiddleware, authRoles('admin'), getUserById);

router.delete('/:id', authMiddleware, authRoles('admin'), deleteUser);



export default router;