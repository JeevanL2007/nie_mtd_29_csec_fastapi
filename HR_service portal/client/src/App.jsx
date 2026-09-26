import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    Navigate,
    useNavigate
} from 'react-router-dom';

import Login from './Login';
import Register from './Register';
import TicketList from './TicketList';
import TicketForm from './TicketForm';

import './App.css';


function ProtectedRoute({ children }) {

    const token = localStorage.getItem('token');

    return token
        ? children
        : <Navigate to="/login" />;
}


function AdminRoute({ children }) {

    const token = localStorage.getItem('token');
    const role = Number(localStorage.getItem('role'));

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (role !== 4) {
        return <Navigate to="/requests" />;
    }

    return children;
}


function Navigation() {

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const role = Number(
        localStorage.getItem('role')
    );


    const logout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');

        navigate('/login');
    };


    return (

        <nav className="top-navbar">

            <Link
                className="portal-title"
                to={
                    token
                        ? "/requests"
                        : "/login"
                }
            >
                HR Service Portal
            </Link>


            {token && (

                <div className="nav-right">

                    <Link
                        className="nav-button"
                        to="/requests"
                    >
                        Requests
                    </Link>


                    <Link
                        className="nav-button"
                        to="/requests/new"
                    >
                        New Request
                    </Link>


                    {role === 4 && (

                        <Link
                            className="nav-button"
                            to="/register"
                        >
                            Register
                        </Link>

                    )}


                    <span className="logged-user">
                        {username}
                    </span>


                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            )}

        </nav>

    );
}


function App() {

    return (

        <BrowserRouter>

            <Navigation />


            <Routes>

                <Route
                    path="/"
                    element={

                        localStorage.getItem('token')
                            ? <Navigate to="/requests" />
                            : <Navigate to="/login" />

                    }
                />


                <Route
                    path="/login"
                    element={<Login />}
                />


                <Route
                    path="/requests"
                    element={

                        <ProtectedRoute>

                            <TicketList />

                        </ProtectedRoute>

                    }
                />


                <Route
                    path="/requests/new"
                    element={

                        <ProtectedRoute>

                            <TicketForm />

                        </ProtectedRoute>

                    }
                />


                <Route
                    path="/requests/edit/:id"
                    element={

                        <ProtectedRoute>

                            <TicketForm />

                        </ProtectedRoute>

                    }
                />


                <Route
                    path="/register"
                    element={

                        <AdminRoute>

                            <Register />

                        </AdminRoute>

                    }
                />


                <Route
                    path="*"
                    element={
                        <Navigate to="/requests" />
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}


export default App;