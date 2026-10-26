

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import MedicineOrder from "../models/MedicineOrder.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { weekDays, getUpcomingAvailability } from "../utils/availability.js";



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

        const doctors = await Doctor.find(filter).select("name email phone specialization qualification experience department image status schedule").sort({ name: 1 });
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

        const doctor = await Doctor.findOne({ _id: req.params.id, status: "active" }).select("name email phone specialization qualification experience department image status schedule");

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

        const [activeAppointment, pendingOrder] = await Promise.all([
            Appointment.exists({
                doctor: doctor._id,
                status: { $in: ["pending", "confirmed"] }
            }),
            MedicineOrder.exists({
                doctor: doctor._id,
                status: "pending"
            })
        ]);

        if(activeAppointment || pendingOrder) {
            return res.status(400).json({
                message: "This doctor still has active appointments or pending medicine orders. Set the doctor to inactive instead of deleting"
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




export const getPublicDoctorAvailability = async(req, res) => {

    try {

        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        const doctor = await Doctor.findOne({ _id: req.params.id, status: "active" });

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        const availability = await getUpcomingAvailability(doctor);

        res.status(200).json({
            availability
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const getMySchedule = async(req, res) => {

    try {

        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const upcoming = await getUpcomingAvailability(doctor);

        res.status(200).json({
            schedule: doctor.schedule,
            upcoming
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const updateMySchedule = async(req, res) => {

    try {

        const { schedule } = req.body;

        if(!Array.isArray(schedule)) {
            return res.status(400).json({
                message: "Schedule is required"
            });
        }

        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
        const selectedDays = new Set();
        const cleanedSchedule = [];

        for(const item of schedule) {

            const day = String(item.day || "").toLowerCase();

            if(!weekDays.includes(day)) {
                return res.status(400).json({
                    message: "Invalid day in schedule"
                });
            }

            if(selectedDays.has(day)) {
                return res.status(400).json({
                    message: "Each day can only be added once"
                });
            }

            if(!timePattern.test(item.startTime) || !timePattern.test(item.endTime)) {
                return res.status(400).json({
                    message: `Enter a valid start and end time for ${day}`
                });
            }

            if(item.endTime <= item.startTime) {
                return res.status(400).json({
                    message: `End time must be after start time for ${day}`
                });
            }

            const limit = Number(item.limit);

            if(!Number.isInteger(limit) || limit < 1 || limit > 500) {
                return res.status(400).json({
                    message: `Appointment limit for ${day} must be a whole number between 1 and 500`
                });
            }

            selectedDays.add(day);

            cleanedSchedule.push({
                day,
                startTime: item.startTime,
                endTime: item.endTime,
                limit
            });
        }

        cleanedSchedule.sort((first, second) => weekDays.indexOf(first.day) - weekDays.indexOf(second.day));

        doctor.schedule = cleanedSchedule;
        await doctor.save();

        const upcoming = await getUpcomingAvailability(doctor);

        res.status(200).json({
            message: "Schedule saved successfully",
            schedule: doctor.schedule,
            upcoming
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const getMyPatients = async(req, res) => {

    try {

        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const consultations = await Appointment.aggregate([
            {
                $match: {
                    doctor: doctor._id,
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: "$patient",
                    visits: { $sum: 1 },
                    lastVisit: { $max: "$date" }
                }
            }
        ]);

        const patients = await User.find({
            _id: { $in: consultations.map((item) => item._id) }
        }).select("name email");

        const result = consultations
            .map((item) => {

                const patient = patients.find((user) => String(user._id) === String(item._id));

                return {
                    _id: item._id,
                    name: patient?.name || "Unknown patient",
                    email: patient?.email || "",
                    visits: item.visits,
                    lastVisit: item.lastVisit
                };
            })
            .sort((first, second) => second.lastVisit.localeCompare(first.lastVisit));

        res.status(200).json({
            patients: result
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const getMyPatientHistory = async(req, res) => {

    try {

        const { patientId } = req.params;

        if(!mongoose.isValidObjectId(patientId)) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const doctor = await Doctor.findOne({ user: req.user.id });

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const consulted = await Appointment.exists({
            doctor: doctor._id,
            patient: patientId,
            status: "completed"
        });

        if(!consulted) {
            return res.status(404).json({
                message: "This patient has not completed a consultation with you"
            });
        }

        const [patient, appointments, medicalRecords, medicineOrders] = await Promise.all([
            User.findById(patientId).select("name email"),
            Appointment.find({ doctor: doctor._id, patient: patientId }).sort({ date: -1, time: -1 }),
            MedicalRecord.find({ doctor: doctor._id, patient: patientId })
                .populate("appointment", "date time status")
                .sort({ createdAt: -1 }),
            MedicineOrder.find({ doctor: doctor._id, patient: patientId })
                .populate("medicines.medicine", "name")
                .sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            patient,
            appointments,
            medicalRecords,
            medicineOrders
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};
