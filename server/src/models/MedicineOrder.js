

import mongoose from "mongoose";

const medicineOrderSchema = new mongoose.Schema({
    
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        medicines: [
            {
                medicine: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Medicine",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        prescriptionRequired: {
            type: Boolean,
            default: false
        },

        prescription: {
            fileUrl: {
                type: String,
                default: ""
            },
            fileName: {
                type: String,
                default: ""
            }
        },

        shippingAddress: {
            type: String,
            required: true,
            trim: true
        },

        paymentMethod: {
            type: String,
            enum: ["cod"],
            default: "cod"
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "ready",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const MedicineOrder = mongoose.model(
    "MedicineOrder",
    medicineOrderSchema
);

export default MedicineOrder;