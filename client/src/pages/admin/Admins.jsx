

import { useEffect, useState } from "react";
import api from "../../services/api";

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async() => {
            try {
                const response = await api.get("/users/admins");
                setAdmins(response.data.users || []);
            }
            catch(error) {
                setError(error.response?.data?.message || "Unable to load admins");
            }
        };
        load();
    }, []);

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        try {
            const response = await api.post("/users/admin", form);
            setMessage(response.data.message);
            setForm({ name: "", email: "", password: "" });
            const adminsResponse = await api.get("/users/admins");
            setAdmins(adminsResponse.data.users || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to create admin");
        }
    };

    const deleteAdmin = async(id) => {
        if(!window.confirm("Delete this admin?")) return;
        try {
            const response = await api.delete(`/users/${id}`);
            setMessage(response.data.message);
            const adminsResponse = await api.get("/users/admins");
            setAdmins(adminsResponse.data.users || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete admin");
        }
    };

    return (
        <div>
            <div className="dashboard-heading">
                <div><span className="eyebrow">ADMIN</span><h1>Admins</h1><p>Add and manage administrator accounts.</p></div>
            </div>
            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}
            <form className="form-card" onSubmit={handleSubmit}>
                <div className="table-title">Add Admin</div>
                <div className="form-grid">
                    <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                    <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
                    <label>Password<input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
                    <div className="form-actions"><button className="button button-dark" type="submit">Add Admin</button></div>
                </div>
            </form>
            <div className="table-card">
                <div className="table-title">Administrator accounts</div>
                <div className="table-scroll">
                    <table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                        {admins.length === 0 && <tr><td colSpan="4">No admins found.</td></tr>}
                        {admins.map((admin) => <tr key={admin._id}><td>{admin.name}</td><td>{admin.email}</td><td>{admin.status}</td><td><button className="small-action danger" onClick={() => deleteAdmin(admin._id)}>Delete</button></td></tr>)}
                    </tbody></table>
                </div>
            </div>
        </div>
    );
};

export default Admins;
