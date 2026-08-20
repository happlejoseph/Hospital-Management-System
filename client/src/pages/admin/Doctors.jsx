

import { useEffect, useState } from "react"





const Doctors = ()=> {

    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    const fetchDoctors = async()=> {

        try {

            setLoading(true);
            setError('');

            const response = await api.get('/doctors');

            setDoctors(response.data.doctors);

        }
        catch(error) {

            setError(
                error.response?.data?.message || 'Failed to fetch doctors'
            );
        }
        finally {

            setLoading(false);
        }
    }

    // run fetchDoctors when the page loads //
    useEffect(()=> {
        fetchDoctors();
    }, []);

    if(loading) {
        return <p>Loading doctors...</p>
    }

    if(error) {
        return <p>{error}</p>
    }


    return (

        <div>
            <h1>Doctor Management</h1>
            <p>Manage Hospital doctors</p>
            <p>Total Doctors: {doctors.length}</p>
        </div>
    )
}

export default Doctors;