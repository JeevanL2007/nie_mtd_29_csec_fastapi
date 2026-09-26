import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "./api";

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ALL TICKETS
  // =====================================================

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tickets");

      setTickets(response.data);

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to load tickets"
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    loadTickets();
  }, []);


  // =====================================================
  // DELETE TICKET
  // =====================================================

  const deleteTicket = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/tickets/${id}`);

      // Remove deleted ticket from screen
      setTickets((currentTickets) =>
        currentTickets.filter(
          (ticket) => ticket.id !== id
        )
      );

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Failed to delete ticket"
      );
    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="container page-container">

        <div className="text-center">

          <div
            className="spinner-border"
            role="status"
          />

          <p className="mt-3">
            Loading tickets...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="container page-container">

      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2>
            Tickets
          </h2>

          <p className="text-muted mb-0">
            IT Service Desk Tickets
          </p>

        </div>


        <div className="d-flex gap-2">

          <button
            className="btn btn-secondary"
            onClick={loadTickets}
          >
            Refresh
          </button>


          <Link
            to="/tickets/new"
            className="btn btn-primary"
          >
            + New Ticket
          </Link>

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {/* NO TICKETS */}

      {!error && tickets.length === 0 && (
        <div className="alert alert-secondary">

          No tickets found.

          <div className="mt-3">

            <Link
              to="/tickets/new"
              className="btn btn-primary"
            >
              Create First Ticket
            </Link>

          </div>

        </div>
      )}


      {/* TICKETS */}

      <div className="row">

        {tickets.map((ticket) => (

          <div
            className="col-md-6 col-lg-4 mb-4"
            key={ticket.id}
          >

            <div className="card ticket-card h-100">

              <div className="card-body">

                {/* TITLE + STATUS */}

                <div className="d-flex justify-content-between align-items-start gap-2">

                  <h5 className="card-title">
                    {ticket.title}
                  </h5>

                  <span className="badge bg-primary">
                    {ticket.status}
                  </span>

                </div>


                {/* DESCRIPTION */}

                <p className="card-text mt-3">
                  {ticket.description}
                </p>


                {/* CATEGORY */}

                <p>
                  <strong>
                    Category:
                  </strong>{" "}
                  {ticket.category}
                </p>


                {/* ID */}

                <p className="text-muted small">
                  ID: {ticket.id}
                </p>


                {/* BUTTONS */}

                <div className="d-flex gap-2">

                  <Link
                    to={`/tickets/edit/${ticket.id}`}
                    className="btn btn-warning"
                  >
                    Edit
                  </Link>


                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      deleteTicket(ticket.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default TicketList;