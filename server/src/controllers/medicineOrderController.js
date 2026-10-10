

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import MedicineOrder from "../models/MedicineOrder.js";
import Medicine from "../models/Medicine.js";
import MedicineTransaction from "../models/MedicineTransaction.js";

const prescriptionDirectory = path.resolve(process.cwd(), "uploads", "prescriptions");

const removeUploadedFile = async (file) => {

    if (!file?.path) {
        return;
    }

    try {
        await fs.promises.unlink(file.path);
    }
    catch {
        return;
    }
};

const populateOrder = (query) => {
    return query
        .populate("patient", "name email")
        .populate("medicines.medicine", "name image sellingPrice requiresPrescription");
};

const restoreOrderStock = async (order, userId, note) => {

    for (const item of order.medicines) {
        await Medicine.findByIdAndUpdate(item.medicine, {
            $inc: {
                quantity: item.quantity
            }
        });
    }

    await MedicineTransaction.insertMany(
        order.medicines.map((item) => ({
            medicine: item.medicine,
            type: "return",
            quantity: item.quantity,
            sellingPrice: item.price,
            notes: `${note} ${order._id}`,
            createdBy: userId
        }))
    );
};





export const createMedicineOrder = async (req, res) => {

    const stockUpdates = [];

    const reject = async (statusCode, message) => {
        await removeUploadedFile(req.file);

        return res.status(statusCode).json({
            message
        });
    };

    try {

        const { medicines, shippingAddress, paymentMethod } = req.body;

        if (typeof medicines === "undefined") {
            return reject(400, "Medicines are required");
        }

        if (typeof shippingAddress !== "string" || !shippingAddress.trim()) {
            return reject(400, "Shipping address is required");
        }

        if (paymentMethod !== "cod") {
            return reject(400, "Only Cash on Delivery is available");
        }

        let medicineItems;

        try {
            medicineItems = typeof medicines === "string" ? JSON.parse(medicines) : medicines;
        }
        catch {
            return reject(400, "Invalid medicines data");
        }

        if (!Array.isArray(medicineItems) || medicineItems.length === 0) {
            return reject(400, "Medicine cart is empty");
        }

        let totalAmount = 0;
        let prescriptionRequired = false;
        const prescriptionMedicines = [];
        const orderMedicines = [];
        const medicineIds = new Set();

        for (const item of medicineItems) {

            if (!item.medicine || !mongoose.isValidObjectId(item.medicine) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
                return reject(400, "Invalid medicine quantity");
            }

            if (medicineIds.has(String(item.medicine))) {
                return reject(400, "Duplicate medicine in cart");
            }

            medicineIds.add(String(item.medicine));

            const medicine = await Medicine.findById(item.medicine);

            if (!medicine) {
                return reject(404, "Medicine not found");
            }

            if (new Date(medicine.expiryDate) <= new Date()) {
                return reject(400, `${medicine.name} has expired`);
            }

            if (medicine.quantity < Number(item.quantity)) {
                return reject(400, `${medicine.name} does not have enough stock`);
            }

            if (medicine.requiresPrescription) {
                prescriptionRequired = true;
                prescriptionMedicines.push(medicine.name);
            }

            totalAmount += medicine.sellingPrice * Number(item.quantity);

            orderMedicines.push({
                medicine: medicine._id,
                quantity: Number(item.quantity),
                price: medicine.sellingPrice
            });
        }

        if (prescriptionRequired && !req.file) {
            return reject(400, `Prescription is required for ${prescriptionMedicines.join(", ")}`);
        }

        for (const item of orderMedicines) {

            const medicine = await Medicine.findOneAndUpdate(
                {
                    _id: item.medicine,
                    quantity: { $gte: item.quantity }
                },
                {
                    $inc: {
                        quantity: -item.quantity
                    }
                },
                {
                    new: true
                }
            );

            if (!medicine) {
                throw new Error("One or more medicines are no longer available in the requested quantity");
            }

            stockUpdates.push({
                medicine: item.medicine,
                quantity: item.quantity
            });
        }

        const prescription = req.file
            ? {
                  fileUrl: `/uploads/prescriptions/${req.file.filename}`,
                  fileName: req.file.originalname
              }
            : {
                  fileUrl: "",
                  fileName: ""
              };

        const order = await MedicineOrder.create({
            patient: req.user.id,
            medicines: orderMedicines,
            totalAmount: Math.round(totalAmount * 100) / 100,
            prescriptionRequired,
            prescription,
            shippingAddress: shippingAddress.trim(),
            paymentMethod: "cod",
            paymentStatus: "pending"
        });

        try {
            await MedicineTransaction.insertMany(
                orderMedicines.map((item) => ({
                    medicine: item.medicine,
                    type: "dispense",
                    quantity: item.quantity,
                    patientName: req.user.name,
                    sellingPrice: item.price,
                    notes: `Online order ${order._id}`,
                    createdBy: req.user.id
                }))
            );
        }
        catch (transactionError) {
            console.error("Create order transaction error:", transactionError);
        }

        const populatedOrder = await populateOrder(MedicineOrder.findById(order._id));

        res.status(201).json({
            message: "Medicine order placed successfully",
            order: populatedOrder
        });
    }

    catch (error) {

        for (const update of stockUpdates) {
            await Medicine.findByIdAndUpdate(update.medicine, {
                $inc: {
                    quantity: update.quantity
                }
            });
        }

        await removeUploadedFile(req.file);

        console.error("Create medicine order error:", error);

        res.status(500).json({
            message: "Unable to place medicine order"
        });
    }
};






export const getMyMedicineOrders = async (req, res) => {

    try {

        const orders = await populateOrder(
            MedicineOrder.find({
                patient: req.user.id
            }).sort({ createdAt: -1 })
        );

        res.json({
            orders
        });
    }

    catch (error) {

        console.error("Get my medicine orders error:", error);

        res.status(500).json({
            message: "Unable to load medicine orders"
        });
    }
};





export const getAllMedicineOrders = async (req, res) => {

    try {

        const orders = await populateOrder(
            MedicineOrder.find().sort({ createdAt: -1 })
        );

        res.json({
            orders
        });
    }

    catch (error) {

        console.error("Get medicine orders error:", error);

        res.status(500).json({
            message: "Unable to load medicine orders"
        });
    }
};





export const getMedicineOrderPrescription = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        const order = await MedicineOrder.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        if (req.user.role === "patient" && String(order.patient) !== String(req.user.id)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        if (!order.prescription?.fileUrl) {
            return res.status(404).json({
                message: "No prescription uploaded for this order"
            });
        }

        const filePath = path.resolve(process.cwd(), order.prescription.fileUrl.replace(/^\/+/, ""));

        if (!filePath.startsWith(prescriptionDirectory + path.sep) || !fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "Prescription file not found"
            });
        }

        res.type("application/pdf");
        res.sendFile(filePath);
    }

    catch (error) {

        console.error("Get prescription error:", error);

        res.status(500).json({
            message: "Unable to load prescription"
        });
    }
};






export const updateMedicineOrderStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const allowedTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["processing", "cancelled"],
            processing: ["ready", "cancelled"],
            ready: ["delivered"],
            delivered: [],
            cancelled: []
        };

        if (!Object.keys(allowedTransitions).includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        const order = await MedicineOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        if (!allowedTransitions[order.status].includes(status)) {
            return res.status(400).json({
                message: `Order cannot be changed from ${order.status} to ${status}`
            });
        }

        const updatedOrder = await MedicineOrder.findOneAndUpdate(
            {
                _id: order._id,
                status: order.status
            },
            {
                status
            },
            {
                new: true
            }
        );

        if (!updatedOrder) {
            return res.status(409).json({
                message: "Order was updated by someone else. Please refresh and try again"
            });
        }

        if (status === "cancelled") {
            await restoreOrderStock(updatedOrder, req.user.id, "Cancelled order");
        }

        const populatedOrder = await populateOrder(MedicineOrder.findById(updatedOrder._id));

        res.json({
            message: "Medicine order status updated",
            order: populatedOrder
        });
    }

    catch (error) {

        console.error("Update medicine order error:", error);

        res.status(500).json({
            message: "Unable to update medicine order"
        });
    }
};





export const cancelMyMedicineOrder = async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        const order = await MedicineOrder.findOne({
            _id: req.params.id,
            patient: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Only pending orders can be cancelled"
            });
        }

        const cancelledOrder = await MedicineOrder.findOneAndUpdate(
            {
                _id: order._id,
                status: "pending"
            },
            {
                status: "cancelled"
            },
            {
                new: true
            }
        );

        if (!cancelledOrder) {
            return res.status(409).json({
                message: "Order has already been processed and can no longer be cancelled"
            });
        }

        await restoreOrderStock(cancelledOrder, req.user.id, "Cancelled by patient");

        const populatedOrder = await populateOrder(MedicineOrder.findById(cancelledOrder._id));

        res.json({
            message: "Medicine order cancelled",
            order: populatedOrder
        });
    }

    catch (error) {

        console.error("Cancel medicine order error:", error);

        res.status(500).json({
            message: "Unable to cancel medicine order"
        });
    }
};





export const updateMedicinePaymentStatus = async (req, res) => {

    try {

        const { paymentStatus } = req.body;

        if (!["pending", "paid"].includes(paymentStatus)) {
            return res.status(400).json({
                message: "Invalid payment status"
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        const order = await MedicineOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        if (paymentStatus === "paid" && order.status !== "delivered") {
            return res.status(400).json({
                message: "Cash can be marked as paid after the order is delivered"
            });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        res.json({
            message: "Payment status updated",
            order
        });
    }

    catch (error) {

        console.error("Update medicine payment error:", error);

        res.status(500).json({
            message: "Unable to update payment status"
        });
    }
};
