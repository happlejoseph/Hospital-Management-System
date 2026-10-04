

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