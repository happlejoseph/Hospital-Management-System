

import mongoose from 'mongoose';


const doctorSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
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

    image: {
        type: String,
        default: ""
    },

    schedule: [{
        _id: false,

        day: {
            type: String,
            enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            required: true
        },

        startTime: {
            type: String,
            default: "09:00"
        },

        endTime: {
            type: String,
            default: "17:00"
        },

        limit: {
            type: Number,
            default: 50,
            min: 1,
            max: 500
        }
    }],

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
    
}, {timestamps: true});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;