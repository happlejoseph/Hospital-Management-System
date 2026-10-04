

import { useEffect, useState } from "react";
import api from "../../services/api";

const InventoryReports = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReport = async() => {
            try {
                const response = await api.get("/medicines/reports/inventory");
                setReport(response.data);
            }
            finally {
                setLoading(false);
            }
        };

        loadReport();
    }, []);

    if(loading) {
        return <div className="page-loading">Loading report...</div>;
    }

    return (
        <div>
            <div className="dashboard-heading"><div><span className="eyebrow">REPORTS</span><h1>Inventory Reports</h1><p>Review current stock and recent medicine movements.</p></div></div>
            <div className="stats-grid">
                <div className="stat-card"><span>Medicine Types</span><strong>{report.summary.totalMedicines}</strong></div>
                <div className="stat-card"><span>Total Units</span><strong>{report.summary.totalUnits}</strong></div>
                <div className="stat-card"><span>Low Stock</span><strong>{report.summary.lowStockCount}</strong></div>
                <div className="stat-card"><span>Expired</span><strong>{report.summary.expiredCount}</strong></div>
            </div>

            <div className="report-grid">
                <div className="table-card">
                    <div className="table-title">Low Stock Medicines</div>
                    <table><thead><tr><th>Medicine</th><th>Stock</th><th>Threshold</th></tr></thead><tbody>{report.lowStock.length === 0 ? <tr><td colSpan="3">No low-stock medicines.</td></tr> : report.lowStock.map((medicine) => <tr key={medicine._id}><td>{medicine.name}</td><td>{medicine.quantity}</td><td>{medicine.lowStockThreshold}</td></tr>)}</tbody></table>
                </div>
                <div className="table-card">
                    <div className="table-title">Expired Medicines</div>
                    <table><thead><tr><th>Medicine</th><th>Batch</th><th>Expiry</th></tr></thead><tbody>{report.expired.length === 0 ? <tr><td colSpan="3">No expired medicines.</td></tr> : report.expired.map((medicine) => <tr key={medicine._id}><td>{medicine.name}</td><td>{medicine.batchNumber}</td><td>{new Date(medicine.expiryDate).toLocaleDateString()}</td></tr>)}</tbody></table>
                </div>
            </div>

            <div className="table-card report-history">
                <div className="table-title">Recent Stock Movements</div>
                <table><thead><tr><th>Medicine</th><th>Type</th><th>Quantity</th><th>Patient/Supplier</th><th>Date</th></tr></thead><tbody>{report.transactions.length === 0 ? <tr><td colSpan="5">No transactions yet.</td></tr> : report.transactions.map((transaction) => <tr key={transaction._id}><td>{transaction.medicine?.name}</td><td>{transaction.type}</td><td>{transaction.quantity}</td><td>{transaction.type === "dispense" ? transaction.patientName : transaction.supplier}</td><td>{new Date(transaction.createdAt).toLocaleString()}</td></tr>)}</tbody></table>
            </div>
        </div>
    );
};

export default InventoryReports;
