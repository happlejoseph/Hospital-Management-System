

import { useEffect, useState } from "react";
import api from "../../services/api";

const Dispense = () => {
    const [medicines, setMedicines] = useState([]);
    const [medicineId, setMedicineId] = useState("");
    const [formData, setFormData] = useState({ quantity: "", patientName: "", notes: "" });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loadMedicines = async() => {
        try {
            const response = await api.get("/medicines");
            setMedicines(response.data.medicines);
        }
        catch {
            setError("Unable to load medicines");
        }
    };

    useEffect(() => {
        loadMedicines();
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
            const response = await api.post(`/medicines/${medicineId}/dispense`, formData);
            setMessage(response.data.message);
            setFormData({ quantity: "", patientName: "", notes: "" });
            await loadMedicines();
        }
        catch(error) {
            setError(error.response?.data?.message || "Dispensing failed");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="dashboard-heading"><div><span className="eyebrow">PHARMACY</span><h1>Dispense Medicines</h1><p>Record medicine dispensing and automatically reduce stock.</p></div></div>
            <div className="form-card">
                {message && <div className="form-success">{message}</div>}
                {error && <div className="form-error">{error}</div>}
                <form onSubmit={handleSubmit} className="form-grid">
                    <label>Medicine<select value={medicineId} onChange={(event) => setMedicineId(event.target.value)} required><option value="">Select medicine</option>{medicines.map((medicine) => <option key={medicine._id} value={medicine._id}>{medicine.name} — Stock {medicine.quantity}</option>)}</select></label>
                    <label>Quantity<input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} required /></label>
                    <label>Patient Name<input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required placeholder="Patient name" /></label>
                    <label>Notes<input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional notes" /></label>
                    <div className="form-actions"><button className="button button-dark" type="submit" disabled={loading}>{loading ? "Dispensing..." : "Dispense Medicine"}</button></div>
                </form>
            </div>
        </div>
    );
};

export default Dispense;
