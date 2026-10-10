

import { useEffect, useState } from "react";
import api from "../../services/api";

const Pharmacists = () => {
    const [pharmacists, setPharmacists] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadPharmacists = async() => {
        try {
            const response = await api.get("/users/pharmacists");
            setPharmacists(response.data.users || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load pharmacists");
        }
    };

    useEffect(() => {
        loadPharmacists();
    }, []);

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await api.post("/users/pharmacist", form);
            setMessage(response.data.message);
            setForm({ name: "", email: "", password: "" });
            await loadPharmacists();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to create pharmacist");
        }
    };

    const toggleStatus = async(pharmacist) => {
        setMessage("");
        setError("");

        try {
            const response = await api.put(`/users/${pharmacist._id}`, {
                name: pharmacist.name,
                email: pharmacist.email,
                role: "pharmacist",
                status: pharmacist.status === "active" ? "inactive" : "active"
            });

            setMessage(response.data.message);
            await loadPharmacists();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to update pharmacist");
        }
    };

    const deletePharmacist = async(id) => {
        if(!window.confirm("Delete this pharmacist?")) return;

        setMessage("");
        setError("");

        try {
            const response = await api.delete(`/users/${id}`);
            setMessage(response.data.message);
            await loadPharmacists();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete pharmacist");
        }
    };

    return (
        <div>
            <div className="dashboard-heading">
                <div><span className="eyebrow">ADMIN</span><h1>Pharmacists</h1><p>Add and manage pharmacist accounts.</p></div>
            </div>
            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="stats-grid admin-stats-grid">
                <div className="stat-card"><span>Total Pharmacists</span><strong>{pharmacists.length}</strong></div>
                <div className="stat-card"><span>Active</span><strong>{pharmacists.filter((pharmacist) => pharmacist.status === "active").length}</strong></div>
                <div className="stat-card"><span>Inactive</span><strong>{pharmacists.filter((pharmacist) => pharmacist.status === "inactive").length}</strong></div>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
                <div className="table-title">Add Pharmacist</div>
                <div className="form-grid">
                    <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                    <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
                    <label>Password<input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
                    <div className="form-actions"><button className="button button-dark" type="submit">Add Pharmacist</button></div>
                </div>
            </form>

            <div className="table-card">
                <div className="table-title">Pharmacist accounts</div>
                <div className="table-scroll">
                    <table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                        {pharmacists.length === 0 && <tr><td colSpan="4">No pharmacists found.</td></tr>}
                        {pharmacists.map((pharmacist) => <tr key={pharmacist._id}><td>{pharmacist.name}</td><td>{pharmacist.email}</td><td>{pharmacist.status}</td><td><button className="small-action" onClick={() => toggleStatus(pharmacist)}>{pharmacist.status === "active" ? "Deactivate" : "Activate"}</button> <button className="small-action danger" onClick={() => deletePharmacist(pharmacist._id)}>Delete</button></td></tr>)}
                    </tbody></table>
                </div>
            </div>
        </div>
    );
};

export default Pharmacists;
