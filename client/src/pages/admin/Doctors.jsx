

import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = { name: "", email: "", password: "", phone: "", specialization: "", qualification: "", experience: "", department: "", image: "", status: "active" };

const Doctors = () => {

    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadData = async() => {

        const [doctorResponse, departmentResponse] = await Promise.all([api.get("/doctors"), api.get("/departments")]);
        setDoctors(doctorResponse.data.doctors || []);
        setDepartments(departmentResponse.data.departments || []);
    };

    useEffect(() => {
        loadData().catch(() => setError("Unable to load doctors"));
    }, []);

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        try {
            
            if(editingId) {
                const { password, email, ...updateForm } = form;
                await api.put(`/doctors/${editingId}`, { ...updateForm, email });
                setMessage("Doctor updated successfully");
            }
            else {
                await api.post("/doctors", { ...form, experience: Number(form.experience) });
                setMessage("Doctor created successfully");
            }
            setForm(emptyForm);
            setEditingId(null);
            loadData();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to save doctor");
        }
    };

    const editDoctor = (doctor) => {
        setEditingId(doctor._id);
        setForm({ name: doctor.name, email: doctor.email, password: "", phone: doctor.phone, specialization: doctor.specialization, qualification: doctor.qualification, experience: doctor.experience, department: doctor.department, image: doctor.image || "", status: doctor.status });
    };

    const deleteDoctor = async(id) => {
        if(!window.confirm("Delete this doctor?")) return;
        try {

            await api.delete(`/doctors/${id}`);
            loadData();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete doctor");
        }
    };


    

    return (
        <div>
            <div className="dashboard-heading"><div><span className="eyebrow">ADMIN</span><h1>Doctors</h1><p>Add doctors, assign departments and manage their public profiles.</p></div></div>
            <form className="form-card wide-form-card" onSubmit={handleSubmit}>
                {message && <div className="form-success">{message}</div>}
                {error && <div className="form-error">{error}</div>}
                <div className="form-grid">
                    <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                    <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
                    {!editingId && <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength="6" required /></label>}
                    <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></label>
                    <label>Specialization<input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required /></label>
                    <label>Qualification<input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required /></label>
                    <label>Experience (years)<input type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required /></label>
                    <label>Department<select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required><option value="">Select department</option>{departments.map((department) => <option key={department._id} value={department.name}>{department.name}</option>)}</select></label>
                    <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                    <label className="form-actions">Cloudinary doctor image URL<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Paste Cloudinary image URL here later" /></label>
                    <div className="form-actions"><button className="button button-dark" type="submit">{editingId ? "Update Doctor" : "Add Doctor"}</button>{editingId && <button className="outline-button admin-cancel" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
                </div>
            </form>

            <div className="table-card"><div className="table-title">Doctor list</div><table><thead><tr><th>Name</th><th>Specialization</th><th>Department</th><th>Experience</th><th>Status</th><th>Actions</th></tr></thead><tbody>{doctors.map((doctor) => <tr key={doctor._id}><td>{doctor.name}</td><td>{doctor.specialization}</td><td>{doctor.department}</td><td>{doctor.experience} years</td><td>{doctor.status}</td><td><button className="small-action" onClick={() => editDoctor(doctor)}>Edit</button><button className="small-action danger" onClick={() => deleteDoctor(doctor._id)}>Delete</button></td></tr>)}</tbody></table></div>
        </div>
    );
};

export default Doctors;
