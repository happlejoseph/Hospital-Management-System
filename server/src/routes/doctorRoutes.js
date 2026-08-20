

import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";

import { createDoctor, getAllDoctors, getDoctorById, deleteDoctor } from "../controllers/doctorController.js";


const router = express.Router();


router.post("/", authMiddleware, authRoles("admin"), createDoctor);
router.get("/", authMiddleware, authRoles("admin"), getAllDoctors);
router.put("/:id", authMiddleware, authRoles("admin"), getDoctorById);
router.delete("/:id", authMiddleware, authRoles("admin"), deleteDoctor);




export default router;