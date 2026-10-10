

import { useEffect, useState } from "react";
import api from "../../services/api";

const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

const Appointments = () => {

    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState("all");
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

    const visibleAppointments = filter === "all"
        ? appointments
        : appointments.filter((appointment) => appointment.status === filter);

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">DOCTOR</span>
                    <h1>My Appointments</h1>
                    <p>Confirm, complete or cancel appointments requested by patients.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="table-card">
                <div className="table-title">
                    Appointment requests
                    <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                        {filters.map((item) => <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>)}
                    </select>
                </div>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Email</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="7">Loading...</td></tr>}
                            {!loading && visibleAppointments.length === 0 && <tr><td colSpan="7">No appointments found.</td></tr>}
                            {visibleAppointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>{appointment.patient?.name}</td>
                                    <td>{appointment.patient?.email}</td>
                                    <td>{appointment.date}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.reason || "—"}</td>
                                    <td><b className={`appointment-status ${appointment.status}`}>{appointment.status}</b></td>
                                    <td>
                                        {appointment.status === "pending" && (
                                            <>
                                                <button className="small-action" onClick={() => updateStatus(appointment._id, "confirmed")}>Confirm</button>
                                                <button className="small-action danger" onClick={() => updateStatus(appointment._id, "cancelled")}>Cancel</button>
                                            </>
                                        )}
                                        {appointment.status === "confirmed" && (
                                            <>
                                                <button className="small-action" onClick={() => updateStatus(appointment._id, "completed")}>Complete</button>
                                                <button className="small-action danger" onClick={() => updateStatus(appointment._id, "cancelled")}>Cancel</button>
                                            </>
                                        )}
                                        {(appointment.status === "completed" || appointment.status === "cancelled") && "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Appointments;
