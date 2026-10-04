

import { useEffect, useState } from "react";
import api from "../../services/api";

const Users = () => {

    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", role: "patient", status: "active" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadUsers = async() => {
        try {

            const response = await api.get("/users");
            setUsers(response.data.users || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load users");
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const editUser = (user) => {
        setEditingId(user._id);
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setMessage("");
        setError("");
    };

    const updateUser = async(event) => {
        event.preventDefault();
        try {
            const response = await api.put(`/users/${editingId}`, form);
            setMessage(response.data.message);
            setEditingId(null);
            await loadUsers();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to update user");
        }
    };

    const deleteUser = async(id) => {
        if(!window.confirm("Delete this user?")) return;

        try {
            const response = await api.delete(`/users/${id}`);
            setMessage(response.data.message);
            await loadUsers();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete user");
        }
    };



    
    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">ADMIN</span>
                    <h1>Patients / Users</h1>
                    <p>Review registered accounts and manage their roles and status.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            {editingId && (
                <form className="form-card" onSubmit={updateUser}>
                    <div className="table-title">Edit User</div>
                    <div className="form-grid">
                        <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
                        <label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="patient">Patient</option><option value="doctor">Doctor</option><option value="pharmacist">Pharmacist</option><option value="admin">Admin</option></select></label>
                        <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                        <div className="form-actions"><button className="button button-dark" type="submit">Update User</button><button className="outline-button admin-cancel" type="button" onClick={() => setEditingId(null)}>Cancel</button></div>
                    </div>
                </form>
            )}

            <div className="table-card">
                <div className="table-title">Registered accounts</div>
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.length === 0 && <tr><td colSpan="6">No users found.</td></tr>}
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.status}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td><button className="small-action" onClick={() => editUser(user)}>Edit</button><button className="small-action danger" onClick={() => deleteUser(user._id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
