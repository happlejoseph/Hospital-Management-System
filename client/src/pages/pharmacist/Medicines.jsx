

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatDate, isExpired } from "../../utils/formatDate";

const emptyForm = {
    name: "",
    category: "",
    description: "",
    batchNumber: "",
    expiryDate: "",
    quantity: "",
    supplier: "",
    purchasePrice: "",
    sellingPrice: "",
    lowStockThreshold: "10",
    requiresPrescription: false,
    image: null
};

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState(emptyForm);
    const [filter, setFilter] = useState("all");
    const [editingExpiryId, setEditingExpiryId] = useState("");
    const [expiryValue, setExpiryValue] = useState("");

    const loadMedicines = async() => {
        try {
            const response = await api.get("/medicines");
            setMedicines(response.data.medicines || []);
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to load medicines");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMedicines();
    }, []);

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === "requiresPrescription"
                ? value === "true"
                : name === "image"
                    ? files[0] || null
                    : value
        }));
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if(value !== null && value !== "") {
                    data.append(key, value);
                }
            });

            const response = await api.post("/medicines", data);
            setMessage(response.data.message);
            setFormData(emptyForm);
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to add medicine");
        }
        finally {
            setSaving(false);
        }
    };


    const togglePrescription = async(medicine) => {
        setError("");
        setMessage("");

        try {
            await api.put(`/medicines/${medicine._id}`, {
                requiresPrescription: !medicine.requiresPrescription
            });

            setMessage(`${medicine.name} ${medicine.requiresPrescription ? "no longer requires" : "now requires"} a prescription`);
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to update medicine");
        }
    };

    const startExpiryEdit = (medicine) => {
        setEditingExpiryId(medicine._id);
        setExpiryValue(new Date(medicine.expiryDate).toISOString().slice(0, 10));
    };

    const saveExpiry = async(medicine) => {
        setError("");
        setMessage("");

        try {
            await api.put(`/medicines/${medicine._id}`, { expiryDate: expiryValue });
            setMessage(`Expiry date updated for ${medicine.name}`);
            setEditingExpiryId("");
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to update expiry date");
        }
    };

    const deleteMedicine = async(id) => {
        if(!window.confirm("Delete this medicine?")) return;

        setError("");
        setMessage("");

        try {
            const response = await api.delete(`/medicines/${id}`);
            setMessage(response.data.message);
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to delete medicine");
        }
    };

    const totalStock = medicines.reduce((total, medicine) => total + Number(medicine.quantity || 0), 0);
    const lowStockMedicines = medicines.filter((medicine) => medicine.quantity <= medicine.lowStockThreshold);
    const expiredMedicines = medicines.filter((medicine) => isExpired(medicine.expiryDate));

    const visibleMedicines = filter === "low" ? lowStockMedicines : filter === "expired" ? expiredMedicines : medicines;
    const tableTitle = filter === "low" ? "Low Stock Medicines" : filter === "expired" ? "Expired Medicines" : "Current Medicine Stock";
    const emptyMessage = filter === "low" ? "No low stock medicines." : filter === "expired" ? "No expired medicines." : "No medicines added yet.";

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">INVENTORY</span>
                    <h1>Medicine Stock</h1>
                    <p>Add medicines, images and stock information.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="stats-grid stats-grid-four">
                <button type="button" className={filter === "all" ? "stat-card filter-card active" : "stat-card filter-card"} onClick={() => setFilter("all")}><span>Total Medicines</span><strong>{medicines.length}</strong></button>
                <div className="stat-card"><span>Total Medicine Stock</span><strong>{totalStock}</strong></div>
                <button type="button" className={filter === "low" ? "stat-card filter-card active" : "stat-card filter-card"} onClick={() => setFilter("low")}><span>Low Stock</span><strong>{lowStockMedicines.length}</strong></button>
                <button type="button" className={filter === "expired" ? "stat-card filter-card active" : "stat-card filter-card"} onClick={() => setFilter("expired")}><span>Expired</span><strong>{expiredMedicines.length}</strong></button>
            </div>

            <div className="form-card wide-form-card">
                <div className="table-title">Add New Medicine</div>
                <form onSubmit={handleSubmit} className="form-grid medicine-form">
                    <label>Medicine Name<input type="text" name="name" value={formData.name} onChange={handleChange} required /></label>
                    <label>Medicine Image<input type="file" name="image" accept="image/*" onChange={handleChange} /></label>
                    <label>Category<input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Example: Pain Relief" /></label>
                    <label>Description<input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Short details about the medicine" /></label>
                    <label>Batch Number<input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} required /></label>
                    <label>Expiry Date<input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required /></label>
                    <label>Initial Quantity<input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleChange} required /></label>
                    <label>Supplier<input type="text" name="supplier" value={formData.supplier} onChange={handleChange} required /></label>
                    <label>Purchase Price<input type="number" name="purchasePrice" min="0" step="0.01" value={formData.purchasePrice} onChange={handleChange} required /></label>
                    <label>Selling Price<input type="number" name="sellingPrice" min="0" step="0.01" value={formData.sellingPrice} onChange={handleChange} required /></label>
                    <label>Low Stock Threshold<input type="number" name="lowStockThreshold" min="0" value={formData.lowStockThreshold} onChange={handleChange} required /></label>
                    <label>Prescription Required<select name="requiresPrescription" value={String(formData.requiresPrescription)} onChange={handleChange}><option value="false">No</option><option value="true">Yes</option></select></label>
                    <div className="form-actions"><button className="button button-dark" type="submit" disabled={saving}>{saving ? "Adding..." : "Add Medicine"}</button></div>
                </form>
            </div>

            <div className="table-card medicine-table">
                <div className="table-title">{tableTitle}</div>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr><th>Image</th><th>Medicine</th><th>Batch</th><th>Expiry</th><th>Supplier</th><th>Stock</th><th>Selling Price</th><th>Prescription (click to change)</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="9">Loading...</td></tr>}
                            {!loading && visibleMedicines.length === 0 && <tr><td colSpan="9">{emptyMessage}</td></tr>}
                            {visibleMedicines.map((medicine) => (
                                <tr key={medicine._id}>
                                    <td>{medicine.image ? <img className="medicine-table-image" src={medicine.image} alt={medicine.name} /> : <span className="medicine-image-placeholder">No image</span>}</td>
                                    <td>{medicine.name}</td>
                                    <td>{medicine.batchNumber}</td>
                                    <td>
                                        {editingExpiryId === medicine._id ? (
                                            <>
                                                <input type="date" value={expiryValue} onChange={(event) => setExpiryValue(event.target.value)} />
                                                <button className="small-action" onClick={() => saveExpiry(medicine)}>Save</button>
                                                <button className="small-action" onClick={() => setEditingExpiryId("")}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                {formatDate(medicine.expiryDate)}
                                                {isExpired(medicine.expiryDate) && <span className="stock-badge low" style={{ marginLeft: 8 }}>Expired</span>}
                                                <button className="small-action" style={{ marginLeft: 8 }} onClick={() => startExpiryEdit(medicine)}>Edit</button>
                                            </>
                                        )}
                                    </td>
                                    <td>{medicine.supplier}</td>
                                    <td><span className={medicine.quantity <= medicine.lowStockThreshold ? "stock-badge low" : "stock-badge"}>{medicine.quantity}</span></td>
                                    <td>₹{medicine.sellingPrice}</td>
                                    <td><button className="small-action" onClick={() => togglePrescription(medicine)}>{medicine.requiresPrescription ? "Required" : "Not required"}</button></td>
                                    <td>{medicine.quantity <= medicine.lowStockThreshold && <Link className="small-action" to={`/pharmacist/purchase?medicine=${medicine._id}`}>Purchase</Link>} <button className="small-action danger" onClick={() => deleteMedicine(medicine._id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Medicines;
