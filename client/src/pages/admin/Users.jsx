

import { useEffect, useState } from 'react';
import api from '../../services/api';


const User = ()=> {

    // store the users receive from backend
    const [users, setUsers] = useState([]);
    
    // used while API request running
    const [loading, setLoading] = useState(true);
    
    // store error message
    const [error, setError] = useState('');

    // fetch users from backend
    const fetchUsers = async()=> {
        
        try {

            setLoading(true);
            setError('');

            const responce = await api.get('/users');

            setUsers(responce.data.users)

        }
        catch(error) {

            setError(
                error.responce?.data?.message || 'Failed to fetch users'
            );

        }
        finally {
            
            setLoading(false);
        }
    }


    // run fetchUsers when the page loads
    useEffect(()=> {
        fetchUsers();
    }, []);

    if(loading) {
        return <p>Loading users...</p>;
    }

    if(error) {
        return <p>{error}</p>;
    }


    return(
        <div>
            
        </div>
    )


}