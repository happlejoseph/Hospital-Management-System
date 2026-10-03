

import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    batchNumber: {
        type: String,
        required: true,
        trim: true
    },

    expiryDate: {
        type: Date,
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    supplier: {
        type: String,
        required: true,
        trim: true
    },

    purchasePrice: {
        type: Number,
        required: true,
        min: 0
    },

    sellingPrice: {
        type: Number,
        required: true,
        min: 0
    },

    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0
    }
    
}, { timestamps: true });

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
