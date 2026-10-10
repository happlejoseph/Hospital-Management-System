

import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if(storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            }
            catch {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        }

        setLoading(false);
    }, []);

    const login = async(email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);

        return response.data.user;
    };

    const register = async(name, email, password) => {
        const response = await api.post("/auth/register", {
            name,
            email,
            password
        });

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };


    
    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: user !== null,
                isAdmin: user?.role === "admin",
                isDoctor: user?.role === "doctor",
                isPharmacist: user?.role === "pharmacist",
                isPatient: user?.role === "patient",
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
