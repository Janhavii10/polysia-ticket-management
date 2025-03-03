import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/forgotpassword.css"; // Import the shared CSS file

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`/api/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });

      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000); // Redirect to login page after 2 seconds
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="page-background">
      <div className="card-container">
        {/* Floating Lock Icon */}
        <div className="floating-icon">
          <i className="bi bi-lock-fill"></i>
        </div>

        <h1 className="title">Reset Password</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary">Reset Password</button>
          </div>
        </form>

        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
