

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

        const today = new Date();
        const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if(date < todayDate) {
            return res.status(400).json({
                message: 'Appointment date cannot be in the past'
            });
        }

        const doctor = await Doctor.findById(doctorId);
        if(!doctor || doctor.status !== 'active') {
            return res.status(404).json({
                message: 'Doctor not found or unavailable'
            })
        }

        const existingAppointment = await Appointment.findOne({
            doctor: doctor._id,
            date,
            time,
            status: {$ne: 'cancelled'}
        });

        if(existingAppointment) {
            return res.status(400).json({
                message: 'This time slot is already booked for the selected doctor'
            });
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
