

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const emptyDashboard = {

    summary: {
        totalPatients: 0,
        totalDoctors: 0,
        totalDepartments: 0,
        totalAppointments: 0,

        totalMedicines: 0,
        lowStockMedicines: 0,
        totalMedicineOrders: 0,
        pendingMedicineOrders: 0,
        deliveredMedicineOrders: 0,
        cancelledMedicineOrders: 0,

        totalMedicineRevenue: 0,
        pendingMedicinePayment: 0
    },
    recentAppointments: [],
    recentPatients: [],
    recentMedicineTransactions: []
};

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(emptyDashboard);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async() => {

        try {

            const response = await api.get("/admin/dashboard");
            setDashboard(response.data);
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to load dashboard");
        }
        
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const cards = [
        ["Total Patients", dashboard.summary.totalPatients, "/admin/users"],
        ["Total Doctors", dashboard.summary.totalDoctors, "/admin/doctors"],
        ["Total Departments", dashboard.summary.totalDepartments, "/admin/departments"],
        ["Total Appointments", dashboard.summary.totalAppointments, "/admin/appointments"],
        ["Total Medicines", dashboard.summary.totalMedicines, "/admin/pharmacy"],
        ["Low Stock Medicines", dashboard.summary.lowStockMedicines, "/admin/pharmacy"]
        
        ["Medicine Orders", dashboard.summary.totalMedicineOrders, "/pharmacist/orders"],
        ["Pending Orders", dashboard.summary.pendingMedicineOrders, "/pharmacist/orders"],
        ["Delivered Orders", dashboard.summary.deliveredMedicineOrders, "/pharmacist/orders"],
        ["Medicine Revenue", `₹${dashboard.summary.totalMedicineRevenue}`, "/pharmacist/orders"]
    ];



    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">HOSPITAL ADMINISTRATION</span>
                    <h1>Dashboard</h1>
                    <p>Monitor hospital activity and manage the main clinical modules.</p>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="stats-grid admin-stats-grid">
                {cards.map(([label, value, link]) => (
                    <Link className="stat-card admin-stat-card" to={link} key={label}>
                        <span>{label}</span>
                        <strong>{loading ? "—" : value}</strong>
                    </Link>
                ))}
            </div>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="eyebrow">QUICK ACTIONS</span>
                        <h2>Common tasks</h2>
                    </div>
                </div>
                <div className="quick-grid">
                    <Link className="quick-card" to="/admin/departments"><strong>Add Department</strong><span>Create a department page and add its Cloudinary banner URL.</span></Link>
                    <Link className="quick-card" to="/admin/doctors"><strong>Add Doctor</strong><span>Create a doctor account and assign the doctor to a department.</span></Link>
                    <Link className="quick-card" to="/admin/pharmacy"><strong>Add Medicine</strong><span>Add medicine stock and inventory information.</span></Link>
                    <Link className="quick-card" to="/admin/appointments"><strong>View Appointments</strong><span>Review patient requests and update appointment status.</span></Link>
                    <Link className="quick-card" to="/admin/users"><strong>Manage Users</strong><span>Review registered patient and system accounts.</span></Link>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="eyebrow">RECENT ACTIVITY</span>
                        <h2>Latest hospital activity</h2>
                    </div>
                </div>
                <div className="activity-grid">
                    <div className="activity-card">
                        <h3>Recent appointments</h3>
                        {loading ? <p>Loading...</p> : dashboard.recentAppointments.length === 0 ? <p>No appointments yet.</p> : dashboard.recentAppointments.map((appointment) => (
                            <div className="activity-item" key={appointment._id}>
                                <div><strong>{appointment.patient?.name || "Patient"}</strong><span>with {appointment.doctor?.name || "Doctor"}</span></div>
                                <b className={`appointment-status ${appointment.status}`}>{appointment.status}</b>
                            </div>
                        ))}
                    </div>

                    <div className="activity-card">
                        <h3>Recently registered patients</h3>
                        {loading ? <p>Loading...</p> : dashboard.recentPatients.length === 0 ? <p>No patients yet.</p> : dashboard.recentPatients.map((patient) => (
                            <div className="activity-item" key={patient._id}>
                                <div><strong>{patient.name}</strong><span>{patient.email}</span></div>
                                <span>{new Date(patient.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="activity-card">
                        <h3>Recent medicine transactions</h3>
                        {loading ? <p>Loading...</p> : dashboard.recentMedicineTransactions.length === 0 ? <p>No medicine transactions yet.</p> : dashboard.recentMedicineTransactions.map((transaction) => (
                            <div className="activity-item" key={transaction._id}>
                                <div><strong>{transaction.medicine?.name || "Medicine"}</strong><span>{transaction.type} · {transaction.quantity} units</span></div>
                                <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="eyebrow">MANAGEMENT</span>
                        <h2>Hospital modules</h2>
                    </div>
                </div>
                <div className="management-grid">
                    <Link className="management-card" to="/admin/departments"><strong>Departments</strong><span>Manage departments and public pages.</span></Link>
                    <Link className="management-card" to="/admin/doctors"><strong>Doctors</strong><span>Manage doctor accounts and profiles.</span></Link>
                    <Link className="management-card" to="/admin/users"><strong>Patients / Users</strong><span>Manage registered system accounts.</span></Link>
                    <Link className="management-card" to="/admin/appointments"><strong>Appointments</strong><span>Review and update appointment requests.</span></Link>
                    <Link className="management-card" to="/admin/pharmacy"><strong>Pharmacy</strong><span>Manage medicine stock and dispensing.</span></Link>
                    <Link className="management-card" to="/admin/medical-records"><strong>Medical Records</strong><span>Manage patient diagnosis and treatment records.</span></Link>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
