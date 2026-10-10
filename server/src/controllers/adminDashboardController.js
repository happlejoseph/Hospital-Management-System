

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Department from "../models/Department.js";
import Appointment from "../models/Appointment.js";
import Medicine from "../models/Medicine.js";
import MedicineTransaction from "../models/MedicineTransaction.js";
import MedicineOrder from "../models/MedicineOrder.js";


export const getAdminDashboard = async(req, res) => {

    try {

        const [
            totalPatients,
            totalDoctors,
            totalPharmacists,
            totalAdmins,
            totalDepartments,
            totalAppointments,
            pendingAppointments,
            totalMedicines
        ] = await Promise.all([
            User.countDocuments({ role: "patient" }),
            Doctor.countDocuments(),
            User.countDocuments({ role: "pharmacist" }),
            User.countDocuments({ role: "admin" }),
            Department.countDocuments(),
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: "pending" }),
            Medicine.countDocuments()
        ]);

        const recentAppointments = await Appointment.find()
            .populate("patient", "name email")
            .populate("doctor", "name specialization")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentPatients = await User.find({ role: "patient" })
            .select("name email status createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentMedicineTransactions = await MedicineTransaction.find()
            .populate("medicine", "name batchNumber")
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentMedicineOrders = await MedicineOrder.find()
            .populate("patient", "name email")
            .populate("medicines.medicine", "name sellingPrice")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            summary: {
                totalPatients,
                totalDoctors,
                totalPharmacists,
                totalAdmins,
                totalDepartments,
                totalAppointments,
                pendingAppointments,
                totalMedicines
            },
            recentAppointments,
            recentPatients,
            recentMedicineTransactions,
            recentMedicineOrders
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};
