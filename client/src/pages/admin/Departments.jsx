

import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = { name: "", description: "", bannerImage: "", status: "active" };

const Departments = () => {

    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadDepartments = async() => {
        const response = await api.get("/departments/admin/all");
        setDepartments(response.data.departments || []);
    };

    useEffect(() => {
        loadDepartments().catch(() => setError("Unable to load departments"));
    }, []);

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        try {

            if(editingId) await api.put(`/departments/${editingId}`, form);
            else await api.post("/departments", form);
            setMessage(editingId ? "Department updated successfully" : "Department created successfully");
            setForm(emptyForm);
            setEditingId(null);
            loadDepartments();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to save department");
        }
    };

    const editDepartment = (department) => {
        setEditingId(department._id);
        setForm({ name: department.name, description: department.description, bannerImage: department.bannerImage || "", status: department.status });
    };

    const deleteDepartment = async(id) => {

        if(!window.confirm("Delete this department?")) return;
        try {

            await api.delete(`/departments/${id}`);
            loadDepartments();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete department");
        }
    };



    return (
        
        <div>
            <div className="dashboard-heading"><div><span className="eyebrow">ADMIN</span><h1>Departments</h1><p>Create and manage public department pages.</p></div></div>
            <form className="form-card wide-form-card" onSubmit={handleSubmit}>
                {message && <div className="form-success">{message}</div>}
                {error && <div className="form-error">{error}</div>}
                <div className="form-grid">
                    <label>Department name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
                    <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                    <label className="form-actions">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
                    <label className="form-actions">Cloudinary banner URL<input value={form.bannerImage} onChange={(event) => setForm({ ...form, bannerImage: event.target.value })} placeholder="Paste department image URL here" /></label>
                    <div className="form-actions"><button className="button button-dark" type="submit">{editingId ? "Update Department" : "Add Department"}</button>{editingId && <button className="outline-button admin-cancel" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
                </div>
            </form>

            <div className="table-card"><div className="table-title">Department list</div><table><thead><tr><th>Name</th><th>Slug</th><th>Status</th><th>Banner</th><th>Actions</th></tr></thead><tbody>{departments.map((department) => <tr key={department._id}><td>{department.name}</td><td>{department.slug}</td><td>{department.status}</td><td>{department.bannerImage ? "Added" : "Not added"}</td><td><button className="small-action" onClick={() => editDepartment(department)}>Edit</button><button className="small-action danger" onClick={() => deleteDepartment(department._id)}>Delete</button></td></tr>)}</tbody></table></div>
        </div>
    );
};

export default Departments;
