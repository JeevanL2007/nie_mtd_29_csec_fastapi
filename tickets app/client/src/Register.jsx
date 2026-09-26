import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: 1,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const register = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!form.username || !form.password) {
      setMessage("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users", {
        username: form.username,
        password: form.password,
        role: Number(form.role),
      });

      setMessage("User created successfully!");

      setForm({
        username: "",
        password: "",
        role: 1,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "User creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-container">

      <div className="card form-card">

        <h2>Create User</h2>

        <p className="text-muted">
          Register a new user
        </p>

        <form onSubmit={register}>

          {/* USERNAME */}

          <label className="form-label">
            Username
          </label>

          <input
            type="text"
            name="username"
            className="form-control mb-3"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
          />


          {/* PASSWORD */}

          <label className="form-label">
            Password
          </label>

          <input
            type="password"
            name="password"
            className="form-control mb-3"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
          />


          {/* ROLE */}

          <label className="form-label">
            Role
          </label>

          <select
            name="role"
            className="form-select mb-3"
            value={form.role}
            onChange={handleChange}
          >

            <option value="1">
              Employee
            </option>

            <option value="2">
              Engineer
            </option>

            <option value="3">
              Lead
            </option>

            <option value="4">
              Admin
            </option>

          </select>


          {/* MESSAGE */}

          {message && (
            <div className="alert alert-info">
              {message}
            </div>
          )}


          {/* BUTTON */}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create User"}
          </button>

        </form>


        <button
          className="btn btn-link mt-3"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>

      </div>

    </div>
  );
}

export default Register;