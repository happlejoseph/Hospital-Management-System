

import { useEffect, useState } from "react";
import api from "../../services/api";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadUsers = async() => {
        try {
            const response = await api.get("/users");
            setUsers(response.data.users || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load patients");
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const deleteUser = async(id) => {
        if(!window.confirm("Delete this patient?")) return;

        try {
            const response = await api.delete(`/users/${id}`);
            setMessage(response.data.message);
            setError("");
            await loadUsers();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete patient");
        }
    };

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">ADMIN</span>
                    <h1>Patients</h1>
                    <p>Manage registered patient accounts.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="table-card">
                <div className="table-title">Registered patients</div>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Email</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && <tr><td colSpan="5">No patients registered yet.</td></tr>}
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.status}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td><button className="small-action danger" onClick={() => deleteUser(user._id)}>Delete</button></td>
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
