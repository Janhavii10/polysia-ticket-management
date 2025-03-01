import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/assignedtickets.css";

const AgentResolvedTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [sortOrder, setSortOrder] = useState("desc");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: "",
        priority: "",
    });

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.error("Unauthorized: Missing token.");
                    return;
                }

                const response = await axios.get("/api/assignedtickets", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("Fetched Tickets:", response.data.tickets);
                
                const openTickets = response.data.tickets.filter(ticket => ticket.status === "Resolved");
                setTickets(openTickets);
                setFilteredTickets(openTickets);
            } catch (error) {
                console.error("Error fetching assigned tickets:", error.response?.data || error.message);
            }
        };

        fetchTickets();
    }, []);

    // Handle Sorting
    const handleSort = () => {
        const sorted = [...filteredTickets].sort((a, b) =>
            sortOrder === "asc"
                ? new Date(a.created_at) - new Date(b.created_at)
                : new Date(b.created_at) - new Date(a.created_at)
        );
        setFilteredTickets(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        let updatedTickets = [...tickets];

        if (filters.category) {
            updatedTickets = updatedTickets.filter(ticket => ticket.category === filters.category);
        }
        if (filters.priority) {
            updatedTickets = updatedTickets.filter(ticket => ticket.priority === filters.priority);
        }

        setFilteredTickets(updatedTickets);
    }, [filters, tickets]);

    const clearFilters = () => {
        setFilters({ category: "", priority: "" });
        setFilteredTickets(tickets);
    };

    return (
        <>
            <div className="tickets-container">
                <div className="heading">
                    <h2>Resolved Tickets ({filteredTickets.length})</h2>
                    
                    <div className="buttons">
                        <button className="sort-btn" onClick={handleSort}>
                            Sort <i className="bi bi-filter"></i>
                        </button>

                        <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
                            Filter <i className="bi bi-funnel-fill"></i>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                    <div className="filters-container">
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">Filter by Category</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Admin">Admin</option>
                        </select>

                        <select name="priority" value={filters.priority} onChange={handleFilterChange}>
                            <option value="">Filter by Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>

                        <button className="clear-filters" onClick={clearFilters}><i className="bi bi-x-lg"></i></button>
                    </div>
                )}

                {/* Display Filtered & Sorted Tickets */}
                {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                        <div key={ticket.ticket_id} className="ticket-card">
                            <div className="ticket-header">
                                <span className="ticket-id">
                                    <strong>Ticket ID:</strong> {ticket.ticket_id}
                                </span>
                                <span className="ticket-date">
                                    <strong>Created On:</strong> {new Date(ticket.created_at).toLocaleString()}
                                </span>
                                <span className="status open">{ticket.status}</span>
                            </div>

                            <p className="ticket-subject">
                                <strong>Subject: </strong>{ticket.subject}
                            </p>

                            <p className="ticket-category">
                                <strong>Category:</strong> {ticket.category}
                            </p>

                            <p className="ticket-priority">
                                <strong>Priority:</strong> {ticket.priority}
                            </p>

                            <a href={`/ticket/${ticket.ticket_id}`} className="view-details">
                                View Details
                            </a>
                        </div>
                    ))
                ) : (
                    <p className="no-tickets">No open tickets found.</p>
                )}
            </div>
        </>
    );
};

export default AgentResolvedTickets;
