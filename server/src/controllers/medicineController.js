

import Medicine from "../models/Medicine.js";
import MedicineTransaction from "../models/MedicineTransaction.js";




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






export const createMedicine = async(req, res) => {

    try {

        const { name, batchNumber, expiryDate, quantity, supplier, purchasePrice, sellingPrice, lowStockThreshold } = req.body;

        if(!name || !batchNumber || !expiryDate || quantity === undefined || !supplier || purchasePrice === undefined || sellingPrice === undefined) {
            return res.status(400).json({
                message: "All medicine fields are required"
            });
        }

        const medicine = await Medicine.create({
            name,
            batchNumber,
            expiryDate,
            quantity,
            supplier,
            purchasePrice,
            sellingPrice,
            lowStockThreshold
        });

        await MedicineTransaction.create({
            medicine: medicine._id,
            type: "purchase",
            quantity,
            supplier,
            purchasePrice,
            sellingPrice,
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

        if(!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than zero"
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

        if(purchasePrice !== undefined) {
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

        if(!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than zero"
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
                quantity: { $gte: Number(quantity) }
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
