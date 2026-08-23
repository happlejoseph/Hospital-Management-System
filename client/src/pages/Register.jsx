

import { useState } from 'react';
import api from '../services/api';


const Register = ()=> {

    const navigate = useNavigate();

    const  [formData, setFormData] = useState({
        
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        genter: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(flase);

    const handleChange = (e)=> {
        const {name, value} = e.target

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    const handleSubmit = async(e)=> {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {

            const response = await api.post(
                '/api/register',
                formData
            );

            toast.success(response.data.message);
            navigate('/login');
        }
        catch(error) {

            setError(
                error.response?.data?.message || 'Registration failed'
            );
        }
        finally {
            setLoading(false);
        }
    }


    return (
        <div className='flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10'>

            <div className='w-full max-w-md'>

                <div className='mb-8 text-center'>
                    <div className='mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white'>
                        SH
                    </div>
                    <h1 className='text-xl font-semibold text-ink-900'>Create Patient Account</h1>
                    <p className="mt-1 text-sm text-ink-500">Register to book appointments and view your records</p>
                </div>

                <div className='rounded-xl border border-ink-100 bg-white p-6 shadow-sm'>

                    {error && (
                        <p className='mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>
                    )}

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

                        <Input
                            label="Full Name"
                            name="name"
                            placeholder='Enter your full name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email"
                            type='email'
                            name='email'
                            placeholder='Enter your email'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Phone"
                                name="phone"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Age"
                                type="number"
                                name="age"
                                placeholder="28"
                                value={formData.age}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Select
                            label="Gender"
                            name="gender"
                            value={formData.genter}
                            onChange={handleChange}
                            required
                            options={[
                                {value: 'male', label: 'Male'},
                                {value: 'female', label: 'Female'},
                                {value: 'other', label: 'Other'}
                            ]}
                        />

                        <Button type="submit" disable={loading} className="w-full">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>
                </div>

                <p className='mt-6 text-center text-sm text-ink-500'>
                    Already have an account?{' '}
                    <Link to='/login' className='font-medium text-primary-600 hover:text-primary-700'>
                            Sing in
                    </Link>
                </p>
            </div>
        </div>
    )
}


export default Register;