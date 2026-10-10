

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useMedicineCart } from "../../context/MedicineCartContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useMedicineCart();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [departmentOpen, setDepartmentOpen] = useState(false);

    useEffect(() => {
        api.get("/departments")
            .then((response) => setDepartments(Array.isArray(response.data.departments) ? response.data.departments : []))
            .catch(() => setDepartments([]));
    }, []);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate("/");
    };

    const closeMenu = () => {
        setMenuOpen(false);
        setDepartmentOpen(false);
    };

    return (
        <header className="navbar hospital-navbar">
            <Link to="/" className="brand hospital-brand" onClick={closeMenu}>
                <img src="https://res.cloudinary.com/eneepkso/image/upload/v1791138326/264488-middle.png" alt="Arogya Hospital Logo" className="hospital-logo" />
                <span>Arogya <small>Hospital</small></span>
            </Link>

            <button
                type="button"
                className="mobile-menu-button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                ☰
            </button>

            <div className={`navbar-content ${menuOpen ? "open" : ""}`}>
                <nav className="nav-links hospital-nav-links">
                    <Link to="/" onClick={closeMenu}>Home</Link>
                    <div className="nav-dropdown" onMouseEnter={() => setDepartmentOpen(true)} onMouseLeave={() => setDepartmentOpen(false)}>
                        <button className="nav-dropdown-button" type="button" onClick={() => setDepartmentOpen((value) => !value)}>Departments <span>⌄</span></button>
                        {departmentOpen && (
                            <div className="nav-dropdown-menu">
                                {departments.map((department) => (
                                    <Link onClick={closeMenu} to={`/departments/${department.slug}`} key={department._id}>{department.name}</Link>
                                ))}
                                <Link className="dropdown-all" onClick={closeMenu} to="/departments">View All Departments</Link>
                            </div>
                        )}
                    </div>
                    <Link to="/doctors" onClick={closeMenu}>Doctors</Link>
                    <Link to="/medicines" onClick={closeMenu}>Medicines</Link>
                    <Link to="/about" onClick={closeMenu}>About</Link>
                    {(!user || user.role === "patient") && <Link to="/appointments" onClick={closeMenu}>Appointments</Link>}
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <span className="user-name">{user.name}</span>

                            {user.role === "patient" && (
                                <>
                                    <Link className="outline-button" to="/medicine-cart" onClick={closeMenu}>Cart ({cartCount})</Link>
                                    <Link className="outline-button" to="/medicine-orders" onClick={closeMenu}>My Medicine Orders</Link>
                                </>
                            )}

                            {user.role === "admin" && <Link className="outline-button" to="/admin" onClick={closeMenu}>Admin Panel</Link>}
                            {user.role === "doctor" && <Link className="outline-button" to="/doctor" onClick={closeMenu}>My Dashboard</Link>}
                            {user.role === "pharmacist" && <Link className="outline-button" to="/pharmacist" onClick={closeMenu}>Pharmacy</Link>}

                            <button className="button button-dark" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link className="outline-button" to="/login" onClick={closeMenu}>Login</Link>
                            <Link className="button button-dark" to="/register" onClick={closeMenu}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
