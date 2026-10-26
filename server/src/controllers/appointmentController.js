

import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import mongoose from "mongoose";
import { bookingWindowDays, getScheduleForDate, isConsultationOver, isInsideBookingWindow } from "../utils/availability.js";




export const createAppointment = async(req, res)=> {

    try {

        const {doctorId, date, reason} = req.body;

        if(!doctorId || !date) {
            return res.status(400).json({
                message: 'Doctor and date are required'
            });
        }

        if(!mongoose.isValidObjectId(doctorId)) {
            return res.status(404).json({
                message: 'Doctor not found or unavailable'
            });
        }

        if(!isInsideBookingWindow(date)) {
            return res.status(400).json({
                message: `Appointments can only be booked for the next ${bookingWindowDays} days`
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if(!doctor || doctor.status !== 'active') {
            return res.status(404).json({
                message: 'Doctor not found or unavailable'
            })
        }

        const scheduleDay = getScheduleForDate(doctor, date);

        if(!scheduleDay) {
            return res.status(400).json({
                message: 'The doctor is not available on the selected date'
            });
        }

        if(isConsultationOver(date, scheduleDay.endTime)) {
            return res.status(400).json({
                message: 'Consultation hours for today are over'
            });
        }

        const patientAppointment = await Appointment.findOne({
            patient: req.user.id,
            doctor: doctor._id,
            date,
            status: {$ne: 'cancelled'}
        });

        if(patientAppointment) {
            return res.status(400).json({
                message: 'You already have an appointment with this doctor on the selected date'
            });
        }

        const bookedCount = await Appointment.countDocuments({
            doctor: doctor._id,
            date,
            status: {$ne: 'cancelled'}
        });

        if(bookedCount >= scheduleDay.limit) {
            return res.status(400).json({
                message: 'No appointment slots are left for the selected date'
            });
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctor._id,
            department: doctor.department,
            date,
            time: scheduleDay.startTime,
            reason
        });

        const position = await Appointment.countDocuments({
            doctor: doctor._id,
            date,
            status: {$ne: 'cancelled'},
            _id: {$lte: appointment._id}
        });

        if(position > scheduleDay.limit) {
            await Appointment.findByIdAndDelete(appointment._id);

            return res.status(400).json({
                message: 'No appointment slots are left for the selected date'
            });
        }

        res.status(201).json({
            message: 'Appointment requested successfully',
            appointment,
            remaining: Math.max(scheduleDay.limit - position, 0)
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





export const getDoctorAppointments = async(req, res) => {

    try {

        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const appointments = await Appointment.find({
            doctor: doctor._id
        })
            .populate("patient", "name email")
            .populate("doctor", "name specialization")
            .sort({ date: 1, time: 1 });

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

        const currentAppointment = await Appointment.findById(req.params.id);

        if(currentAppointment && currentAppointment.status === "cancelled" && status !== "cancelled") {
            return res.status(400).json({
                message: "Cancelled appointments cannot be reopened"
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



export const updateDoctorAppointmentStatus = async(req, res) => {

    try {

        const { status } = req.body;

        const allowedTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["completed", "cancelled"],
            completed: [],
            cancelled: []
        };

        if(!Object.keys(allowedTransitions).includes(status)) {
            return res.status(400).json({
                message: "Invalid appointment status"
            });
        }

        const doctor = await Doctor.findOne({
            user: req.user.id
        });

        if(!doctor) {
            return res.status(404).json({
                message: "Doctor profile not found"
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctor: doctor._id
        });

        if(!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if(!allowedTransitions[appointment.status].includes(status)) {
            return res.status(400).json({
                message: `Appointment cannot be changed from ${appointment.status} to ${status}`
            });
        }

        appointment.status = status;
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("patient", "name email")
            .populate("doctor", "name specialization");

        res.status(200).json({
            message: `Appointment ${status} successfully`,
            appointment: populatedAppointment
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};




export const cancelMyAppointment = async(req, res) => {

    try {

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patient: req.user.id
        });

        if(!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        if(!["pending", "confirmed"].includes(appointment.status)) {
            return res.status(400).json({
                message: `A ${appointment.status} appointment cannot be cancelled`
            });
        }

        appointment.status = "cancelled";
        await appointment.save();

        res.status(200).json({
            message: "Appointment cancelled successfully",
            appointment
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};
