

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const DepartmentDetail = () => {
    const { slug } = useParams();
    const [department, setDepartment] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDepartment = async() => {
            try {
                const departmentResponse = await api.get(`/departments/slug/${slug}`);
                const currentDepartment = departmentResponse.data.department;
                setDepartment(currentDepartment);
                const doctorsResponse = await api.get("/doctors/public", {
                    params: { department: currentDepartment.name }
                });
                setDoctors(doctorsResponse.data.doctors || []);
            }
            catch(error) {
                setDepartment(null);
                setDoctors([]);
            }
            finally {
                setLoading(false);
            }
        };

        loadDepartment();
    }, [slug]);

    if(loading) return <div className="page-loading">Loading department...</div>;
    if(!department) return <div className="simple-page"><h1>Department not found</h1><Link className="button button-dark" to="/departments">Back to Departments</Link></div>;


    
    return (
        <div className="public-page">
            <section className="department-banner">
                {department.bannerImage ? (
                    <img src={department.bannerImage} alt={department.name} />
                ) : (
                    <div className="department-banner-placeholder">
                        <span>DEPARTMENT BANNER</span>
                        <strong>Add your Cloudinary banner URL in the Admin Department form.</strong>
                    </div>
                )}
                <div className="department-banner-overlay">
                    <span className="eyebrow">SPECIALIZED CARE</span>
                    <h1>{department.name}</h1>
                </div>
            </section>

            <section className="section department-intro">
                <div className="department-intro-copy">
                    <span className="eyebrow">ABOUT THE DEPARTMENT</span>
                    <h2>Care designed around your needs.</h2>
                    <p>{department.description}</p>
                </div>
            </section>

            <section className="section light-section">
                <div className="section-heading">
                    <span className="eyebrow">OUR MEDICAL TEAM</span>
                    <h2>Doctors in {department.name}</h2>
                    <p>Meet the doctors currently assigned to this department.</p>
                </div>

                {doctors.length === 0 ? (
                    <div className="empty-public-card">No doctors have been added to this department yet.</div>
                ) : (
                    <div className="doctor-grid">
                        {doctors.map((doctor) => (
                            <article className="doctor-card" key={doctor._id}>
                                <Link to={`/doctors/${doctor._id}`} className="doctor-image-link">
                                    {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : <div className="doctor-image-placeholder">Doctor</div>}
                                </Link>
                                <div className="doctor-card-body">
                                    <span>{doctor.specialization}</span>
                                    <h3>{doctor.name}</h3>
                                    <p>{doctor.qualification}</p>
                                    <p>{doctor.experience} years experience</p>
                                    <div className="doctor-card-actions">
                                        <Link className="outline-button" to={`/doctors/${doctor._id}`}>View Doctor</Link>
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

export default DepartmentDetail;
