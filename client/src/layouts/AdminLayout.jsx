

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = ({ children }) => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        
        <div className="dashboard-shell">
            <aside className="sidebar">
                <div className="sidebar-brand"><span className="brand-mark">H</span><span>CarePoint Hospital</span></div>
                <div className="sidebar-role">ADMINISTRATION</div>
                <nav className="sidebar-nav">
                    <NavLink className="sidebar-link" to="/admin">Dashboard</NavLink>
                    <NavLink className="sidebar-link" to="/admin/departments">Departments</NavLink>
                    <NavLink className="sidebar-link" to="/admin/doctors">Doctors</NavLink>
                    <NavLink className="sidebar-link" to="/admin/users">Patients / Users</NavLink>
                    <NavLink className="sidebar-link" to="/admin/appointments">Appointments</NavLink>
                    <NavLink className="sidebar-link" to="/admin/pharmacy">Pharmacy</NavLink>
                    <NavLink className="sidebar-link" to="/admin/medical-records">Medical Records</NavLink>
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-user"><strong>{user?.name}</strong><span>{user?.email}</span></div>
                    <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
                </div>
            </aside>
            <main className="dashboard-content">{children}</main>
        </div>
    );
};

export default AdminLayout;
