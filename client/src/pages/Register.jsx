

import { useState } from "react";
import api from "../services/api";

const Register = ()=> {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e)=> {
        const {name, value} = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    const handleSubmit = async(e)=> {
        e.preventDefault();

        setMessage('');
        setError();

        try {

            const response = await api.post(
                '/auth/register',
                formData
            );

            setMessage(response.data.message);

            setFormData({
                name: '',
                email: '',
                password: ''
            });
        }
        catch(error) {
            
            setError(error.response?.data?.message || 'Registration failed');
        }
    }


    return(

        <div>
            <h1>Register</h1>

            {message && <p>{message}</p>}
            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>

                <input 
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    />

                <input 
                    type="text"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    />

                    <button type="submit">
                        Register
                    </button>
            </form>
        </div>
    )
}


export default Register;