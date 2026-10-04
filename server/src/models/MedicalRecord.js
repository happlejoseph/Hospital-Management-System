

import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },

    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    },

    diagnosis: {
        type: String,
        required: true,
        trim: true
    },

    symptoms: {
        type: String,
        trim: true,
        default: ""
    },

    notes: {
        type: String,
        trim: true,
        default: ""
    },

    treatment: {
        type: String,
        trim: true,
        default: ""
    },

    prescription: {
        type: String,
        trim: true,
        default: ""
    }

}, { timestamps: true });

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);


export default MedicalRecord;
