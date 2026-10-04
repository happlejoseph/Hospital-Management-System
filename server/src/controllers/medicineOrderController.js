

import MedicineOrder from "../models/MedicineOrder.js";
import Medicine from "../models/Medicine.js";




export const createMedicineOrder = async (req, res) => {
    
    try {

        const {medicines, shippingAddress, paymentMethod} = req.body;

        if (!medicines) {
            return res.status(400).json({
                message: "Medicines are required"
            });
        }

        if (!shippingAddress?.trim()) {
            return res.status(400).json({
                message: "Shipping address is required"
            });
        }

        if (paymentMethod !== "cod") {
            return res.status(400).json({
                message: "Only Cash on Delivery is available"
            });
        }

        let medicineItems;

        try {

            medicineItems = JSON.parse(medicines);
        }
        catch {
            return res.status(400).json({
                message: "Invalid medicines data"
            });
        }

        if (!Array.isArray(medicineItems) || medicineItems.length === 0) {
            return res.status(400).json({
                message: "Medicine cart is empty"
            });
        }

        let totalAmount = 0;
        const orderMedicines = [];

        for (const item of medicineItems) {
            const medicine = await Medicine.findById(item.medicine);

            if (!medicine) {
                return res.status(404).json({
                    message: "Medicine not found"
                });
            }

            if (!item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    message: "Invalid medicine quantity"
                });
            }

            if (medicine.quantity < item.quantity) {
                return res.status(400).json({
                    message: `${medicine.name} does not have enough stock`
                });
            }

            if (medicine.requiresPrescription && !req.file) {
                return res.status(400).json({
                    message: `Prescription is required for ${medicine.name}`
                });
            }

            totalAmount += medicine.sellingPrice * item.quantity;

            orderMedicines.push({
                medicine: medicine._id,
                quantity: item.quantity,
                price: medicine.sellingPrice
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
            totalAmount,
            prescription,
            shippingAddress: shippingAddress.trim(),
            paymentMethod: "cod",
            paymentStatus: "pending"
        });

        for (const item of medicineItems) {
            await Medicine.findByIdAndUpdate(
                item.medicine,
                {
                    $inc: {
                        quantity: -item.quantity
                    }
                }
            );
        }

        const populatedOrder = await MedicineOrder.findById(order._id)
            .populate("patient", "name email")
            .populate("medicines.medicine", "name sellingPrice");

        res.status(201).json({
            message: "Medicine order placed successfully",
            order: populatedOrder
        });
    }
    
    catch (error) {
        console.error("Create medicine order error:", error);

        res.status(500).json({
            message: "Unable to place medicine order"
        });
    }
};





export const getMyMedicineOrders = async (req, res) => {
    try {
        const orders = await MedicineOrder.find({
            patient: req.user.id
        })
            .populate("medicines.medicine", "name sellingPrice")
            .sort({ createdAt: -1 });

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
        const orders = await MedicineOrder.find()
            .populate("patient", "name email")
            .populate("medicines.medicine", "name sellingPrice")
            .sort({ createdAt: -1 });

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





export const updateMedicineOrderStatus = async (req, res) => {

    try {

        const { status } = req.body;

        const allowedStatuses = ["pending", "confirmed", "processing", "ready", "delivered", "cancelled"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await MedicineOrder.findByIdAndUpdate(
            req.params.id,
            {
                status
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("patient", "name email")
            .populate("medicines.medicine", "name sellingPrice");

        if (!order) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

        res.json({
            message: "Medicine order status updated",
            order
        });
    }
    
    catch (error) {
        console.error("Update medicine order error:", error);

        res.status(500).json({
            message: "Unable to update medicine order"
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

        const order = await MedicineOrder.findByIdAndUpdate(
            req.params.id,
            {
                paymentStatus
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(404).json({
                message: "Medicine order not found"
            });
        }

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