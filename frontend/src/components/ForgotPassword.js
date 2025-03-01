import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/forgotpassword.css"; // Importing the new CSS file

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("/api/forgot-password", { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="page-background">
            <div className="card-container">
                {/* Close Icon */}
                <div className="close-icon" onClick={() => navigate("/login")}>
                    <i className="bi bi-x-lg"></i>
                </div>

                <div className="floating-icon">
                    <i className="bi bi-key-fill"></i>
                </div>
                <h1 className="title">Forgot Password</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">Send Reset Link</button>
                    </div>
                </form>
                {message && <p className="error-message">{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;
