

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const emptyDashboard = {
    summary: {
        totalPatients: 0,
        totalDoctors: 0,
        totalPharmacists: 0,
        totalAdmins: 0,
        totalDepartments: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        totalMedicines: 0
    },
    recentAppointments: [],
    recentPatients: [],
    recentMedicineTransactions: [],
    recentMedicineOrders: []
};

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(emptyDashboard);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async() => {

        try {

            const response = await api.get("/admin/dashboard");
            setDashboard({ ...emptyDashboard, ...response.data, summary: { ...emptyDashboard.summary, ...response.data.summary } });
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
        ["Total Pharmacists", dashboard.summary.totalPharmacists, "/admin/pharmacists"],
        ["Total Admins", dashboard.summary.totalAdmins, "/admin/admins"],
        ["Total Departments", dashboard.summary.totalDepartments, "/admin/departments"],
        ["Total Appointments", dashboard.summary.totalAppointments, "/admin/appointments"],
        ["Pending Appointments", dashboard.summary.pendingAppointments, "/admin/appointments"],
        ["Total Medicines", dashboard.summary.totalMedicines, "/admin/pharmacy"]
    ];



    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">HOSPITAL ADMINISTRATION</span>
                    <h1>Dashboard</h1>
                    <p>Monitor patients, appointments, doctors and pharmacy activity.</p>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="stats-grid stats-grid-four admin-stats-grid">
                
                {cards.map((card) => {
                    const label = card[0];
                    const value = card[1];
                    const link = card[2];

                    return (
                        <Link
                            className="stat-card admin-stat-card"
                            to={link}
                            key={label}
                        >
                            <span>{label}</span>
                            <strong>{loading ? "—" : value}</strong>
                        </Link>
                    );
                })}
            </div>



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
                        <h3>Recent medicine orders</h3>
                        {loading ? <p>Loading...</p> : dashboard.recentMedicineOrders.length === 0 ? <p>No medicine orders yet.</p> : dashboard.recentMedicineOrders.map((order) => (
                            <div className="activity-item" key={order._id}>
                                <div><strong>{order.patient?.name || "Patient"}</strong><span>₹{order.totalAmount.toFixed(2)} · {order.paymentStatus}</span></div>
                                <b className={`appointment-status ${order.status}`}>{order.status}</b>
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


        </div>
    );
};

export default Dashboard;
