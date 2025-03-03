import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/agentticketdetails.css";

const TicketDetails = () => {
    const { ticketId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

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
                const response = await axios.get(`/api/ticket/${ticketId}/comments`, {
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
                `/api/ticket/${ticketId}/comments`,
                { content: newComment },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const newCommentData = response.data.comment;
            if (newCommentData.user_id === userId) {
                newCommentData.username = "You";
            }
            setComments([...comments, newCommentData]);
            setNewComment("");
        } catch (error) {
            setCommentError("Error posting comment");
        } finally {
            setCommentLoading(false);
        }
    };

    const handleRatingSubmit = async () => {
        if (rating < 1 || rating > 5) {
            alert("Please select a rating between 1 and 5.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `/api/ticket/${ticketId}/rate`,
                { rating, feedback },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("Thank you for your feedback!");
            setShowRatingModal(false);
        } catch (error) {
            alert("Error submitting rating. Please try again.");
        }
    };


    if (loading) return <p>Loading ticket details...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="container-fluid ticket-details-container">
            <div className="header-container">
                <h2>Ticket Details #{ticket.ticket_id}</h2>
                <a href="/dashboard-employee"><button className="btn btn-primary back-button">Raise New Ticket</button></a>
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
                        <p><strong>Description:</strong> {ticket.description}</p>
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
                    {/* Rate Us Section */}
                    {ticket.status === "Closed" && (
                        <div className="rate-us-container">
                            <button className="rate-us-button" onClick={() => setShowRatingModal(true)}>Rate Us</button>
                        </div>
                    )}

                    {/* Rating Modal */}
                    {showRatingModal && (
                        <div className="rating-modal">
                            <div className="rating-modal-content">
                                <i className="bi bi-x-lg close-icon" onClick={() => setShowRatingModal(false)}></i>
                                <h3>Rate Your Experience</h3>
                                <div className="rating-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={star}
                                            className={`bi ${star <= rating ? "bi-star-fill" : "bi-star"} star-icon`}
                                            onClick={() => setRating(star)}
                                        ></i>
                                    ))}
                                </div>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Leave your feedback (optional)"
                                    rows="3"
                                    className="form-control"
                                />
                                <div className="modal-buttons">
                                    <button className="btn btn-success" onClick={handleRatingSubmit}>Submit</button>
                                    {/* <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>Cancel</button> */}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="col-lg-8 col-md-12">
                    <div className={`comments-section ${showRatingModal ? "hidden" : ""}`}>

                        {comments.length === 0 ? (
                            <p>No comments yet.</p>
                        ) : (
                            <div className="comment-list">
                                {comments.map((comment) => (
                                    <div key={comment.comment_id} className="comment-item">
                                        <p className="comment-date">
                                            <i className="bi bi-clock"></i>
                                            {new Date(comment.created_at).toLocaleDateString('en-GB')} {" "}
                                            {new Date(comment.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p>
                                            <strong>{comment.user_id === userId ? "You" : comment.username}</strong> {comment.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {ticket.status === "Closed" && (
                            <p className="resolved-message">
                                Your issue has been resolved, and the ticket is closed now. If you have any more questions or concerns, feel free to contact us again.</p>
                        )}
                        {ticket.status === "In Progress" && (
                            <div className="comment-input">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    rows="2"
                                    className="form-control small-textarea"
                                />
                                <button className="btn btn-primary send-button" onClick={handleCommentSubmit} disabled={commentLoading}>
                                    <i className="bi bi-send"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
