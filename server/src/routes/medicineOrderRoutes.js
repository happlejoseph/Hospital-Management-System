

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {createMedicineOrder, getMyMedicineOrders, getAllMedicineOrders, updateMedicineOrderStatus, updateMedicinePaymentStatus} from "../controllers/medicineOrderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();



const uploadDirectory = "uploads/prescriptions";

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        const fileName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post("/", authMiddleware, authRoles("patient"), upload.single("prescription"), createMedicineOrder);

router.get("/my", authMiddleware, authRoles("patient"), getMyMedicineOrders);

router.get("/", authMiddleware, authRoles("admin", "pharmacist"), getAllMedicineOrders);

router.put("/:id/status", authMiddleware, authRoles("admin", "pharmacist"), updateMedicineOrderStatus);

router.put("/:id/payment-status", authMiddleware, authRoles("admin", "pharmacist"), updateMedicinePaymentStatus);



export default router;