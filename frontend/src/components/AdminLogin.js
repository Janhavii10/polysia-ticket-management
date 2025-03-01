import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import '../styles/login.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', formData);

      if (response.data.message === 'Login successful') {
        const token = response.data.token; // Get the token from the response
        const role = response.data.role; // Get the user's role
        const user = response.data.user; // Get the user object

        // Save the token in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem("role", role);

        // Check if the user's role is Admin
        if (role === 'Admin') {
          navigate('/dashboard-admin', { state: { user } });
        } else {
          setMessage('Access denied. Only admins can log in.');
        }
      } else {
        setMessage(response.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="login-link">
          New user? <Link to="/">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
