

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/departments").then((response) => setDepartments(response.data.departments || []));
    }, []);

    useEffect(() => {
        setLoading(true);
        api.get("/doctors/public", { params: department ? { department } : {} })
            .then((response) => setDoctors(response.data.doctors || []))
            .catch(() => setDoctors([]))
            .finally(() => setLoading(false));
    }, [department]);



    
    return (
        <div className="public-page">
            <section className="page-hero">
                <span className="eyebrow">OUR MEDICAL TEAM</span>
                <h1>Find a Doctor</h1>
                <p>Browse our doctors by department and open a doctor's profile before requesting an appointment.</p>
            </section>

            <section className="section">
                <div className="doctor-filter-bar">
                    <div>
                        <span className="eyebrow">FILTER BY DEPARTMENT</span>
                        <h2>Medical specialists</h2>
                    </div>
                    <select value={department} onChange={(event) => setDepartment(event.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map((item) => <option value={item.name} key={item._id}>{item.name}</option>)}
                    </select>
                </div>

                {loading ? <div className="page-loading">Loading doctors...</div> : doctors.length === 0 ? (
                    <div className="empty-public-card">No doctors found for the selected department.</div>
                ) : (
                    <div className="doctor-grid">
                        {doctors.map((doctor) => (
                            <article className="doctor-card" key={doctor._id}>
                                <Link to={`/doctors/${doctor._id}`} className="doctor-image-link">
                                    {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : <div className="doctor-image-placeholder">Doctor</div>}
                                </Link>
                                <div className="doctor-card-body">
                                    <span>{doctor.department}</span>
                                    <h3>{doctor.name}</h3>
                                    <p>{doctor.specialization}</p>
                                    <p>{doctor.qualification}</p>
                                    <div className="doctor-card-actions">
                                        <Link className="outline-button" to={`/doctors/${doctor._id}`}>View Profile</Link>
                                        <Link className="button button-dark" to={`/appointments?doctor=${doctor._id}`}>Appointment</Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Doctors;
