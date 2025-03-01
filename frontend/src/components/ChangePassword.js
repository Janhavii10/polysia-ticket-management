import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/changepassword.css";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/change-password",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(response.data.message);

      // Clear form fields after successful password change
      setFormData({
        oldPassword: "",
        newPassword: "",
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Error changing password");
    }
  };

  const handleCancel = () => {
    const userRole = localStorage.getItem("role"); // Fetch user role

    let redirectPath = "/dashboard-employee"; // Default path

    if (userRole === "Admin") {
      redirectPath = "/dashboard-admin";
    } else if (userRole === "Agent") {
      redirectPath = "/dashboard-agent";
    }

    navigate(redirectPath);
  };

  return (
    <div className="page-background">
      <div className="card-container">
        <div className="floating-icon">
          <i className="bi bi-key-fill fs-3"></i>
        </div>

        <h4 className="title">Change Password</h4>

        {message && <p className="error-message">{message}</p>}

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="form-group">
            <label className="fw-bold">Old Password</label>
            <input
              type="password"
              name="oldPassword"
              placeholder="Old Password"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="fw-bold">New Password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="button-group-button">
            <button type="submit" className="btn btn-primary px-4">
              Change Password
            </button>
            <button
              type="button"
              className="btn btn-link cancel-btn ms-3"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
