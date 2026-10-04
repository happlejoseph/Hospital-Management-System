

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";
import {createAppointment, getMyAppointments, getAllAppointments, updateAppointmentStatus} from "../controllers/appointmentController.js";

const router = express.Router();


router.post("/", authMiddleware, authRoles("patient"), createAppointment);

router.get("/mine", authMiddleware, authRoles("patient"), getMyAppointments);

router.get("/admin/all", authMiddleware, authRoles("admin"), getAllAppointments);

router.put("/admin/:id/status", authMiddleware, authRoles("admin"), updateAppointmentStatus);


export default router;
