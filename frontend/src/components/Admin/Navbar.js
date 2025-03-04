import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom"; // Import NavLink
import "../../styles/navbar.css"; 
import axios from "axios";

const AdminNavbar = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        // Set the user's name
        setUserName(response.data.name);
      } catch (error) {
        console.error("Error fetching user profile:", error.response?.data || error.message);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light custom-navbar">
      <div className="container-fluid">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src="https://media.licdn.com/dms/image/v2/D4E0BAQHS2G46ujkRug/company-logo_200_200/company-logo_200_200/0/1720723871576?e=2147483647&v=beta&t=Capag2dok1g8slpwxM2N_1a5oWwQE4n8zS33UQd2dZE"
            alt="Logo"
            className="logo me-2"
          />
        </a>

        {/* Toggler for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard-admin" end activeClassName="active-link">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard-admin/all-tickets" activeClassName="active-link">
                Assign Agents
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard-admin/resolved-tickets" activeClassName="active-link">
                Resolved Tickets
              </NavLink>
            </li>
          </ul>

          {/* Right Section */}
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            {/* <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="bi bi-bell-fill"></i>
              </a>
            </li> */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="navbarDropdownMenuLink"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Welcome, {userName || "Admin"}!{" "}
                <i className="bi bi-person-circle ms-2"></i>
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdownMenuLink"
              >
                <li>
                  <a className="dropdown-item" href="/dashboard-admin/stats">
                    See Ticket Trends
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="/change-password">
                    Change Password
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="/login">
                    Log Out
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
