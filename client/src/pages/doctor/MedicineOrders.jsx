import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { openPrescription } from "../../utils/prescription";
import { formatTimestamp } from "../../utils/formatDate";

const MedicineOrders = () => {
    const [orders, setOrders] = useState([]);
    const [notes, setNotes] = useState({});
    const [tab, setTab] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadOrders = async() => {

        try {

            const response = await api.get("/medicine-orders/doctor");
            setOrders(response.data.orders || []);
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to load patient medicine orders");
        }

        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const acknowledgeOrder = async(id) => {
        setError("");
        setMessage("");

        try {

            const response = await api.put(`/medicine-orders/doctor/${id}/acknowledge`);
            setMessage(response.data.message);
            await loadOrders();
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to acknowledge the message");
        }
    };

    const confirmOrder = async(id) => {
        setError("");
        setMessage("");

        try {

            const response = await api.put(`/medicine-orders/doctor/${id}/confirm`, { note: notes[id] || "" });
            setMessage(response.data.message);
            await loadOrders();
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to confirm the order");
        }
    };

    const declineOrder = async(id) => {
        setError("");
        setMessage("");

        const reason = (notes[id] || "").trim();

        if(!reason) {
            setError("Enter a reason in the message box to decline this order");
            return;
        }

        if(!window.confirm("Decline this order? The patient will be informed and the medicine stock will be returned.")) return;

        try {

            const response = await api.put(`/medicine-orders/doctor/${id}/reject`, { reason });
            setMessage(response.data.message);
            await loadOrders();
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to decline the order");
        }
    };

    const viewPrescription = async(id) => {
        setError("");

        try {
            await openPrescription(id);
        }

        catch {
            setError("Unable to open the prescription.");
        }
    };

    const awaitingOrders = orders.filter((order) => order.status === "pending" && !order.doctorConfirmed);
    const visibleOrders = tab === "pending" ? awaitingOrders : orders;

    const getStatusLabel = (order) => {

        if(order.doctorRejected) {
            return ["Declined by you", "cancelled"];
        }

        if(order.status === "cancelled") {
            return ["Cancelled", "cancelled"];
        }

        if(order.doctorConfirmed) {
            return ["Confirmed by you", "confirmed"];
        }

        return ["Awaiting your confirmation", "pending"];
    };

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">DOCTOR</span>
                    <h1>Patient Medicine Orders</h1>
                    <p>Review the medicines your patients ordered. Once you confirm, the pharmacist can process the order.</p>
                </div>
            </div>

            {message && <div className="form-success">{message}</div>}
            {error && <div className="form-error">{error}</div>}

            <div className="tab-row">
                <button type="button" className={tab === "pending" ? "tab-button active" : "tab-button"} onClick={() => setTab("pending")}>Needs confirmation ({awaitingOrders.length})</button>
                <button type="button" className={tab === "all" ? "tab-button active" : "tab-button"} onClick={() => setTab("all")}>All orders ({orders.length})</button>
            </div>

            {loading && <div className="page-loading">Loading orders...</div>}

            {!loading && visibleOrders.length === 0 && (
                <div className="table-card"><div className="notice-empty">{tab === "pending" ? "No orders are waiting for your confirmation." : "No patient has ordered medicines mentioning you yet."}</div></div>
            )}

            <div className="order-review-list">
                {visibleOrders.map((order) => {

                    const [statusLabel, statusClass] = getStatusLabel(order);
                    const canConfirm = order.status === "pending" && !order.doctorConfirmed;

                    return (
                        <div className="order-review" key={order._id}>
                            <div className="order-review-head">
                                <div>
                                    <strong>{order.patient?.name || "Patient"}</strong>
                                    <span>{order.patient?.email}</span>
                                </div>
                                <div className="order-review-meta">
                                    <span>{formatTimestamp(order.createdAt)}</span>
                                    <b className={`appointment-status ${statusClass}`}>{statusLabel}</b>
                                </div>
                            </div>

                            <div className="table-scroll">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.medicines.map((item) => (
                                            <tr key={item._id}>
                                                <td>{item.medicine?.name || "Medicine"}{item.medicine?.requiresPrescription && <span className="rx-chip">Rx</span>}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{Number(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="order-review-links">
                                <span>Order total ₹{Number(order.totalAmount).toFixed(2)}</span>
                                {order.prescription?.fileUrl && <button className="small-action" type="button" onClick={() => viewPrescription(order._id)}>View Prescription</button>}
                                {order.patientConsulted && <Link className="small-action" to={`/doctor/patients/${order.patient?._id}`}>Patient History</Link>}
                            </div>

                            {canConfirm ? (
                                <div className="order-review-actions">
                                    <label>
                                        Message for the pharmacist and patient (optional to confirm, required to decline)
                                        <textarea
                                            maxLength="500"
                                            value={notes[order._id] || ""}
                                            onChange={(event) => setNotes({ ...notes, [order._id]: event.target.value })}
                                            placeholder="Example: Reduce quantity to 1 strip, take after food"
                                        />
                                    </label>
                                    <div className="order-review-buttons">
                                        {!order.doctorAcknowledged && <button className="outline-button" type="button" onClick={() => acknowledgeOrder(order._id)}>Acknowledge</button>}
                                        <button className="outline-button danger" type="button" onClick={() => declineOrder(order._id)}>Decline Order</button>
                                        <button className="button button-dark" type="button" onClick={() => confirmOrder(order._id)}>Confirm Order</button>
                                    </div>
                                </div>
                            ) : (
                                (order.doctorConfirmed || order.doctorRejected) && (
                                    <div className="order-review-note">
                                        <span>{order.doctorRejected ? "Your reason for declining" : "Your suggestion"}</span>
                                        <p>{order.doctorNote || "No suggestion added."}</p>
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MedicineOrders;
