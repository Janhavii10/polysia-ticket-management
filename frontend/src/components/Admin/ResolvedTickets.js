import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/resolvedtickets.css";

const ResolvedTickets = () => {
    const [tickets, setTickets] = useState([]);
    const navigate = useNavigate();

    // Fetch resolved tickets
    useEffect(() => {
        const fetchResolvedTickets = async () => {
            try {
                const response = await axios.get("/api/tickets/resolved");
                setTickets(response.data);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            }
        };

        fetchResolvedTickets();
    }, []);

    // Handle closing a ticket
    const handleCloseTicket = async (id) => {
        try {
            await axios.put(`/api/tickets/close/${id}`);
            setTickets(tickets.filter(ticket => ticket._id !== id)); // Remove from UI
        } catch (error) {
            console.error("Error closing ticket:", error);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <h2>Resolved Tickets</h2>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Agent ID</th>
                            <th>Department</th>
                            <th>Priority</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket._id}>
                                <td>
                                    {ticket.ticket_id}{" "}
                                    <i 
                                        className="bi bi-box-arrow-up-right" 
                                        style={{ cursor: "pointer", color: "blue" }} 
                                        onClick={() => navigate(`/ticket/${ticket.ticket_id}`)}
                                    ></i>
                                </td>
                                <td>{ticket.agent_id}</td>
                                <td>{ticket.category}</td>
                                <td>{ticket.priority}</td>
                                <td>{new Date(ticket.created_at).toLocaleString()}</td>
                                <td>{new Date(ticket.updated_at).toLocaleString()}</td>
                                <td>
                                    <button 
                                        className="btn btn-success"
                                        onClick={() => handleCloseTicket(ticket._id)}
                                    >
                                        Close Ticket
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ResolvedTickets;
