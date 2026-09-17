

import axios from 'axios';

const api = axios.create({
    baseURL: 'https://hospital-management-system-xoi7.onrender.com/api'
});

api.interceptors.request.use((config)=> {

    const token = localStorege.getItem('token');

    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
});

export default api;