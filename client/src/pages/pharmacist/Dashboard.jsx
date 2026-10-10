

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const emptyReport = {
    summary: { totalMedicines: 0, totalUnits: 0, lowStockCount: 0, expiredCount: 0 },
    medicines: [],
    lowStock: [],
    expired: [],
    transactions: []
};

const Dashboard = () => {
    const [report, setReport] = useState(emptyReport);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async() => {
            try {
                const [reportResponse, ordersResponse] = await Promise.all([
                    api.get("/medicines/reports/inventory"),
                    api.get("/medicine-orders")
                ]);

                setReport({ ...emptyReport, ...reportResponse.data });
                setOrders(ordersResponse.data.orders || []);
            }
            catch(error) {
                setError(error.response?.data?.message || "Unable to load dashboard");
            }
            finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const pendingOrders = orders.filter((order) => order.status === "pending");
    const activeOrders = orders.filter((order) => ["confirmed", "processing", "ready"].includes(order.status));
    const unpaidOrders = orders.filter((order) => order.paymentStatus === "pending" && order.status !== "cancelled");

    const cards = [
        ["Total Medicines", report.summary.totalMedicines, "/pharmacist/medicines"],
        ["Pending Orders", pendingOrders.length, "/pharmacist/orders"],
        ["Orders In Progress", activeOrders.length, "/pharmacist/orders"],
        ["Unpaid Orders", unpaidOrders.length, "/pharmacist/orders"]
    ];

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">PHARMACY</span>
                    <h1>Pharmacist Dashboard</h1>
                    <p>Manage medicine stock, purchases, dispensing and patient medicine orders.</p>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="stats-grid stats-grid-four">
                {cards.map(([label, value, link]) => (
                    <Link className="stat-card admin-stat-card" to={link} key={label}>
                        <span>{label}</span>
                        <strong>{loading ? "—" : value}</strong>
                    </Link>
                ))}
            </div>

            <div className="report-grid">
                <section className="dashboard-section">
                    <div className="dashboard-section-heading">
                        <div>
                            <span className="eyebrow">NEW ORDERS</span>
                            <h2>Pending patient orders</h2>
                        </div>
                        <Link className="outline-button" to="/pharmacist/orders">View Orders</Link>
                    </div>
                    <div className="table-card">
                        <div className="table-scroll">
                            <table>
                                <thead><tr><th>Patient</th><th>Total</th><th>Date</th></tr></thead>
                                <tbody>
                                    {!loading && pendingOrders.length === 0 && <tr><td colSpan="3">No pending orders.</td></tr>}
                                    {pendingOrders.slice(0, 5).map((order) => (
                                        <tr key={order._id}>
                                            <td>{order.patient?.name}</td>
                                            <td>₹{order.totalAmount.toFixed(2)}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="dashboard-section-heading">
                        <div>
                            <span className="eyebrow">STOCK MOVEMENTS</span>
                            <h2>Recent purchases and sales</h2>
                        </div>
                        <Link className="outline-button" to="/pharmacist/reports">Full Report</Link>
                    </div>
                    <div className="table-card">
                        <div className="table-scroll">
                            <table>
                                <thead><tr><th>Medicine</th><th>Type</th><th>Qty</th><th>Date</th></tr></thead>
                                <tbody>
                                    {!loading && report.transactions.length === 0 && <tr><td colSpan="4">No transactions yet.</td></tr>}
                                    {report.transactions.slice(0, 5).map((transaction) => (
                                        <tr key={transaction._id}>
                                            <td>{transaction.medicine?.name}</td>
                                            <td>{transaction.type}</td>
                                            <td>{transaction.quantity}</td>
                                            <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
