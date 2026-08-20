

import mongoose from 'mongoose';


const doctorSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Type.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },
    
    specialization: {
        type: String,
        required: true,
        trim: true
    },

    qualification: {
        type: String,
        required: true,
        trim: true
    },

    experience: {
        type: Number,
        required: true,
        min: 0
    },

    department: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, {timestamps: true});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;