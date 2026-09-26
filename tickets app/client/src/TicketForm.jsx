import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "./api";

function TicketForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Technical",
    status: "Open",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  // =====================================================
  // LOAD TICKET WHEN EDITING
  // =====================================================

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadTicket = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/tickets/${id}`
        );

        setForm({
          title: response.data.title,
          description: response.data.description,
          category: response.data.category,
          status: response.data.status,
        });

      } catch (error) {
        setMessage(
          error.response?.data?.detail ||
          "Failed to load ticket"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [id, isEdit]);


  // =====================================================
  // HANDLE INPUT CHANGES
  // =====================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!form.title || !form.description) {
      setMessage(
        "Title and description are required."
      );
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {

        // UPDATE
        await api.put(
          `/tickets/${id}`,
          form
        );

        setMessage(
          "Ticket updated successfully!"
        );

      } else {

        // CREATE
        await api.post(
          "/tickets",
          form
        );

        setMessage(
          "Ticket created successfully!"
        );

        setForm({
          title: "",
          description: "",
          category: "Technical",
          status: "Open",
        });
      }

      // Go back to ticket list
      setTimeout(() => {
        navigate("/tickets");
      }, 700);

    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Operation failed"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container page-container">

      <div className="card form-card">

        <h2>
          {isEdit
            ? "Edit Ticket"
            : "Create Ticket"}
        </h2>

        <p className="text-muted">
          {isEdit
            ? "Update the ticket details"
            : "Create a new service ticket"}
        </p>


        <form onSubmit={handleSubmit}>

          {/* TITLE */}

          <label className="form-label">
            Title
          </label>

          <input
            type="text"
            name="title"
            className="form-control mb-3"
            placeholder="Enter ticket title"
            value={form.title}
            onChange={handleChange}
          />


          {/* DESCRIPTION */}

          <label className="form-label">
            Description
          </label>

          <textarea
            name="description"
            className="form-control mb-3"
            rows="5"
            placeholder="Describe the problem"
            value={form.description}
            onChange={handleChange}
          />


          {/* CATEGORY */}

          <label className="form-label">
            Category
          </label>

          <select
            name="category"
            className="form-select mb-3"
            value={form.category}
            onChange={handleChange}
          >
            <option value="Technical">
              Technical
            </option>

            <option value="Hardware">
              Hardware
            </option>

            <option value="Software">
              Software
            </option>

            <option value="Network">
              Network
            </option>

            <option value="Other">
              Other
            </option>
          </select>


          {/* STATUS */}

          <label className="form-label">
            Status
          </label>

          <select
            name="status"
            className="form-select mb-3"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Open">
              Open
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Resolved">
              Resolved
            </option>

            <option value="Closed">
              Closed
            </option>
          </select>


          {/* MESSAGE */}

          {message && (
            <div className="alert alert-info">
              {message}
            </div>
          )}


          {/* BUTTONS */}

          <div className="d-flex gap-2">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Ticket"
                : "Create Ticket"}
            </button>


            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate("/tickets")
              }
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default TicketForm;