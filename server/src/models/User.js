

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        tepe: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['admin', 'doctor', 'receptionist', 'nurse', 'pharmacist', 'lab_technician', 'accountant', 'patient'],
        default: 'active'
    },

    resetPasswordOTP: {
        type: String
    },

    resetPasswordOTPExpiry: {
        type: Date
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;