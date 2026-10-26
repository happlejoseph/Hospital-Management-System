import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { formatDate, formatTime, formatTimestamp } from "../../utils/formatDate";

const PatientHistory = () => {
    const { patientId } = useParams();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHistory = async() => {

            try {

                const response = await api.get(`/doctors/me/patients/${patientId}/history`);
                setHistory(response.data);
            }

            catch(error) {
                setError(error.response?.data?.message || "Unable to load patient history");
            }

            finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [patientId]);

    if(loading) {
        return <div className="page-loading">Loading patient history...</div>;
    }

    if(error || !history) {
        return (
            <div>
                <Link className="back-link" to="/doctor/patients">← Back to Patients</Link>
                <div className="form-error">{error || "Patient history not found"}</div>
            </div>
        );
    }

    const completedCount = history.appointments.filter((appointment) => appointment.status === "completed").length;

    const cards = [
        ["Consultations", completedCount],
        ["Medical Records", history.medicalRecords.length],
        ["Medicine Orders", history.medicineOrders.length]
    ];

    return (
        <div>
            <Link className="back-link" to="/doctor/patients">← Back to Patients</Link>

            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">PATIENT HISTORY</span>
                    <h1>{history.patient?.name}</h1>
                    <p>{history.patient?.email}</p>
                </div>
            </div>

            <div className="stats-grid">
                {cards.map(([label, value]) => (
                    <div className="stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </div>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="eyebrow">VISITS</span>
                        <h2>Appointments</h2>
                    </div>
                </div>
                <div className="table-card">
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.appointments.map((appointment) => (
                                    <tr key={appointment._id}>
                                        <td>{formatDate(appointment.date)}</td>
                                        <td>{formatTime(appointment.time)}</td>
                                        <td>{appointment.reason || "—"}</td>
                                        <td><b className={`appointment-status ${appointment.status}`}>{appointment.status}</b></td>
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
                        <span className="eyebrow">RECORDS</span>
                        <h2>Medical records</h2>
                    </div>
                </div>
                {history.medicalRecords.length === 0 ? (
                    <div className="table-card"><div className="notice-empty">You have not written any medical records for this patient.</div></div>
                ) : (
                    <div className="history-records">
                        {history.medicalRecords.map((record) => (
                            <div className="history-record" key={record._id}>
                                <div className="history-record-head">
                                    <strong>{record.diagnosis}</strong>
                                    <span>{formatTimestamp(record.createdAt)}</span>
                                </div>
                                <dl>
                                    <div><dt>Symptoms</dt><dd>{record.symptoms || "—"}</dd></div>
                                    <div><dt>Treatment</dt><dd>{record.treatment || "—"}</dd></div>
                                    <div><dt>Prescription</dt><dd>{record.prescription || "—"}</dd></div>
                                    <div><dt>Notes</dt><dd>{record.notes || "—"}</dd></div>
                                </dl>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <span className="eyebrow">PHARMACY</span>
                        <h2>Medicine orders</h2>
                    </div>
                </div>
                <div className="table-card">
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ordered On</th>
                                    <th>Medicines</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Acknowledged</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.medicineOrders.length === 0 && <tr><td colSpan="5">This patient has not ordered medicines mentioning you.</td></tr>}
                                {history.medicineOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{formatTimestamp(order.createdAt)}</td>
                                        <td>{order.medicines.map((item) => `${item.medicine?.name || "Medicine"} × ${item.quantity}`).join(", ")}</td>
                                        <td>₹{Number(order.totalAmount).toFixed(2)}</td>
                                        <td>{order.status}</td>
                                        <td>{order.doctorAcknowledged ? "Yes" : "No"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PatientHistory;
