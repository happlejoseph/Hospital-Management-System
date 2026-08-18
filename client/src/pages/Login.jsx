

import { useState } from "react";
import api from "../services/api";

const Login = ()=> {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e)=> {
        const {name, value} = e.target

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    const handleSubmit = async(e)=> {
        e.preventDefault();

        setMessage('');
        setError('');

        try {

            const response = await api.post(
                '/auth/login',
                formData
            );

            setMessage(response.data.message);
            console.log(response.data);
            
        }
        catch(error) {

            setError(
                error.response?.data?.message || 'Login failed'
            );
        }
    }


    return(

        <div>

            <h1>Login</h1>

            {message && <p>{message}</p>}
            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="email"
                    placeholder="Enter you email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    />

                <input
                    type="text"
                    placeholder="Enter your password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    />

                <button type="submit">
                    Login
                </button>

            </form>
        </div>
    )
}


export default Login;