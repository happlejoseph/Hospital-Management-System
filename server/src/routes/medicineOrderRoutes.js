

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {createMedicineOrder, getMyMedicineOrders, getAllMedicineOrders, getMedicineOrderPrescription, cancelMyMedicineOrder, updateMedicineOrderStatus, updateMedicinePaymentStatus} from "../controllers/medicineOrderController.js";

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

const removeFile = (file) => {
    if (file?.path) {
        fs.unlink(file.path, () => {});
    }
};

const isPdfFile = (file) => {
    const header = Buffer.alloc(5);
    const fileDescriptor = fs.openSync(file.path, "r");

    try {
        fs.readSync(fileDescriptor, header, 0, 5, 0);
    }
    finally {
        fs.closeSync(fileDescriptor);
    }

    return header.toString("utf8") === "%PDF-";
};

const handleUpload = (req, res, next) => {
    upload.single("prescription")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.code === "LIMIT_FILE_SIZE" ? "Prescription PDF must be smaller than 5 MB" : error.message
            });
        }

        if (req.file && !isPdfFile(req.file)) {
            removeFile(req.file);

            return res.status(400).json({
                message: "Only valid PDF files are allowed"
            });
        }

        next();
    });
};




router.post("/", authMiddleware, authRoles("patient"), handleUpload, createMedicineOrder);

router.get("/my", authMiddleware, authRoles("patient"), getMyMedicineOrders);

router.get("/", authMiddleware, authRoles("admin", "pharmacist"), getAllMedicineOrders);

router.get("/:id/prescription", authMiddleware, authRoles("patient", "admin", "pharmacist"), getMedicineOrderPrescription);

router.put("/:id/cancel", authMiddleware, authRoles("patient"), cancelMyMedicineOrder);

router.put("/:id/status", authMiddleware, authRoles("admin", "pharmacist"), updateMedicineOrderStatus);

router.put("/:id/payment-status", authMiddleware, authRoles("admin", "pharmacist"), updateMedicinePaymentStatus);



export default router;