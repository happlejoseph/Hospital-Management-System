

import { useEffect, useState } from 'react';
import api from '../../services/api';


const Users = ()=> {

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

            const response = await api.get('/users');

            setUsers(response.data.users)

        }
        catch(error) {

            setError(
                error.response?.data?.message || 'Failed to fetch users'
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


export default Users;