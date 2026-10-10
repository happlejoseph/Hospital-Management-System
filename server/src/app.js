

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRouters.js";
import userRoutes from "./routes/userRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import medicineOrderRoutes from "./routes/medicineOrderRoutes.js";

const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

    res.json({
        message: "Hospital Management System API"
    });
});


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/medicine-orders", medicineOrderRoutes);

app.use((req, res) => {

    res.status(404).json({
        message: "Route not found"
    });
});

app.use((error, req, res, next) => {

    console.error("Unhandled error:", error);

    res.status(500).json({
        message: "Something went wrong"
    });
});


export default app;
