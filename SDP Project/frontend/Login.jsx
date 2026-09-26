import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        password: ''
    });

    const login = async () => {
        try {
            const data = new URLSearchParams();

            data.append('username', form.username);
            data.append('password', form.password);

            const response = await api.post('/login', data);

            // Save JWT token
            localStorage.setItem(
                'token',
                response.data.access_token
            );

            // Save username
            localStorage.setItem(
                'username',
                form.username
            );

            // Get role from JWT
            const token = response.data.access_token;

            const payload = JSON.parse(
                atob(token.split('.')[1])
            );

            // Save role
            localStorage.setItem(
                'role',
                payload.role
            );

            navigate('/requests');

        } catch (error) {
            alert(
                error.response?.data?.detail ||
                'Invalid username or password'
            );
        }
    };

    return (
        <div className="container mt-5">

            <div
                className="card p-4 mx-auto"
                style={{ maxWidth: '400px' }}
            >

                <h2 className="text-center mb-4">
                    HR Service Portal
                </h2>

                <label className="form-label">
                    Username
                </label>

                <input
                    className="form-control mb-3"
                    placeholder="Enter username"
                    value={form.username}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            username: e.target.value
                        })
                    }
                />

                <label className="form-label">
                    Password
                </label>

                <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            password: e.target.value
                        })
                    }
                />

                <button
                    className="btn btn-primary w-100"
                    onClick={login}
                >
                    Login
                </button>

            </div>

        </div>
    );
}

export default Login;