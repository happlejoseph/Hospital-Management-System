

import mongoose from "mongoose";
import Medicine from "../models/Medicine.js";
import MedicineTransaction from "../models/MedicineTransaction.js";
import cloudinary from "../config/cloudinary.js";




export const getMedicines = async(req, res) => {

    try {
        
        const medicines = await Medicine.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "Medicines fetched successfully",
            medicines
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const getPublicMedicines = async(req, res) => {

    try {

        const medicines = await Medicine.find({ expiryDate: { $gt: new Date() } })
            .select("name image description category sellingPrice quantity requiresPrescription expiryDate")
            .sort({ name: 1 });

        res.status(200).json({
            medicines
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const getPublicMedicineById = async(req, res) => {

    try {

        const { id } = req.params;

        if(!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        const medicine = await Medicine.findOne({ _id: id, expiryDate: { $gt: new Date() } })
            .select("name image description category sellingPrice quantity requiresPrescription expiryDate");

        if(!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        res.status(200).json({
            medicine
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const createMedicine = async(req, res) => {

    try {

        const { name, description = "", category = "", batchNumber, expiryDate, quantity, supplier, purchasePrice, sellingPrice, requiresPrescription = false, lowStockThreshold } = req.body;

        if(!name?.trim() || !batchNumber?.trim() || !expiryDate || quantity === undefined || !supplier?.trim() || purchasePrice === undefined || sellingPrice === undefined) {
            return res.status(400).json({
                message: "All medicine fields are required"
            });
        }

        const quantityNumber = Number(quantity);
        const purchasePriceNumber = Number(purchasePrice);
        const sellingPriceNumber = Number(sellingPrice);
        const thresholdNumber = lowStockThreshold === undefined || lowStockThreshold === "" ? 10 : Number(lowStockThreshold);
        const parsedExpiryDate = new Date(expiryDate);

        if(!Number.isInteger(quantityNumber) || quantityNumber < 0) {
            return res.status(400).json({
                message: "Quantity must be a whole number zero or greater"
            });
        }

        if(!Number.isFinite(purchasePriceNumber) || purchasePriceNumber < 0 || !Number.isFinite(sellingPriceNumber) || sellingPriceNumber < 0) {
            return res.status(400).json({
                message: "Medicine prices must be valid numbers"
            });
        }

        if(!Number.isInteger(thresholdNumber) || thresholdNumber < 0) {
            return res.status(400).json({
                message: "Low stock threshold must be a whole number zero or greater"
            });
        }

        if(Number.isNaN(parsedExpiryDate.getTime()) || parsedExpiryDate <= new Date()) {
            return res.status(400).json({
                message: "Expiry date must be a valid future date"
            });
        }

        let image = "";

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "hospital/medicines",
                        resource_type: "image"
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            });

            image = result.secure_url;
        }

        const medicine = await Medicine.create({
            name: name.trim(),
            image,
            description: String(description).trim(),
            category: String(category).trim(),
            batchNumber: batchNumber.trim(),
            expiryDate: parsedExpiryDate,
            quantity: quantityNumber,
            supplier: supplier.trim(),
            purchasePrice: purchasePriceNumber,
            sellingPrice: sellingPriceNumber,
            requiresPrescription: requiresPrescription === true || requiresPrescription === "true",
            lowStockThreshold: thresholdNumber
        });

        await MedicineTransaction.create({
            medicine: medicine._id,
            type: "purchase",
            quantity: quantityNumber,
            supplier: supplier.trim(),
            purchasePrice: purchasePriceNumber,
            sellingPrice: sellingPriceNumber,
            createdBy: req.user.id,
            notes: "Initial stock"
        });

        res.status(201).json({
            message: "Medicine added successfully",
            medicine
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};







export const purchaseMedicine = async(req, res) => {

    try {

        const { id } = req.params;

        const { quantity, supplier, purchasePrice } = req.body;

        if(!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "Quantity must be a whole number greater than zero"
            });
        }

        if(purchasePrice !== undefined && purchasePrice !== "" && (!Number.isFinite(Number(purchasePrice)) || Number(purchasePrice) < 0)) {
            return res.status(400).json({
                message: "Purchase price must be a valid number"
            });
        }

        const medicine = await Medicine.findById(id);

        if(!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        medicine.quantity += Number(quantity);

        if(supplier) {
            medicine.supplier = supplier;
        }

        if(purchasePrice !== undefined && purchasePrice !== "") {
            medicine.purchasePrice = Number(purchasePrice);
        }

        await medicine.save();

        await MedicineTransaction.create({
            medicine: medicine._id,
            type: "purchase",
            quantity: Number(quantity),
            supplier: supplier || medicine.supplier,
            purchasePrice: medicine.purchasePrice,
            sellingPrice: medicine.sellingPrice,
            createdBy: req.user.id
        });

        res.status(200).json({
            message: "Medicine stock updated successfully",
            medicine
        });
    }


    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};






export const dispenseMedicine = async(req, res) => {

    try {

        const { id } = req.params;
        const { quantity, patientName, notes } = req.body;

        if(!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "Quantity must be a whole number greater than zero"
            });
        }

        if(!patientName) {
            return res.status(400).json({
                message: "Patient name is required"
            });
        }

        const medicine = await Medicine.findOneAndUpdate(
            {
                _id: id,
                quantity: { $gte: Number(quantity) },
                expiryDate: { $gt: new Date() }
            },
            {
                $inc: { quantity: -Number(quantity) }
            },
            {
                new: true
            }
        );

        if(!medicine) {
            const existingMedicine = await Medicine.findById(id);

            if(!existingMedicine) {
                return res.status(404).json({
                    message: "Medicine not found"
                });
            }

            if(new Date(existingMedicine.expiryDate) <= new Date()) {
                return res.status(400).json({
                    message: "Medicine has expired"
                });
            }

            return res.status(400).json({
                message: "Not enough medicine stock"
            });
        }

        await MedicineTransaction.create({
            medicine: medicine._id,
            type: "dispense",
            quantity: Number(quantity),
            patientName,
            sellingPrice: medicine.sellingPrice,
            createdBy: req.user.id,
            notes
        });

        res.status(200).json({
            message: "Medicine dispensed successfully",
            medicine
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};





export const getInventoryReport = async(req, res) => {

    try {

        const medicines = await Medicine.find().sort({ quantity: 1, name: 1 });
        const transactions = await MedicineTransaction.find()
            .populate("medicine", "name batchNumber")
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 })
            .limit(100);

        const lowStock = medicines.filter((medicine) => medicine.quantity <= medicine.lowStockThreshold);
        
        const expired = medicines.filter((medicine) => new Date(medicine.expiryDate) < new Date());

        res.status(200).json({
            message: "Inventory report fetched successfully",

            summary: {
                totalMedicines: medicines.length,
                totalUnits: medicines.reduce((total, medicine) => total + medicine.quantity, 0),
                lowStockCount: lowStock.length,
                expiredCount: expired.length
            },
            medicines,
            lowStock,
            expired,
            transactions
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};


export const deleteMedicine = async(req, res) => {

    try {

        const medicine = await Medicine.findByIdAndDelete(req.params.id);

        if(!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        res.status(200).json({
            message: "Medicine deleted successfully"
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};


export const updateMedicine = async(req, res) => {

    try {

        const { id } = req.params;
        const { name, description, category, expiryDate, sellingPrice, requiresPrescription, lowStockThreshold } = req.body;

        if(!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        const medicine = await Medicine.findById(id);

        if(!medicine) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        if(name !== undefined) {
            if(!String(name).trim()) {
                return res.status(400).json({
                    message: "Medicine name is required"
                });
            }

            medicine.name = String(name).trim();
        }

        if(description !== undefined) {
            medicine.description = String(description).trim();
        }

        if(category !== undefined) {
            medicine.category = String(category).trim();
        }

        if(expiryDate !== undefined) {
            const parsedExpiryDate = new Date(expiryDate);

            if(Number.isNaN(parsedExpiryDate.getTime()) || parsedExpiryDate <= new Date()) {
                return res.status(400).json({
                    message: "Expiry date must be a valid future date"
                });
            }

            medicine.expiryDate = parsedExpiryDate;
        }

        if(sellingPrice !== undefined) {
            if(!Number.isFinite(Number(sellingPrice)) || Number(sellingPrice) < 0) {
                return res.status(400).json({
                    message: "Selling price must be a valid number"
                });
            }

            medicine.sellingPrice = Number(sellingPrice);
        }

        if(lowStockThreshold !== undefined) {
            if(!Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) {
                return res.status(400).json({
                    message: "Low stock threshold must be a whole number zero or greater"
                });
            }

            medicine.lowStockThreshold = Number(lowStockThreshold);
        }

        if(requiresPrescription !== undefined) {
            medicine.requiresPrescription = requiresPrescription === true || requiresPrescription === "true";
        }

        await medicine.save();

        res.status(200).json({
            message: "Medicine updated successfully",
            medicine
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};
