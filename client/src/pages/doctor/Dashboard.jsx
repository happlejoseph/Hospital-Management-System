

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const getToday = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
};

const Dashboard = () => {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadAppointments = async() => {

        try {

            const response = await api.get("/appointments/doctor");
            setAppointments(response.data.appointments || []);
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to load appointments");
        }

        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const updateStatus = async(id, status) => {
        setError("");
        setMessage("");

        try {

            const response = await api.put(`/appointments/doctor/${id}/status`, { status });
            setMessage(response.data.message);
            await loadAppointments();
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to update appointment");
        }
    };

    const today = getToday();

    const pendingAppointments = appointments.filter((appointment) => appointment.status === "pending");
    const todayAppointments = appointments.filter((appointment) => appointment.date === today && appointment.status !== "cancelled");
    const completedCount = appointments.filter((appointment) => appointment.status === "completed").length;
    const patientCount = new Set(appointments.map((appointment) => appointment.patient?._id).filter(Boolean)).size;

    const cards = [
        ["Today's Appointments", todayAppointments.length],
        ["Pending Requests", pendingAppointments.length],
        ["Completed", completedCount],
        ["Patients", patientCount]
    ];

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">DOCTOR</span>
                    <h1>Doctor Dashboard</h1>
                    <p>Review new appointment requests and manage today's patients.</p>
                </div>
                <div className="hero-actions">
                    <Link className="button button-dark" to="/doctor/appointments">All Appointments</Link>
                    <Link className="outline-button" to="/doctor/medical-records">Medical Records</Link>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="stats-grid">
                {cards.map(([label, value]) => (
                    <div className="stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{loading ? "—" : value}</strong>
                    </div>
                ))}
            </div>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="eyebrow">NEW REQUESTS</span>
                        <h2>Pending appointments</h2>
                    </div>
                </div>
                <div className="table-card">
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="5">Loading...</td></tr>}
                                {!loading && pendingAppointments.length === 0 && <tr><td colSpan="5">No pending appointment requests.</td></tr>}
                                {pendingAppointments.map((appointment) => (
                                    <tr key={appointment._id}>
                                        <td>{appointment.patient?.name}</td>
                                        <td>{appointment.date}</td>
                                        <td>{appointment.time}</td>
                                        <td>{appointment.reason || "—"}</td>
                                        <td>
                                            <button className="small-action" onClick={() => updateStatus(appointment._id, "confirmed")}>Confirm</button>
                                            <button className="small-action danger" onClick={() => updateStatus(appointment._id, "cancelled")}>Cancel</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="eyebrow">TODAY</span>
                        <h2>Today's schedule</h2>
                    </div>
                </div>
                <div className="table-card">
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!loading && todayAppointments.length === 0 && <tr><td colSpan="5">No appointments scheduled for today.</td></tr>}
                                {todayAppointments.map((appointment) => (
                                    <tr key={appointment._id}>
                                        <td>{appointment.patient?.name}</td>
                                        <td>{appointment.time}</td>
                                        <td>{appointment.reason || "—"}</td>
                                        <td><b className={`appointment-status ${appointment.status}`}>{appointment.status}</b></td>
                                        <td>
                                            {appointment.status === "pending" && <button className="small-action" onClick={() => updateStatus(appointment._id, "confirmed")}>Confirm</button>}
                                            {appointment.status === "confirmed" && <button className="small-action" onClick={() => updateStatus(appointment._id, "completed")}>Complete</button>}
                                            {appointment.status === "completed" && "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
