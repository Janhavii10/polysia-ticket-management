import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../styles/prevtickets.css";


const PreviousTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [sortOrder, setSortOrder] = useState("desc");
    const [showFilters, setShowFilters] = useState(false); // Toggle filter options
    const [filters, setFilters] = useState({
        status: "",
        category: "",
        priority: "",
    });


    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/prevtickets", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTickets(response.data.tickets);
                setFilteredTickets(response.data.tickets);
            } catch (error) {
                console.error("Error fetching previous tickets:", error);
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

    // Handle Filter Change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Apply Filters
    useEffect(() => {
        let updatedTickets = [...tickets];

        if (filters.status) {
            updatedTickets = updatedTickets.filter(ticket => ticket.status === filters.status);
        }
        if (filters.category) {
            updatedTickets = updatedTickets.filter(ticket => ticket.category === filters.category);
        }
        if (filters.priority) {
            updatedTickets = updatedTickets.filter(ticket => ticket.priority === filters.priority);
        }

        setFilteredTickets(updatedTickets);
    }, [filters, tickets]);

    // Clear Filters
    const clearFilters = () => {
        setFilters({ status: "", category: "", priority: "" });
        setFilteredTickets(tickets);
    };

    return (
        <>
            <div className="tickets-container">
                <div className="heading">
                    <h2>Previous Tickets ({filteredTickets.length})</h2>

                    <div className="buttons">
                        {/* Sort By Button */}
                        <button className="sort-btn" onClick={handleSort}>
                            Sort <i className="bi bi-filter"></i>
                        </button>

                        {/* Filter By Button */}
                        <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
                            Filter <i class="bi bi-funnel-fill"></i>
                        </button>
                    </div>
                </div>

                {/* Filters Section (Shows only when user clicks "Filter By") */}
                {showFilters && (
                    <div className="filters-container">
                        <select name="status" value={filters.status} onChange={handleFilterChange}>
                            <option value="">Filter by Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>

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

                        <button className="clear-filters" onClick={clearFilters}><i class="bi bi-x-lg"></i></button>
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
                                <span className={`status ${ticket.status.toLowerCase().replace(/\s+/g, '-')}`}>{ticket.status}</span>
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

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <p className="ticket-attachments">
                                    <strong>Attachments:</strong>
                                    {ticket.attachments.map((attachment, index) => (
                                        <a key={index} href={attachment} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                            Attachment {index + 1}
                                        </a>
                                    ))}
                                </p>
                            )}

                            <Link to={`/employee/ticket/${ticket.ticket_id}`} className="view-details">
                                View Details
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="no-tickets">No tickets found.</p>
                )}
            </div>
        </>
    );
};

export default PreviousTickets;
