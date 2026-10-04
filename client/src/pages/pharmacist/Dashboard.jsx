

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Dashboard = () => {
    const [summary, setSummary] = useState({ totalMedicines: 0, totalUnits: 0, lowStockCount: 0, expiredCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReport = async() => {
            try {
                const response = await api.get("/medicines/reports/inventory");
                setSummary(response.data.summary);
            }
            catch(error) {
                console.error(error);
            }
            finally {
                setLoading(false);
            }
        };

        loadReport();
    }, []);

    const cards = [
        ["Medicine Types", summary.totalMedicines],
        ["Total Units", summary.totalUnits],
        ["Low Stock", summary.lowStockCount],
        ["Expired", summary.expiredCount]
    ];

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">PHARMACY</span>
                    <h1>Pharmacist Dashboard</h1>
                    <p>Manage medicine stock, purchases, dispensing and inventory reports.</p>
                </div>
                <Link className="button button-dark" to="/pharmacist/medicines">View Stock</Link>
            </div>

            <div className="stats-grid">
                {cards.map(([label, value]) => (
                    <div className="stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{loading ? "—" : value}</strong>
                    </div>
                ))}
            </div>

            <div className="quick-grid">
                <Link to="/pharmacist/purchase" className="quick-card"><strong>Purchase Medicines</strong><span>Add stock to existing medicines.</span></Link>
                <Link to="/pharmacist/dispense" className="quick-card"><strong>Dispense Medicines</strong><span>Record medicine given to a patient.</span></Link>
                <Link to="/pharmacist/reports" className="quick-card"><strong>Inventory Reports</strong><span>Check low stock, expiry and movements.</span></Link>
                <Link to="/pharmacist/orders" className="quick-card"><strong>Medicine Orders</strong><span>Review and manage patient medicine orders.</span></Link>
            </div>
        </div>
    );
};

export default Dashboard;
