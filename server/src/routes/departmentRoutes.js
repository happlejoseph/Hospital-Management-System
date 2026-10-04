

import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { authRoles } from '../middleware/roleMiddleware.js';
import { createDepartment, deleteDepartment, getAllDepartmentsAdmin, getDepartmentBySlug, getDepartments, updateDepartment } from "../controllers/departmentController.js";




const router = express.Router();


router.get('/', getDepartments);

router.get('/slug/:slug', authMiddleware, authRoles('admin'), getDepartmentBySlug);

router.get("/admin/all", authMiddleware, authRoles("admin"), getAllDepartmentsAdmin);

router.post("/", authMiddleware, authRoles("admin"), createDepartment);

router.put("/:id", authMiddleware, authRoles("admin"), updateDepartment);

router.delete("/:id", authMiddleware, authRoles("admin"), deleteDepartment);
