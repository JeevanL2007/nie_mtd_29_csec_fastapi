import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import TicketList from "./TicketList";
import TicketForm from "./TicketForm";

import "./App.css";


// ===============================
// PROTECTED ROUTE
// ===============================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ===============================
// NAVIGATION BAR
// ===============================

function Navigation() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const role = Number(localStorage.getItem("role"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <nav className="top-navbar">

      {/* Logo / Title */}
      <div className="navbar-brand">
        <Link to={token ? "/requests" : "/login"}>
          HR Service Portal
        </Link>
      </div>


      {/* Navigation Links */}
      <div className="navbar-links">

        {token ? (
          <>
            {/* Requests */}
            <Link to="/requests">
              Requests
            </Link>

            {/* New Request */}
            <Link to="/requests/new">
              New Request
            </Link>

            {/* Admin Register */}
            {role === 4 && (
              <Link to="/register">
                Register
              </Link>
            )}

            {/* Username */}
            <span className="navbar-user">
              {username}
            </span>

            {/* Logout */}
            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Login */}
            <Link to="/login">
              Login
            </Link>

            {/* Register */}
            <Link to="/register">
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}


// ===============================
// MAIN APP
// ===============================

function App() {
  return (
    <BrowserRouter>

      {/* Navigation */}
      <Navigation />

      {/* Routes */}
      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/requests" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =========================
            REGISTER
        ========================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            REQUEST LIST
        ========================= */}

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <TicketList />
            </ProtectedRoute>
          }
        />


        {/* =========================
            CREATE REQUEST
        ========================= */}

        <Route
          path="/requests/new"
          element={
            <ProtectedRoute>
              <TicketForm />
            </ProtectedRoute>
          }
        />


        {/* =========================
            EDIT REQUEST
        ========================= */}

        <Route
          path="/requests/edit/:id"
          element={
            <ProtectedRoute>
              <TicketForm />
            </ProtectedRoute>
          }
        />


        {/* =========================
            INVALID URL
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;