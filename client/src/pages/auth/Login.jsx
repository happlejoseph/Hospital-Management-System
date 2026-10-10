

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
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
            
            const loggedInUser = await login(formData.email, formData.password);

            if(loggedInUser.role === "admin") {
                navigate("/admin");
            }
            else if(loggedInUser.role === 'pharmacist') {
                navigate('/pharmacist');
            }
            else if(loggedInUser.role === 'doctor') {
                navigate('/doctor');
            }
            else {
                navigate("/");
            }
        }
        catch(error) {
            setError(error.response?.data?.message || "Login failed");
        }
        finally {
            setLoading(false);
        }
    };




    return (
        <div className="auth-page">
            <div className="auth-card">
                <span className="eyebrow">AROGYA HOSPITAL</span>
                <h1>Welcome back</h1>
                <p className="auth-subtitle">Sign in to access your hospital account.</p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="form-stack">
                    <label>Email<input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email" /></label>
                    <label>Password<input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" /></label>
                    <button className="button button-dark full-button" type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
                </form>

                <p className="auth-footer">Don't have an account? <Link to="/register">Create a patient account</Link></p>
            </div>
        </div>
    );
};

export default Login;
