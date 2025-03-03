import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import '../styles/login.css';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://ticket-management-k5lr.onrender.com/api/login", formData);
      console.log("Login Response:", response.data); // Debugging
  
      if (response.data.message === "Login successful") {
        const token = response.data.token;
        const user = response.data.user;
        const role = response.data.role;

        if (!token) {
          console.error("No token received from server");
          setMessage("Error: No token received. Please try again.");
          return;
        }
  
        // Ensure token and user are stored correctly
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", role);

        console.log("Stored Token:", localStorage.getItem("token")); // Debugging

        // Force re-render by updating a global state
      window.dispatchEvent(new Event("storage"));
  
        if (response.data.role === "Employee") {
          navigate("/dashboard-employee");
        } else if (response.data.role === "Agent") {
          navigate("/dashboard-agent");
        } else if (response.data.role === "Admin") {
          setMessage("Admin role detected. Please login as admin.");
        } else {
          setMessage("Invalid role. Please contact support.");
        }
      } else {
        setMessage(response.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error occurred");
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Login</h1>
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

        <p className="login-link">
          Login as <Link to="/adminlogin">Admin</Link>
        </p>

        <p className="login-link">
           <Link to="/forgot-password">Forgot Password</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
