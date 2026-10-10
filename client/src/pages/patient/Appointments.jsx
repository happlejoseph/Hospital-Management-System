

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";

const getToday = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
};

const Appointments = () => {
    const today = getToday();
    const [searchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({ doctorId: searchParams.get("doctor") || "", date: "", time: "", reason: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadData = async() => {

        try {

            const [doctorResponse, appointmentResponse] = await Promise.all([
                api.get("/doctors/public"),
                api.get("/appointments/mine")
            ]);
            setDoctors(doctorResponse.data.doctors || []);
            setAppointments(appointmentResponse.data.appointments || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load appointments");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const cancelAppointment = async(id) => {
        if(!window.confirm("Cancel this appointment?")) return;
        setMessage("");
        setError("");

        try {

            const response = await api.put(`/appointments/${id}/cancel`);
            setMessage(response.data.message);
            loadData();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to cancel appointment");
        }
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {

            const response = await api.post("/appointments", form);
            setMessage(response.data.message);
            setForm((current) => ({ ...current, date: "", time: "", reason: "" }));
            loadData();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to request appointment");
        }
    };




    
    return (
        <div className="public-page">
            <section className="page-hero compact">
                <span className="eyebrow">PATIENT ACCESS</span>
                <h1>Appointments</h1>
                <p>This area is available after login. Select a doctor, date and time to request an appointment.</p>
            </section>

            <section className="section appointment-section">
                <div className="appointment-layout">
                    <form className="form-card appointment-form" onSubmit={handleSubmit}>
                        <div className="section-heading small">
                            <span className="eyebrow">NEW REQUEST</span>
                            <h2>Book an appointment</h2>
                        </div>
                        {message && <div className="form-success">{message}</div>}
                        {error && <div className="form-error">{error}</div>}
                        <label>Doctor<select value={form.doctorId} onChange={(event) => setForm({ ...form, doctorId: event.target.value })} required><option value="">Select doctor</option>{doctors.map((doctor) => <option value={doctor._id} key={doctor._id}>{doctor.name} — {doctor.specialization}</option>)}</select></label>
                        <label>Date<input type="date" min={today} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
                        <label>Time<input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /></label>
                        <label>Reason for visit<textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Optional" /></label>
                        <button className="button button-dark full-button" type="submit">Request Appointment</button>
                    </form>

                    <div className="appointment-history">
                        <div className="section-heading small">
                            <span className="eyebrow">MY APPOINTMENTS</span>
                            <h2>Appointment requests</h2>
                        </div>
                        {appointments.length === 0 ? <div className="empty-public-card">You do not have any appointments yet.</div> : appointments.map((appointment) => (
                            <div className="appointment-item" key={appointment._id}>
                                <div><strong>{appointment.doctor?.name}</strong><span>{appointment.doctor?.specialization}</span></div>
                                <div><span>{appointment.date}</span><span>{appointment.time}</span></div>
                                <b className={`appointment-status ${appointment.status}`}>{appointment.status}</b>
                                {(appointment.status === "pending" || appointment.status === "confirmed") && <button className="small-action danger" type="button" onClick={() => cancelAppointment(appointment._id)}>Cancel</button>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Appointments;
