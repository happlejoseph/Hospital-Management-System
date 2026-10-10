

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";



export const createDoctor = async(req, res)=> {

    try {

        const {name, email, password, phone, specialization, qualification, experience, department, image = "" } = req.body;

        if(!name || !email || !password || !phone || !specialization || !qualification || !department || experience === undefined) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({email: normalizedEmail});

        if(existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        if(password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "doctor",
            status: "active"
        });

        let doctor;

        try {
            doctor = await Doctor.create({
                user: user._id,
                name,
                email: normalizedEmail,
                phone,
                specialization,
                qualification,
                experience,
                department,
                image,
                status: "active"
            });
        }

        catch(error) {
            await User.findByIdAndDelete(user._id);
            throw error;
        }

        res.status(201).json({
            message: 'Doctor created successfully',
            doctor
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}






export const getAllDoctors = async(req, res)=> {

    try {

        const doctors = await Doctor.find().populate('user', 'name email role status').sort({name: 1})
        res.status(200).json({doctors})

    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}





export const getPublicDoctors = async(req, res)=> {

    try {

        const filter = {status: 'active'}

        if(req.query.department) {
            filter.department = req.query.department
        }

        const doctors = await Doctor.find(filter).select("name email phone specialization qualification experience department image status").sort({ name: 1 });
        res.status(200).json({doctors});
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}




export const getPublicDoctorById = async(req, res) => {

    try {

        const doctor = await Doctor.findOne({ _id: req.params.id, status: "active" }).select("name email phone specialization qualification experience department image status");

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        res.status(200).json({ doctor });
    }
    
    catch(error) {
        res.status(500).json({ message: error.message });
    }
};




export const getDoctorById = async(req, res)=> {

    try {

        const {id} = req.params;

        const doctor = await Doctor.findById(id).populate('user', 'name email role status')

        if(!doctor) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        res.status(200).json({doctor})
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}




export const updateDoctor = async(req, res) => {

    try {

        const { name, email, phone, specialization, qualification, experience, department, status, image } = req.body;

        const doctor = await Doctor.findById(req.params.id);

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        doctor.name = name ?? doctor.name;
        if(email) {
            const normalizedEmail = email.toLowerCase().trim();
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: doctor.user }
            });

            if(existingUser) {
                return res.status(400).json({
                    message: "Email already registered"
                });
            }

            doctor.email = normalizedEmail;
        }
        doctor.phone = phone ?? doctor.phone;
        doctor.specialization = specialization ?? doctor.specialization;
        doctor.qualification = qualification ?? doctor.qualification;
        doctor.experience = experience ?? doctor.experience;
        doctor.department = department ?? doctor.department;
        doctor.status = status ?? doctor.status;
        doctor.image = image ?? doctor.image;

        await doctor.save();

        await User.findByIdAndUpdate(doctor.user, {
            name: doctor.name,
            email: doctor.email,
            status: doctor.status
        },
        { runValidators: true });

        res.status(200).json({
            message: "Doctor updated successfully", doctor
        });
    }

    catch(error) {
        res.status(500).json({ message: error.message });
    }
};





export const deleteDoctor = async(req, res) => {

    try {

        const doctor = await Doctor.findById(req.params.id);

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        await User.findByIdAndDelete(doctor.user);

        await Doctor.findByIdAndDelete(doctor._id);

        res.status(200).json({
            message: "Doctor deleted successfully"
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};