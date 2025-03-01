import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/agentticketdetails.css";


const AgentTicketDetails = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(() => {
        const fetchUserData = () => {
            const userData = localStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUserId(parsedUser.user_id);
            }
        };
        

        const fetchTicketDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`/api/ticket/${ticketId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const updatedTicket = {
                    ...response.data.ticket,
                    attachments: response.data.ticket.attachments.map(file => ({
                        ...file,
                        fileUrl: `/${file.file_url}`,
                    })),
                };
                setTicket(updatedTicket);
            } catch (error) {
                setError("Error fetching ticket details");
            } finally {
                setLoading(false);
            }
        };

        
    

        const fetchComments = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`https://polysia-ticket-management-backend.onrender.com/api/ticket/${ticketId}/comments`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setComments(response.data.comments);
            } catch (error) {
                setCommentError("Error fetching comments");
            }
        };

        fetchUserData();
        fetchTicketDetails();
        fetchComments();
    }, [ticketId]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `https://polysia-ticket-management-backend.onrender.com/api/ticket/${ticketId}/comments`,
                { content: newComment },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const newCommentData = response.data.comment;
            if (newCommentData.user_id === userId) {
                newCommentData.username = "You";
            }

            // Update comments list
            setComments([...comments, newCommentData]);

            // Update ticket status in UI if it's "Open"
            if (ticket.status === "Open") {
                setTicket({ ...ticket, status: "In Progress" });
            }

            setNewComment("");
        } catch (error) {
            setCommentError("Error posting comment");
        } finally {
            setCommentLoading(false);
        }
    };

    const handleResolveTicket = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `https://polysia-ticket-management-backend.onrender.com/api/ticket/${ticketId}/resolve`,
                { status: "Resolved" },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setTicket({ ...ticket, status: "Resolved" });
        } catch (error) {
            console.error("Error resolving ticket:", error);
            setError("Error updating ticket status");
        }
    };


    if (loading) return <p>Loading ticket details...</p>;
    if (error) return <p className="error">{error}</p>;

    const getTruncatedDescription = (description, wordLimit = 50) => {
        const words = description.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return description;
    };

    return (
        <div className="container-fluid ticket-details-container">
            <div className="header-container">
                <h2>Ticket Details #{ticket.ticket_id}</h2>
                <a href="/dashboard-agent"><button className="btn btn-primary back-button">
                    Back
                </button></a>
            </div>
            <div className="row">
                <div className="col-lg-4 col-md-12">
                    <div className="ticket-info">
                    <h3 className="attachments-heading">Details</h3>
                    <hr className="heading-line" />
                        {/* <p><strong>Ticket ID:</strong> {ticket.ticket_id}</p> */}
                        <p><strong>Subject:</strong> {ticket.subject}</p>
                        <p><strong>Status:</strong> {ticket.status}</p>
                        <p><strong>Category:</strong> {ticket.category} </p>
                        <p><strong>Priority:</strong> {ticket.priority}</p>
                        <p><strong>Description:</strong> 
                            {showFullDescription 
                                ? ticket.description 
                                : getTruncatedDescription(ticket.description)}
                        </p>
                        {ticket.description.split(" ").length > 50 && (
                            <button 
                                className="btn btn-link see-more-btn" 
                                onClick={() => setShowFullDescription(!showFullDescription)}
                            >
                                {showFullDescription ? "See Less" : "See More"}
                            </button>
                        )}
                        <p><strong>Created On:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
                    </div>
                    <div className="media-files">
                    <h3 className="attachments-heading">Attachments</h3>
                    <hr className="heading-line" />
                        {ticket.attachments && ticket.attachments.length > 0 ? (
                            <div className="attachments">
                                {ticket.attachments.map((file, index) => (
                                    <div key={index} className="attachment-item">
                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <img src={file.fileUrl} alt="Attachment" className="attachment-image" />
                                        </a>
                                        <p>{file.file_name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No attachments available.</p>
                        )}
                    </div>
                    <button
                        className="btn btn-resolve"
                        onClick={handleResolveTicket}
                        disabled={ticket.status === "Resolved" || ticket.status === "Closed"}
                    >
                        {ticket.status === "Resolved" ? "Ticket Resolved" : "Resolve Ticket"}
                    </button>

                </div>
                <div className="col-lg-8 col-md-12">
                    <div className="comments-section">
                        {comments.length === 0 ? (
                            <p>No comments yet.</p>
                        ) : (
                            <div className="comment-list">
                                {comments.map((comment) => (
                                    <div key={comment.comment_id} className="comment-item">
                                        <p className="comment-date">
                                            <i className="bi bi-clock"></i>
                                            {new Date(comment.created_at).toLocaleDateString('en-GB')}{" "}
                                            {new Date(comment.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p>
                                            <strong>{comment.user_id === userId ? "You" : comment.username}</strong>{" "}
                                            {comment.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="comment-input">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows="2"
                                className="form-control small-textarea"
                                disabled={ticket.status === "Resolved" || ticket.status === "Closed"}  // Disable textarea when resolved
                            />
                            <button
                                className="btn btn-primary send-button"
                                onClick={handleCommentSubmit}
                                disabled={commentLoading || ticket.status === "Resolved" || ticket.status === "Closed"}  // Disable button when resolved
                            >
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentTicketDetails;
