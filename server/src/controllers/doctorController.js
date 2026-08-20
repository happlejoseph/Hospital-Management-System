

import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcrypt';



// CREATE DOCTOR (ADMIN //
export const createDoctor = async(req, res) => {

    try {

        const {name, email, password, phone, specialization, qualification, experience, department} = req.body;

        if(!name || !email || !password || !phone || !specialization || !qualification || !department || experience === undefined) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        const hanshPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            user: user._id,
            name,
            email,
            phone,
            specialization,
            experience,
            department,
            status: 'active'
        });

        res.status(201).json({
            message: 'Doctor created successfully'
        });
        
    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// GET ALL DOCTORS (ADMIN) //
export const getAllDoctors = async(req, res)=> {

    try {

        const doctors = await Doctor.find().populate('user', 'name email role status');

        res.status(200).json({
            message: 'Doctors fetched successfully',
            doctors
        });


    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// GET SINGLE DOCTOR (ADMIN) //
export const getDoctorById = async(req, res)=> {

    try {

        const {id} = req.params;

        const doctor = await Doctor.findById(id).populate('user', 'name email role status');

        if(!doctor) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            message: 'Doctor fetched successfully',
            doctor
        });


    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// UPDATE DOCTOR (ADMIN) //

export const updateDoctor = async(req, res)=> {

    try {

        const {id} = res.body;

        const {name, email, phone, specialization, qualification, experience, department, status} = req.body;

        const doctor = await Doctor.findByIdAndUpdate(
            id,
            {
                name, email, phone, specialization, qualification, experience, department, status
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('user', 'naem email role status');

        if(!doctor) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        await User.findByIdAndUpdate(
            doctor.user._id,
            {
                name, email, status
            },
            {
                new: true,
                runValidators: true
            }
        )

        res.status(200).json({
            message: 'Doctor updated successfully',
            doctor
        });

        
    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}