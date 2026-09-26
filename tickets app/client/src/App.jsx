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


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// =====================================================
// NAVIGATION BAR
// =====================================================

function Navigation() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");


  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    navigate("/login");

    window.location.reload();
  };


  return (
    <nav className="navbar navbar-dark bg-dark">

      <div className="container">

        {/* BRAND */}

        <Link
          className="navbar-brand"
          to={token ? "/tickets" : "/login"}
        >
          🎫 Ticket Management
        </Link>


        {/* NAVIGATION */}

        <div>

          {token ? (
            <>
              <Link
                className="btn btn-light me-2"
                to="/tickets"
              >
                Tickets
              </Link>


              <Link
                className="btn btn-primary me-2"
                to="/tickets/new"
              >
                New Ticket
              </Link>


              <span className="text-white me-3">
                {username}
              </span>


              <button
                className="btn btn-danger"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                className="btn btn-light me-2"
                to="/login"
              >
                Login
              </Link>


              <Link
                className="btn btn-primary"
                to="/register"
              >
                Register
              </Link>
            </>
          )}

        </div>

      </div>

    </nav>
  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {

  return (
    <BrowserRouter>

      <Navigation />


      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate
                to="/tickets"
                replace
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* TICKET LIST */}

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketList />
            </ProtectedRoute>
          }
        />


        {/* CREATE TICKET */}

        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute>
              <TicketForm />
            </ProtectedRoute>
          }
        />


        {/* EDIT TICKET */}

        <Route
          path="/tickets/edit/:id"
          element={
            <ProtectedRoute>
              <TicketForm />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;