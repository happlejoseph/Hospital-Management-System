

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";
import {createMedicalRecord, getMedicalRecords, updateMedicalRecord, deleteMedicalRecord} from "../controllers/medicalRecordController.js";


const router = express.Router();


router.get("/", authMiddleware, authRoles("admin"), getMedicalRecords);

router.post("/", authMiddleware, authRoles("admin"), createMedicalRecord);

router.put("/:id", authMiddleware, authRoles("admin"), updateMedicalRecord);

router.delete("/:id", authMiddleware, authRoles("admin"), deleteMedicalRecord);


export default router;
