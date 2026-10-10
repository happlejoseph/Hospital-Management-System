

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";
import {createAppointment, getMyAppointments, getDoctorAppointments, getAllAppointments, updateAppointmentStatus, updateDoctorAppointmentStatus, cancelMyAppointment} from "../controllers/appointmentController.js";


const router = express.Router();


router.post("/", authMiddleware, authRoles("patient"), createAppointment);

router.get("/mine", authMiddleware, authRoles("patient"), getMyAppointments);

router.get("/admin/all", authMiddleware, authRoles("admin"), getAllAppointments);

router.put("/admin/:id/status", authMiddleware, authRoles("admin"), updateAppointmentStatus);

router.get("/doctor", authMiddleware, authRoles("doctor"), getDoctorAppointments);

router.put("/doctor/:id/status", authMiddleware, authRoles("doctor"), updateDoctorAppointmentStatus);

router.put("/:id/cancel", authMiddleware, authRoles("patient"), cancelMyAppointment);


export default router;
