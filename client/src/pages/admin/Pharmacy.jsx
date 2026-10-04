

import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {name: "", batchNumber: "", expiryDate: "", quantity: "", supplier: "", purchasePrice: "", sellingPrice: "", lowStockThreshold: "10"};

const Pharmacy = () => {
    const [medicines, setMedicines] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [purchase, setPurchase] = useState({ medicineId: "", quantity: "", supplier: "", purchasePrice: "" });
    const [dispense, setDispense] = useState({ medicineId: "", quantity: "", patientName: "", notes: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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

    const handleCreate = async(event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        try {

            const response = await api.post("/medicines", form);
            setMessage(response.data.message);
            setForm(emptyForm);
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to add medicine");
        }
    };

    const handlePurchase = async(event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        try {

            const response = await api.post(`/medicines/${purchase.medicineId}/purchase`, purchase);
            setMessage(response.data.message);
            setPurchase({ medicineId: "", quantity: "", supplier: "", purchasePrice: "" });
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to update stock");
        }
    };

    const handleDispense = async(event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        try {

            const response = await api.post(`/medicines/${dispense.medicineId}/dispense`, dispense);
            setMessage(response.data.message);
            setDispense({ medicineId: "", quantity: "", patientName: "", notes: "" });
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Unable to dispense medicine");
        }
    };



    
    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">ADMIN</span>
                    <h1>Pharmacy</h1>
                    <p>Manage medicine stock, purchases and dispensing.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="form-card wide-form-card">
                <div className="table-title">Add Medicine</div>
                <form onSubmit={handleCreate} className="form-grid">
                    <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
                    <label>Batch Number<input value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} required /></label>
                    <label>Expiry Date<input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required /></label>
                    <label>Quantity<input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></label>
                    <label>Supplier<input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required /></label>
                    <label>Purchase Price<input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required /></label>
                    <label>Selling Price<input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required /></label>
                    <label>Low Stock Threshold<input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} required /></label>
                    <div className="form-actions"><button className="button button-dark" type="submit">Add Medicine</button></div>
                </form>
            </div>

            <div className="admin-two-column">
                <form className="form-card" onSubmit={handlePurchase}>
                    <div className="table-title">Purchase Stock</div>
                    <label>Medicine<select value={purchase.medicineId} onChange={(e) => setPurchase({ ...purchase, medicineId: e.target.value })} required><option value="">Select medicine</option>{medicines.map((medicine) => <option value={medicine._id} key={medicine._id}>{medicine.name} — {medicine.quantity} units</option>)}</select></label>
                    <label>Quantity<input type="number" min="1" value={purchase.quantity} onChange={(e) => setPurchase({ ...purchase, quantity: e.target.value })} required /></label>
                    <label>Supplier<input value={purchase.supplier} onChange={(e) => setPurchase({ ...purchase, supplier: e.target.value })} /></label>
                    <label>Purchase Price<input type="number" min="0" step="0.01" value={purchase.purchasePrice} onChange={(e) => setPurchase({ ...purchase, purchasePrice: e.target.value })} /></label>
                    <button className="button button-dark" type="submit">Update Stock</button>
                </form>

                <form className="form-card" onSubmit={handleDispense}>
                    <div className="table-title">Dispense Medicine</div>
                    <label>Medicine<select value={dispense.medicineId} onChange={(e) => setDispense({ ...dispense, medicineId: e.target.value })} required><option value="">Select medicine</option>{medicines.map((medicine) => <option value={medicine._id} key={medicine._id}>{medicine.name} — {medicine.quantity} units</option>)}</select></label>
                    <label>Quantity<input type="number" min="1" value={dispense.quantity} onChange={(e) => setDispense({ ...dispense, quantity: e.target.value })} required /></label>
                    <label>Patient Name<input value={dispense.patientName} onChange={(e) => setDispense({ ...dispense, patientName: e.target.value })} required /></label>
                    <label>Notes<input value={dispense.notes} onChange={(e) => setDispense({ ...dispense, notes: e.target.value })} /></label>
                    <button className="button button-dark" type="submit">Dispense Medicine</button>
                </form>
            </div>

            <div className="table-card">
                <div className="table-title">Medicine Inventory</div>
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>Medicine</th><th>Batch</th><th>Expiry</th><th>Supplier</th><th>Stock</th><th>Threshold</th></tr></thead>
                        <tbody>
                            {medicines.length === 0 && <tr><td colSpan="6">No medicines added yet.</td></tr>}
                            {medicines.map((medicine) => (
                                <tr key={medicine._id}>
                                    <td>{medicine.name}</td>
                                    <td>{medicine.batchNumber}</td>
                                    <td>{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                                    <td>{medicine.supplier}</td>
                                    <td><span className={medicine.quantity <= medicine.lowStockThreshold ? "stock-badge low" : "stock-badge"}>{medicine.quantity}</span></td>
                                    <td>{medicine.lowStockThreshold}</td>
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
