

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";
import { createDoctorMedicalRecord, deleteDoctorMedicalRecord, getDoctorMedicalRecords, updateDoctorMedicalRecord } from "../controllers/medicalRecordController.js";

const router = express.Router();



router.get("/doctor", authMiddleware, authRoles("doctor"), getDoctorMedicalRecords);

router.post("/doctor", authMiddleware, authRoles("doctor"), createDoctorMedicalRecord);

router.put("/doctor/:id", authMiddleware, authRoles("doctor"), updateDoctorMedicalRecord);

router.delete("/doctor/:id", authMiddleware, authRoles("doctor"), deleteDoctorMedicalRecord);



export default router;
