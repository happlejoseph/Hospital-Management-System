

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            await register(formData.name, formData.email, formData.password);
            navigate("/login");
        }
        catch(error) {
            setError(error.response?.data?.message || "Registration failed");
        }
        finally {
            setLoading(false);
        }
    };



    
    return (
        <div className="auth-page">
            <div className="auth-card">
                <span className="eyebrow">PATIENT REGISTRATION</span>
                <h1>Create your account</h1>
                <p className="auth-subtitle">Create a patient account to use hospital services.</p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="form-stack">
                    <label>Full Name<input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name" /></label>
                    <label>Email<input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" /></label>
                    <label>Password<input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="At least 6 characters" /></label>
                    <button className="button button-dark full-button" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
                </form>

                <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
};

export default Register;
