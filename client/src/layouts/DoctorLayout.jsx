

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DoctorLayout = ({ children }) => {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (

        <div className="dashboard-shell">
            <aside className="sidebar">
                <Link to="/" className="sidebar-brand"><img src="https://res.cloudinary.com/eneepkso/image/upload/v1791138326/264488-middle.png" alt="Arogya Hospital Logo" className="hospital-logo" /><span>Arogya Hospital</span></Link>
                <div className="sidebar-role">DOCTOR</div>
                <nav className="sidebar-nav">
                    <NavLink className="sidebar-link" to="/doctor" end>Dashboard</NavLink>
                    <NavLink className="sidebar-link" to="/doctor/appointments">Appointments</NavLink>
                    <NavLink className="sidebar-link" to="/doctor/medical-records">Medical Records</NavLink>
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

export default DoctorLayout;
