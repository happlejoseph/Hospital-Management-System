

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createAppointment, getMyAppointments } from "../controllers/appointmentController.js";
import { authRoles } from "../middleware/roleMiddleware.js";





const router = express.Router();


router.post('/', authMiddleware, authRole('patient'), createAppointment);

router.get('/mine', authMiddleware, authRole('patient'), getMyAppointments);


export default router;