import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPatients = async() => {

        try {

            const response = await api.get("/doctors/me/patients");
            setPatients(response.data.patients || []);
        }

        catch(error) {
            setError(error.response?.data?.message || "Unable to load patients");
        }

        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const keyword = search.trim().toLowerCase();
    const visiblePatients = patients.filter((patient) => patient.name.toLowerCase().includes(keyword) || patient.email.toLowerCase().includes(keyword));

    return (
        <div>
            <div className="dashboard-heading">
                <div>
                    <span className="eyebrow">DOCTOR</span>
                    <h1>My Patients</h1>
                    <p>Patients you have consulted. Open a patient to see their complete history with you.</p>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="table-card">
                <div className="table-title">
                    Consulted patients
                    <input className="table-search" type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" />
                </div>
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Email</th>
                                <th>Consultations</th>
                                <th>Last Visit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="5">Loading...</td></tr>}
                            {!loading && visiblePatients.length === 0 && <tr><td colSpan="5">{patients.length === 0 ? "No consulted patients yet. Patients appear here after you complete an appointment." : "No patients match your search."}</td></tr>}
                            {visiblePatients.map((patient) => (
                                <tr key={patient._id}>
                                    <td>{patient.name}</td>
                                    <td>{patient.email}</td>
                                    <td>{patient.visits}</td>
                                    <td>{formatDate(patient.lastVisit)}</td>
                                    <td><Link className="small-action" to={`/doctor/patients/${patient._id}`}>View History</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Patients;
