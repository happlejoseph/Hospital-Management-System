

import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import { authRoles } from "../middleware/roleMiddleware.js";
import { createMedicine, deleteMedicine, dispenseMedicine, getInventoryReport, getMedicines, getPublicMedicineById, getPublicMedicines, purchaseMedicine, updateMedicine } from "../controllers/medicineController.js";

const router = express.Router();



const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are allowed"));
        }
    }
});

const handleImageUpload = (req, res, next) => {
    imageUpload.single("image")(req, res, (error) => {
        if(error) {
            return res.status(400).json({
                message: error.message
            });
        }

        next();
    });
};




router.get("/public", getPublicMedicines);

router.get("/public/:id", getPublicMedicineById);

router.get("/", authMiddleware, authRoles("admin", "pharmacist"), getMedicines);

router.post("/", authMiddleware, authRoles("pharmacist"), handleImageUpload, createMedicine);

router.get("/reports/inventory", authMiddleware, authRoles("admin", "pharmacist"), getInventoryReport);

router.put("/:id", authMiddleware, authRoles("pharmacist"), updateMedicine);

router.delete("/:id", authMiddleware, authRoles("pharmacist"), deleteMedicine);

router.post("/:id/purchase", authMiddleware, authRoles("pharmacist"), purchaseMedicine);

router.post("/:id/dispense", authMiddleware, authRoles("pharmacist"), dispenseMedicine);



export default router;
