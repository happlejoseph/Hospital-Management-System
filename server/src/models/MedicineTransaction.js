

import mongoose from "mongoose";

const medicineTransactionSchema = new mongoose.Schema({
    
    medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true
    },

    type: {
        type: String,
        enum: ["purchase", "dispense", "return"],
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    patientName: {
        type: String,
        trim: true
    },

    supplier: {
        type: String,
        trim: true
    },

    purchasePrice: {
        type: Number,
        min: 0
    },

    sellingPrice: {
        type: Number,
        min: 0
    },

    notes: {
        type: String,
        trim: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

const MedicineTransaction = mongoose.model("MedicineTransaction", medicineTransactionSchema);

export default MedicineTransaction;
