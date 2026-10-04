

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";




const banners = [
    {
        image: "https://res.cloudinary.com/eneepkso/image/upload/v1791097163/cr-banner.webp",
        eyebrow: "ADVANCED MEDICAL CARE",
        title: "Healthcare that puts people first.",
        description: "Find trusted doctors, explore our departments and get the care you need from one connected hospital platform.",
    },
    {
        image: "https://res.cloudinary.com/eneepkso/image/upload/v1791097454/banner-2.webp",
        eyebrow: "EXPERIENCED SPECIALISTS",
        title: "Expert doctors. Better outcomes.",
        description: "Connect with experienced doctors across our specialized departments.",
    },
    {
        image: "https://res.cloudinary.com/eneepkso/image/upload/v1791098556/banner-3_VXazWmF.png",
        eyebrow: "24/7 CARE",
        title: "Care when you need it most.",
        description: "Quality medical support and emergency care available around the clock.",
    }
];

const Home = () => {
    
    const [currentBanner, setCurrentBanner] = useState(0);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((current) =>
                (current + 1) % banners.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(()=> {

        const fetchDepartments = async()=> {

            try {

                const response = await api.get('/departments');

                setDepartments(Array.isArray
                    (response.data.departments) ? response.data.setDepartments : [])
            }
            catch(error) {
                console.error('Failed to fetch departments:', error);
                
            }
        }

        fetchDepartments();
    }, [])

    const nextBanner = () => {
        setCurrentBanner((current) =>
            (current + 1) % banners.length
        );
    };

    const previousBanner = () => {
        setCurrentBanner((current) =>
            current === 0 ? banners.length - 1 : current - 1
        );
    };

    const banner = banners[currentBanner];




    return (
        <div>
            <section className="hero-carousel" style={{backgroundImage: `url(${banner.image})`}}>
                 <div className="hero-overlay"></div>


                 <button className="hero-arrow hero-arrow-left" onClick={previousBanner}>
                    ‹
                 </button>

                 <div className="hero-content">
                 <span className="eyebrow">{banner.eyebrow}</span>

                 <h1>{banner.title}</h1>
                 <p>{banner.description}</p>
                 </div>
                
                 <button className="hero-arrow hero-arrow-right" onClick={nextBanner}>
                    ›
                 </button>

                 <div className="hero-dots">
                    {banners.map((_, index)=> (
                        <button
                            key={index}
                            className={index === currentBanner ? "active" : ""}
                            onClick={()=> setCurrentBanner(index)}>
                                
                            </button>
                    ))}

                 </div>
            </section>

            <section className="section">
                <div className="section-heading">
                    <span className="eyebrow">OUR SERVICES</span>
                    <h2>Everything you need in one place.</h2>
                </div>
                <div className="feature-grid">
                    {[
                        ["01", "Find a Doctor", "Explore doctors and their specialties."],
                        ["02", "Appointments", "Request appointments through your patient account."],
                        ["03", "Pharmacy", "Manage medicine stock and dispensing securely."],
                        ["04", "Medical Records", "Keep important treatment information organized."]
                    ].map(([number, title, text]) => (
                        <div className="feature-card" key={number}>
                            <span>{number}</span>
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section light-section">
                <div className="section-heading">
                    <span className="eyebrow">DEPARTMENTS</span>
                    <h2>Specialized care from experienced teams.</h2>
                </div>
                <div className="department-grid">
                    {departments.map((department)=> (
                        <Link
                            to={`/departments/${department.slug}`}
                            className="department-card"
                            key={department._id}
                        >
                            {department.name}
                            <span>→</span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;
