

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { formatTime } from "../../utils/formatDate";

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
                    <div className="doctor-schedule">
                        <span className="doctor-schedule-title">Consultation days</span>
                        {doctor.schedule?.length > 0 ? (
                            <div className="doctor-schedule-days">
                                {doctor.schedule.map((item) => (
                                    <div className="doctor-schedule-day" key={item.day}>
                                        <strong>{item.day.charAt(0).toUpperCase() + item.day.slice(1, 3)}</strong>
                                        <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="doctor-schedule-empty">The doctor has not published consultation days yet.</span>
                        )}
                    </div>
                    <Link className="button button-dark" to={`/appointments?doctor=${doctor._id}`}>Book an Appointment</Link>
                </div>
            </section>
        </div>
    );
};

export default DoctorDetail;
