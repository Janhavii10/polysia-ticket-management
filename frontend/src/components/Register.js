import React, { useState } from 'react';
import axios from 'axios';
import 'font-awesome/css/font-awesome.min.css';
import '../styles/register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    password: '',
    role: '', // Default role
    profile_image: '',
  });

  const [message, setMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData); // Debugging line
    try {
      const response = await axios.post('/api/register', formData);
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };
  

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>CREATE ACCOUNT</h1>
        <div className="mb-3">
          <input
            type="text"
            name="user_id"
            placeholder="User ID"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3 position-relative">
          <input
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            className="form-control"
            onChange={handleChange}
            required
          />
          <i
            className={`fa ${passwordVisible ? 'fa-eye' : 'fa-eye-slash'} position-absolute`}
            style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
            onClick={togglePasswordVisibility}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="role" className="form-label">Role</label>
          <select id="role" name="role" className="form-select" onChange={handleChange} required>
            <option value="" disabled selected>
              Select Role
            </option>
            <option value="Employee">Employee</option>
            <option value="Agent">Support Agent</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="profile_image"
            placeholder="Profile Image URL"
            className="form-control"
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn register-button w-100">
          Register
        </button>
        {message && <p className="message">{message}</p>}
        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
