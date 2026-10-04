

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";


const router = express.Router();


router.get("/", authMiddleware, authRoles("admin"), getAdminDashboard);


export default router;
