

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        api.get("/departments")
            .then((response) => setDepartments(response.data.departments || []))
            .catch(() => setDepartments([]));
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="navbar hospital-navbar">
            <Link to="/" className="brand hospital-brand">
                <span className="brand-mark">H</span>
                <span>CarePoint <small>Hospital</small></span>
            </Link>

            <nav className="nav-links hospital-nav-links">
                <Link to="/">Home</Link>
                <div className="nav-dropdown" onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
                    <button className="nav-dropdown-button" onClick={() => setMenuOpen((value) => !value)}>Departments <span>⌄</span></button>
                    {menuOpen && (
                        <div className="nav-dropdown-menu">
                            {departments.map((department) => <Link onClick={() => setMenuOpen(false)} to={`/departments/${department.slug}`} key={department._id}>{department.name}</Link>)}
                            <Link className="dropdown-all" onClick={() => setMenuOpen(false)} to="/departments">View All Departments</Link>
                        </div>
                    )}
                </div>
                <Link to="/doctors">Doctors</Link>
                <Link to="/departments">Medical Care</Link>
                <Link to="/appointments">Appointments</Link>
            </nav>

            <div className="nav-actions">
                {user ? (
                    <>
                        <span className="user-name">{user.name}</span>
                        {user.role === "admin" && <Link className="outline-button" to="/admin">Admin</Link>}
                        {user.role === "pharmacist" && <Link className="outline-button" to="/pharmacist">Pharmacy</Link>}
                        <button className="button button-dark" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link className="outline-button" to="/login">Login</Link>
                        <Link className="button button-dark" to="/register">Register</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
