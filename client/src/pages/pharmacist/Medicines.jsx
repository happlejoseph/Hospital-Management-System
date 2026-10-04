

import { useEffect, useState } from "react";
import api from "../../services/api";

const Medicines = () => {
    
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        batchNumber: "",
        expiryDate: "",
        quantity: "",
        supplier: "",
        purchasePrice: "",
        sellingPrice: "",
        lowStockThreshold: "10",
        requiresPrescription: false
    });

    const loadMedicines = async() => {
        try {
            const response = await api.get("/medicines");
            setMedicines(response.data.medicines);
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
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === 'requiresPrescription' ? value === "true" : value
        }));
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await api.post("/medicines", formData);
            setMessage(response.data.message);

            setFormData({
                name: "",
                batchNumber: "",
                expiryDate: "",
                quantity: "",
                supplier: "",
                purchasePrice: "",
                sellingPrice: "",
                lowStockThreshold: "10",
                requiresPrescription: false
            });
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to add medicine");
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">INVENTORY</span>
                    <h1>Medicine Stock</h1>
                    <p>Add medicines and view the current stock stored in MongoDB.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="form-card wide-form-card">
                <div className="table-title">Add New Medicine</div>
                <form onSubmit={handleSubmit} className="form-grid medicine-form">
                    <label>Medicine Name<input type="text" name="name" value={formData.name} onChange={handleChange} required /></label>
                    <label>Batch Number<input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} required /></label>
                    <label>Expiry Date<input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required /></label>
                    <label>Initial Quantity<input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleChange} required /></label>
                    <label>Supplier<input type="text" name="supplier" value={formData.supplier} onChange={handleChange} required /></label>
                    <label>Purchase Price<input type="number" name="purchasePrice" min="0" step="0.01" value={formData.purchasePrice} onChange={handleChange} required /></label>
                    <label>Selling Price<input type="number" name="sellingPrice" min="0" step="0.01" value={formData.sellingPrice} onChange={handleChange} required /></label>
                    <label>Low Stock Threshold<input type="number" name="lowStockThreshold" min="0" value={formData.lowStockThreshold} onChange={handleChange} required /></label>
                    <label>Prescription Required<select name="requiresPrescription"value={formData.requiresPrescription}onChange={handleChange}><option value={false}>No</option><option value={true}>Yes</option></select></label>
                    <div className="form-actions"><button className="button button-dark" type="submit" disabled={saving}>{saving ? "Adding..." : "Add Medicine"}</button></div>
                </form>
            </div>

            <div className="table-card medicine-table">
                <table>
                    <thead>
                        <tr><th>Medicine</th><th>Batch</th><th>Expiry</th><th>Supplier</th><th>Stock</th><th>Selling Price</th></tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="6">Loading...</td></tr>}
                        {!loading && medicines.length === 0 && <tr><td colSpan="6">No medicines added yet.</td></tr>}
                        {medicines.map((medicine) => (
                            <tr key={medicine._id}>
                                <td>{medicine.name}</td>
                                <td>{medicine.batchNumber}</td>
                                <td>{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                                <td>{medicine.supplier}</td>
                                <td><span className={medicine.quantity <= medicine.lowStockThreshold ? "stock-badge low" : "stock-badge"}>{medicine.quantity}</span></td>
                                <td>₹{medicine.sellingPrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Medicines;
