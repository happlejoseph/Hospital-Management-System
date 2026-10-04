

import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {patient: "", doctor: "", appointment: "", diagnosis: "", symptoms: "", notes: "", treatment: "", prescription: ""};

const MedicalRecords = () => {
    const [records, setRecords] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadData = async() => {
        try {
            const [recordsResponse, usersResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
                api.get("/medical-records"),
                api.get("/users"),
                api.get("/doctors"),
                api.get("/appointments/admin/all")
            ]);
            setRecords(recordsResponse.data.records || []);
            setPatients((usersResponse.data.users || []).filter((user) => user.role === "patient"));
            setDoctors(doctorsResponse.data.doctors || []);
            setAppointments(appointmentsResponse.data.appointments || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load medical records");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = editingId
                ? await api.put(`/medical-records/${editingId}`, form)
                : await api.post("/medical-records", form);

            setMessage(response.data.message);
            setForm(emptyForm);
            setEditingId(null);
            await loadData();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to save medical record");
        }
    };

    const editRecord = (record) => {
        setEditingId(record._id);
        setForm({
            patient: record.patient?._id || "",
            doctor: record.doctor?._id || "",
            appointment: record.appointment?._id || "",
            diagnosis: record.diagnosis || "",
            symptoms: record.symptoms || "",
            notes: record.notes || "",
            treatment: record.treatment || "",
            prescription: record.prescription || ""
        });
    };

    const deleteRecord = async(id) => {
        if(!window.confirm("Delete this medical record?")) return;

        try {
            const response = await api.delete(`/medical-records/${id}`);
            setMessage(response.data.message);
            await loadData();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete medical record");
        }
    };

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">ADMIN</span>
                    <h1>Medical Records</h1>
                    <p>Create and manage patient diagnosis, treatment and prescription records.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <form className="form-card wide-form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <label>Patient<select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required><option value="">Select patient</option>{patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name} — {patient.email}</option>)}</select></label>
                    <label>Doctor<select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required><option value="">Select doctor</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name} — {doctor.specialization}</option>)}</select></label>
                    <label>Appointment<select value={form.appointment} onChange={(e) => setForm({ ...form, appointment: e.target.value })}><option value="">Optional</option>{appointments.map((appointment) => <option key={appointment._id} value={appointment._id}>{appointment.patient?.name} — {appointment.date} {appointment.time}</option>)}</select></label>
                    <label>Diagnosis<input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required /></label>
                    <label className="form-actions">Symptoms<textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} /></label>
                    <label className="form-actions">Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
                    <label className="form-actions">Treatment<textarea value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} /></label>
                    <label className="form-actions">Prescription<textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} /></label>
                    <div className="form-actions">
                        <button className="button button-dark" type="submit">{editingId ? "Update Record" : "Create Record"}</button>
                        {editingId && <button className="outline-button admin-cancel" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
                    </div>
                </div>
            </form>

            <div className="table-card">
                <div className="table-title">Medical records</div>
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Treatment</th><th>Created</th><th>Actions</th></tr></thead>
                        <tbody>
                            {records.length === 0 && <tr><td colSpan="6">No medical records yet.</td></tr>}
                            {records.map((record) => (
                                <tr key={record._id}>
                                    <td>{record.patient?.name}</td>
                                    <td>{record.doctor?.name}</td>
                                    <td>{record.diagnosis}</td>
                                    <td>{record.treatment || "—"}</td>
                                    <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                                    <td><button className="small-action" onClick={() => editRecord(record)}>Edit</button><button className="small-action danger" onClick={() => deleteRecord(record._id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecords;
