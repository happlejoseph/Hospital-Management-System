

import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";

import { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor, getPublicDoctors, getPublicDoctorById, getPublicDoctorAvailability, getMySchedule, updateMySchedule, getMyPatients, getMyPatientHistory } from "../controllers/doctorController.js";


const router = express.Router();

router.get('/public', getPublicDoctors);

router.get('/public/:id', getPublicDoctorById);

router.get('/public/:id/availability', getPublicDoctorAvailability);

router.get("/me/schedule", authMiddleware, authRoles("doctor"), getMySchedule);

router.put("/me/schedule", authMiddleware, authRoles("doctor"), updateMySchedule);

router.get("/me/patients", authMiddleware, authRoles("doctor"), getMyPatients);

router.get("/me/patients/:patientId/history", authMiddleware, authRoles("doctor"), getMyPatientHistory);

router.post("/", authMiddleware, authRoles("admin"), createDoctor);

router.get("/", authMiddleware, authRoles("admin"), getAllDoctors);

router.get("/:id", authMiddleware, authRoles("admin"), getDoctorById);

router.put("/:id", authMiddleware, authRoles("admin"), updateDoctor);

router.delete("/:id", authMiddleware, authRoles("admin"), deleteDoctor);


export default router;