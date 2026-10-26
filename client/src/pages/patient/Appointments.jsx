import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { formatDate, formatDayMonth, formatTime, formatWeekday } from "../../utils/formatDate";

const Appointments = () => {
    const [searchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);
    const [form, setForm] = useState({ doctorId: searchParams.get("doctor") || "", date: "", reason: "" });
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

    const loadAvailability = async(doctorId) => {

        if(!doctorId) {
            setAvailability([]);
            return;
        }

        setLoadingDates(true);

        try {

            const response = await api.get(`/doctors/public/${doctorId}/availability`);
            setAvailability(response.data.availability || []);
        }
        catch {
            setAvailability([]);
        }
        finally {
            setLoadingDates(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadAvailability(form.doctorId);
    }, [form.doctorId]);

    const cancelAppointment = async(id) => {
        if(!window.confirm("Cancel this appointment?")) return;
        setMessage("");
        setError("");

        try {

            const response = await api.put(`/appointments/${id}/cancel`);
            setMessage(response.data.message);
            loadData();
            loadAvailability(form.doctorId);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to cancel appointment");
        }
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        if(!form.date) {
            setError("Select an available date for the appointment");
            return;
        }

        try {

            const response = await api.post("/appointments", form);
            setMessage(response.data.message);
            setForm((current) => ({ ...current, date: "", reason: "" }));
            loadData();
            loadAvailability(form.doctorId);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to request appointment");
            loadAvailability(form.doctorId);
        }
    };

    const handleDoctorChange = (event) => {
        setForm({ ...form, doctorId: event.target.value, date: "" });
    };

    return (
        <div className="public-page">
            <section className="page-hero compact">
                <span className="eyebrow">PATIENT ACCESS</span>
                <h1>Appointments</h1>
                <p>This area is available after login. Select a doctor, choose one of the available dates and request an appointment.</p>
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
                        <label>Doctor<select value={form.doctorId} onChange={handleDoctorChange} required><option value="">Select doctor</option>{doctors.map((doctor) => <option value={doctor._id} key={doctor._id}>{doctor.name} — {doctor.specialization}</option>)}</select></label>

                        <div className="date-field">
                            <span className="date-field-label">Available dates</span>

                            {!form.doctorId && <div className="date-empty">Select a doctor to see the available dates.</div>}
                            {form.doctorId && loadingDates && <div className="date-empty">Loading available dates...</div>}
                            {form.doctorId && !loadingDates && availability.length === 0 && <div className="date-empty">This doctor has no available dates in the next two weeks.</div>}

                            {availability.length > 0 && (
                                <div className="date-picker-grid">
                                    {availability.map((item) => (
                                        <button
                                            type="button"
                                            key={item.date}
                                            disabled={item.remaining === 0}
                                            className={`date-card${form.date === item.date ? " selected" : ""}${item.remaining === 0 ? " full" : ""}`}
                                            onClick={() => setForm({ ...form, date: item.date })}
                                        >
                                            <span className="date-card-day">{formatWeekday(item.date)}</span>
                                            <strong>{formatDayMonth(item.date)}</strong>
                                            <span className="date-card-time">{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                                            <span className={`date-card-slots${item.remaining > 0 && item.remaining <= 5 ? " few" : ""}`}>{item.remaining === 0 ? "Fully booked" : `${item.remaining} ${item.remaining === 1 ? "slot" : "slots"} left`}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

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
                                <div><span>{formatDate(appointment.date)}</span><span>Reporting time {formatTime(appointment.time)}</span></div>
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
