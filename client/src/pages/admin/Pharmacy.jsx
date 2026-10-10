

import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatDate, isExpired } from "../../utils/formatDate";

const filterTitles = {
    all: "Complete Medicine Inventory",
    low: "Low Stock Medicines",
    expired: "Expired Medicines"
};

const filterEmptyMessages = {
    all: "No medicines added yet.",
    low: "No low stock medicines.",
    expired: "No expired medicines."
};

const Pharmacy = () => {
    const [medicines, setMedicines] = useState([]);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const loadMedicines = async() => {
        try {
            const response = await api.get("/medicines");
            setMedicines(response.data.medicines || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load medicines");
        }
    };

    useEffect(() => {
        loadMedicines();
    }, []);

    const totalStock = medicines.reduce((total, medicine) => total + Number(medicine.quantity || 0), 0);
    const lowStockMedicines = medicines.filter((medicine) => medicine.quantity <= medicine.lowStockThreshold);
    const expiredMedicines = medicines.filter((medicine) => isExpired(medicine.expiryDate));

    const visibleMedicines = filter === "low" ? lowStockMedicines : filter === "expired" ? expiredMedicines : medicines;

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">ADMIN</span>
                    <h1>Pharmacy</h1>
                    <p>View complete medicine details, total stock and pharmacy activity.</p>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="stats-grid stats-grid-four admin-stats-grid">
                <button type="button" className={filter === "all" ? "stat-card filter-card active" : "stat-card filter-card"} onClick={() => setFilter("all")}><span>Total Medicines</span><strong>{medicines.length}</strong></button>
                <div className="stat-card"><span>Total Medicine Stock</span><strong>{totalStock}</strong></div>
                <button type="button" className={filter === "low" ? "stat-card filter-card active" : "stat-card filter-card"} onClick={() => setFilter("low")}><span>Low Stock</span><strong>{lowStockMedicines.length}</strong></button>
                <button type="button" className={filter === "expired" ? "stat-card filter-card active" : "stat-card filter-card"} onClick={() => setFilter("expired")}><span>Expired</span><strong>{expiredMedicines.length}</strong></button>
            </div>

            <div className="table-card">
                <div className="table-title">{filterTitles[filter]}</div>
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>Image</th><th>Medicine</th><th>Batch</th><th>Expiry</th><th>Supplier</th><th>Purchase Price</th><th>Selling Price</th><th>Stock</th><th>Threshold</th><th>Prescription</th></tr></thead>
                        <tbody>
                            {visibleMedicines.length === 0 && <tr><td colSpan="10">{filterEmptyMessages[filter]}</td></tr>}
                            {visibleMedicines.map((medicine) => (
                                <tr key={medicine._id}>
                                    <td>{medicine.image ? <img className="medicine-table-image" src={medicine.image} alt={medicine.name} /> : <span className="medicine-image-placeholder">No image</span>}</td>
                                    <td>{medicine.name}</td>
                                    <td>{medicine.batchNumber}</td>
                                    <td>{formatDate(medicine.expiryDate)}{isExpired(medicine.expiryDate) && <span className="stock-badge low" style={{ marginLeft: 8 }}>Expired</span>}</td>
                                    <td>{medicine.supplier}</td>
                                    <td>₹{Number(medicine.purchasePrice).toFixed(2)}</td>
                                    <td>₹{Number(medicine.sellingPrice).toFixed(2)}</td>
                                    <td><span className={medicine.quantity <= medicine.lowStockThreshold ? "stock-badge low" : "stock-badge"}>{medicine.quantity}</span></td>
                                    <td>{medicine.lowStockThreshold}</td>
                                    <td>{medicine.requiresPrescription ? "Required" : "Not required"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Pharmacy;
