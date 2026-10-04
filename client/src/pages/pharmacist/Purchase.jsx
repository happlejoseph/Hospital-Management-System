


import { useEffect, useState } from "react";
import api from "../../services/api";

const Purchase = () => {
    const [medicines, setMedicines] = useState([]);
    const [medicineId, setMedicineId] = useState("");
    const [formData, setFormData] = useState({ quantity: "", supplier: "", purchasePrice: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/medicines").then((response) => setMedicines(response.data.medicines)).catch(() => setError("Unable to load medicines"));
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await api.post(`/medicines/${medicineId}/purchase`, formData);
            setMessage(response.data.message);
            setFormData({ quantity: "", supplier: "", purchasePrice: "" });
            const medicinesResponse = await api.get("/medicines");
            setMedicines(medicinesResponse.data.medicines);
        }
        catch(error) {
            setError(error.response?.data?.message || "Purchase failed");
        }
        finally {
            setLoading(false);
        }
    };


    
    return (
        <div>
            <div className="dashboard-heading"><div><span className="eyebrow">PHARMACY</span><h1>Purchase Medicines</h1><p>Add purchased quantity to existing stock.</p></div></div>
            <div className="form-card">
                {message && <div className="form-success">{message}</div>}
                {error && <div className="form-error">{error}</div>}
                <form onSubmit={handleSubmit} className="form-grid">
                    <label>Medicine<select value={medicineId} onChange={(event) => setMedicineId(event.target.value)} required><option value="">Select medicine</option>{medicines.map((medicine) => <option key={medicine._id} value={medicine._id}>{medicine.name} — Batch {medicine.batchNumber}</option>)}</select></label>
                    <label>Quantity<input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} required /></label>
                    <label>Supplier<input type="text" name="supplier" value={formData.supplier} onChange={handleChange} placeholder="Supplier name" /></label>
                    <label>Purchase Price<input type="number" name="purchasePrice" min="0" step="0.01" value={formData.purchasePrice} onChange={handleChange} placeholder="Optional" /></label>
                    <div className="form-actions"><button className="button button-dark" type="submit" disabled={loading}>{loading ? "Updating..." : "Update Stock"}</button></div>
                </form>
            </div>
        </div>
    );
};

export default Purchase;
