



import { useEffect, useState } from "react";
import api from "../../services/api";

const Appointments = () => {

    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadAppointments = async() => {

        try {

            const response = await api.get("/appointments/admin/all");
            setAppointments(response.data.appointments || []);
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to load appointments");
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const updateStatus = async(id, status) => {
        setError("");
        setMessage("");
        try {

            const response = await api.put(`/appointments/admin/${id}/status`, { status });
            setMessage(response.data.message);
            await loadAppointments();
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to update appointment");
        }
    };




    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">ADMIN</span>
                    <h1>Appointments</h1>
                    <p>Review patient appointment requests and manage their status.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="table-card">
                <div className="table-title">Appointment requests</div>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Reason</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 && <tr><td colSpan="7">No appointments found.</td></tr>}
                            {appointments.map((appointment) => (
                                <tr key={appointment._id}>
                                    <td>{appointment.patient?.name}</td>
                                    <td>{appointment.doctor?.name}</td>
                                    <td>{appointment.department}</td>
                                    <td>{appointment.date}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.reason || "—"}</td>
                                    <td>
                                        <select value={appointment.status} onChange={(event) => updateStatus(appointment._id, event.target.value)}>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
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
