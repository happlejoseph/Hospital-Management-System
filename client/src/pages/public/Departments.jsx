

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/departments")
            .then((response) => setDepartments(response.data.departments || []))
            .catch(() => setDepartments([]))
            .finally(() => setLoading(false));
    }, []);



    
    return (
        <div className="public-page">
            <section className="page-hero">
                <span className="eyebrow">SPECIALIZED CARE</span>
                <h1>Our Departments</h1>
                <p>Explore our medical departments and find the right specialist for your healthcare needs.</p>
            </section>

            <section className="section department-list-section">
                {loading ? <div className="page-loading">Loading departments...</div> : (
                    <div className="department-public-grid">
                        {departments.map((department) => (
                            <Link className="department-public-card" to={`/departments/${department.slug}`} key={department._id}>
                                <div>
                                    <span className="department-number">DEPARTMENT</span>
                                    <h2>{department.name}</h2>
                                    <p>{department.description}</p>
                                </div>
                                <span className="department-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Departments;
