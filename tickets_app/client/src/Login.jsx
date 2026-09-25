import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "./api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      // FastAPI OAuth2PasswordRequestForm
      // requires application/x-www-form-urlencoded

      const formData = new URLSearchParams();

      formData.append("username", username);
      formData.append("password", password);


      const response = await api.post(
        "/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );


      // Save JWT token

      localStorage.setItem(
        "token",
        response.data.access_token
      );


      // Save username

      localStorage.setItem(
        "username",
        username
      );


      // Go to tickets page

      navigate("/tickets");

    } catch (error) {

      setError(
        error.response?.data?.detail ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="container page-container">

      <div className="card form-card">

        {/* TITLE */}

        <h2>
          IT Service Login
        </h2>

        <p className="text-muted">
          Login to the IT Service Desk
        </p>


        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

          {/* USERNAME */}

          <label className="form-label">
            Username
          </label>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />


          {/* PASSWORD */}

          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />


          {/* ERROR */}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* REGISTER */}

        <button
          className="btn btn-link mt-3"
          onClick={() =>
            navigate("/register")
          }
        >
          Create a new account
        </button>

      </div>

    </div>
  );
}

export default Login;