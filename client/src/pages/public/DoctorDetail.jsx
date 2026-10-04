

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const DoctorDetail = () => {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/doctors/public/${id}`)
            .then((response) => setDoctor(response.data.doctor || null))
            .catch(() => setDoctor(null))
            .finally(() => setLoading(false));
    }, [id]);

    if(loading) return <div className="page-loading">Loading doctor...</div>;
    if(!doctor) return <div className="simple-page"><h1>Doctor not found</h1><Link className="button button-dark" to="/doctors">Back to Doctors</Link></div>;



    
    return (
        <div className="public-page">
            <section className="doctor-profile-hero">
                <div className="doctor-profile-image">
                    {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : <div className="doctor-image-placeholder large">Doctor</div>}
                </div>
                <div>
                    <span className="eyebrow">{doctor.department}</span>
                    <h1>{doctor.name}</h1>
                    <h2>{doctor.specialization}</h2>
                    <p>{doctor.qualification}</p>
                    <p>{doctor.experience} years of professional experience</p>
                    <Link className="button button-dark" to={`/appointments?doctor=${doctor._id}`}>Book an Appointment</Link>
                </div>
            </section>
        </div>
    );
};

export default DoctorDetail;
