

import express from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { authRoles } from '../middleware/roleMiddleware';
import { getAllUsers } from '../controllers/userController';



const router = express.Router();

router.get('/', authMiddleware, authRoles('admin'), getAllUsers);


export default router;