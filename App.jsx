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


function Navigation() {

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    // Get logged-in user's role
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

            {/* Portal title */}

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


            {/* Navigation buttons */}

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


                    {/* 
                        Register is visible ONLY to Admin.
                        Admin role = 4
                    */}

                    {role === 4 && (

                        <Link
                            className="nav-button"
                            to="/register"
                        >
                            Register
                        </Link>

                    )}


                    {/* Username */}

                    <span className="logged-user">
                        {username}
                    </span>


                    {/* Logout */}

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

                {/* HOME */}

                <Route
                    path="/"
                    element={

                        localStorage.getItem('token')
                            ? <Navigate to="/requests" />
                            : <Navigate to="/login" />

                    }
                />


                {/* LOGIN */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* REQUEST LIST */}

                <Route
                    path="/requests"
                    element={

                        <ProtectedRoute>

                            <TicketList />

                        </ProtectedRoute>

                    }
                />


                {/* CREATE REQUEST */}

                <Route
                    path="/requests/new"
                    element={

                        <ProtectedRoute>

                            <TicketForm />

                        </ProtectedRoute>

                    }
                />


                {/* EDIT REQUEST */}

                <Route
                    path="/requests/edit/:id"
                    element={

                        <ProtectedRoute>

                            <TicketForm />

                        </ProtectedRoute>

                    }
                />


                {/* REGISTER */}

                <Route
                    path="/register"
                    element={

                        <ProtectedRoute>

                            <Register />

                        </ProtectedRoute>

                    }
                />

            </Routes>

        </BrowserRouter>

    );
}


export default App;