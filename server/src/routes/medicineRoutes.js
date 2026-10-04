

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";
import { createMedicine, dispenseMedicine, getInventoryReport, getMedicines, purchaseMedicine } from "../controllers/medicineController.js";


const router = express.Router();


router.get("/", authMiddleware, authRoles("admin", "pharmacist"), getMedicines);

router.post("/", authMiddleware, authRoles("admin", "pharmacist"), createMedicine);

router.post("/:id/purchase", authMiddleware, authRoles("admin", "pharmacist"), purchaseMedicine);

router.post("/:id/dispense", authMiddleware, authRoles("admin", "pharmacist"), dispenseMedicine);

router.get("/reports/inventory", authMiddleware, authRoles("admin", "pharmacist"), getInventoryReport);



export default router;
