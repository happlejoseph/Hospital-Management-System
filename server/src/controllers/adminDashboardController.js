

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Department from "../models/Department.js";
import Appointment from "../models/Appointment.js";
import Medicine from "../models/Medicine.js";
import MedicineTransaction from "../models/MedicineTransaction.js";

export const getAdminDashboard = async(req, res) => {

    try {

        const [totalPatients, totalDoctors, totalDepartments, totalAppointments, totalMedicines, medicines] = await Promise.all([
            User.countDocuments({ role: "patient" }),
            Doctor.countDocuments({ status: "active" }),
            Department.countDocuments({ status: "active" }),
            Appointment.countDocuments(),
            Medicine.countDocuments(),
            Medicine.find().select("name quantity lowStockThreshold")
        ]);

        const lowStockMedicines = medicines.filter(
            (medicine) => medicine.quantity <= medicine.lowStockThreshold
        );

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

        res.status(200).json({
            summary: {
                totalPatients,
                totalDoctors,
                totalDepartments,
                totalAppointments,
                totalMedicines,
                lowStockMedicines: lowStockMedicines.length
            },
            recentAppointments,
            recentPatients,
            recentMedicineTransactions
        });
    }

    catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};
