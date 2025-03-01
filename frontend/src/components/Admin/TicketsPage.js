import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/ticketspage.css";

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Please log in.");
        return;
      }

      try {
        const response = await axios.get("/api/showtickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(response.data.tickets);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching tickets");
      }
    };

    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in.");

        const response = await axios.get("/api/agents", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAgents(response.data.agents);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError(err.response?.data?.message || "Failed to fetch agents.");
      }
    };

    fetchTickets();
    fetchAgents();
  }, []);

  const handleSaveAssignment = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      if (selectedAgent[ticketId]) {
        await axios.put(
          `/api/tickets/${ticketId}/assign`,
          { agent_id: selectedAgent[ticketId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.ticket_id === ticketId
              ? { ...ticket, agent_id: selectedAgent[ticketId] }
              : ticket
          )
        );

        alert("Agent assigned successfully!");
        setShowDropdown(null);
      }
    } catch (error) {
      console.error("Error assigning agent:", error);
      alert("Failed to assign agent.");
    }
  };

  if (error) return <div className="error">{error}</div>;

  const assignedTickets = tickets.filter((ticket) => ticket.agent_id);
  const unassignedTickets = tickets.filter((ticket) => !ticket.agent_id);

  return (
    <>
      <div className="ticket-container">
        {/* Unassigned Tickets */}
        <div className="table-container">
          <h4 className="ticket-heading">Unassigned Tickets ({unassignedTickets.length})</h4>
          <div class="table-wrapper">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assign Agent</th>
                </tr>
              </thead>
              <tbody>
                {unassignedTickets.map((ticket) => (
                  <tr key={ticket.ticket_id}>
                    <td>{ticket.subject}</td>
                    <td>{ticket.description || "No Description"}</td>
                    <td>{ticket.category}</td>
                    <td>
                      <span className={`status-badge ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{ticket.priority}</td>
                    <td>
                      <button className="assign-btn" onClick={() => setShowDropdown(ticket.ticket_id)}>
                        Assign Agent
                      </button>

                      {showDropdown === ticket.ticket_id && (
                        <div className="agent-dropdown">
                          <select
                            value={selectedAgent[ticket.ticket_id] || ""}
                            onChange={(e) =>
                              setSelectedAgent((prev) => ({
                                ...prev,
                                [ticket.ticket_id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select Agent</option>
                            {agents.map((agent) => (
                              <option key={agent.user_id} value={agent.user_id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                          <button className="save-btn" onClick={() => handleSaveAssignment(ticket.ticket_id)}>
                            Save
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assigned Tickets */}
        <div className="table-container">
          <h4 className="ticket-heading">Assigned Tickets ({assignedTickets.length})</h4>
          <div class="table-wrapper">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned Agent</th>
                </tr>
              </thead>
              <tbody>
                {assignedTickets.map((ticket) => (
                  <tr key={ticket.ticket_id}>
                    <td>{ticket.subject}</td>
                    <td>{ticket.description || "No Description"}</td>
                    <td>{ticket.category}</td>
                    <td>
                      <span className={`status-badge ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>{ticket.priority}</td>
                    <td>
                      <div className="agent-display">
                        <span>
                          <strong>Agent:</strong>{" "}
                          {agents.find((a) => a.user_id === ticket.agent_id)?.name || "Unknown"}
                        </span>
                        <button className="change-btn" onClick={() => setShowDropdown(ticket.ticket_id)}>
                          <i className="bi bi-arrow-repeat"></i>
                        </button>
                      </div>

                      {showDropdown === ticket.ticket_id && (
                        <div className="agent-dropdown">
                          <select
                            value={selectedAgent[ticket.ticket_id] || ""}
                            onChange={(e) =>
                              setSelectedAgent((prev) => ({
                                ...prev,
                                [ticket.ticket_id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select Agent</option>
                            {agents.map((agent) => (
                              <option key={agent.user_id} value={agent.user_id}>
                                {agent.name}
                              </option>
                            ))}
                          </select>
                          <button className="save-btn" onClick={() => handleSaveAssignment(ticket.ticket_id)}>
                            Save
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketsPage;
