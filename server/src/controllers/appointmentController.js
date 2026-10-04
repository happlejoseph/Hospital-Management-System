

import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";




export const createAppointment = async(req, res)=> {

    try {

        const {doctorId, date, time, reason} = req.body;

        if(!doctorId || !date || !time) {
            return res.status(400).json({
                message: 'Doctor, date and time are required'
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if(!doctor || doctor.status !== 'active') {
            return res.status(404).json({
                message: 'Doctor not found or unavailable'
            })
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctor._id,
            department: doctor.department,
            date,
            time,
            reason
        });

        res.status(201).json({
            message: 'Appointment requested successfully',
            appointment
        })
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}




export const getMyAppointments = async(req, res)=> {

    try {

        const appointments = await Appointment.find({patient: req.user.id})
            .populate('doctor', 'name specialization qualification department image')
            .sort({date: 1, time: 1})

        res.status(200).json({appointments});
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
}



export const getAllAppointments = async(req, res) => {

    try {

        const appointments = await Appointment.find()
            .populate("patient", "name email")
            .populate("doctor", "name specialization department")
            .sort({ createdAt: -1 });

        res.status(200).json({
            appointments
        });
    }
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};


export const updateAppointmentStatus = async(req, res) => {

    try {

        const { status } = req.body;
        const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

        if(!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid appointment status"
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        )
        .populate("patient", "name email")
        .populate("doctor", "name specialization department");

        if(!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            message: "Appointment status updated successfully",
            appointment
        });
    }
    
    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};