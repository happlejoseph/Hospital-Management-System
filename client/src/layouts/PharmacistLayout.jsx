

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PharmacistLayout = ({ children }) => {

    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const links = [
        { label: "Dashboard", path: "/pharmacist" },
        { label: "Medicine Stock", path: "/pharmacist/medicines" },
        { label: "Purchase Medicines", path: "/pharmacist/purchase" },
        { label: "Dispense Medicines", path: "/pharmacist/dispense" },
        { label: "Inventory Reports", path: "/pharmacist/reports" }
    ];

    return (
        
        <div className="dashboard-shell">
            <aside className="sidebar">
                <Link to="/" className="sidebar-brand">
                    <span className="brand-mark">H</span>
                    <span>CarePoint</span>
                </Link>

                <div className="sidebar-role">PHARMACIST</div>

                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={location.pathname === link.path ? "sidebar-link active" : "sidebar-link"}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <strong>{user?.name}</strong>
                        <span>{user?.email}</span>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
                </div>
            </aside>

            <main className="dashboard-content">{children}</main>
        </div>
    );
};

export default PharmacistLayout;
