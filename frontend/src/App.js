import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Routes, Route, useLocation, matchPath } from 'react-router-dom';
import { useEffect, useState } from "react";
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminLogin from './components/AdminLogin';
import EmployeeDashboard from './components/EmployeeDashboard';
import AgentDashboard from './components/AgentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ChangePassword from './components/ChangePassword';
import PreviousTickets from './components/Employee/PreviousTickets';
import TicketsPage from './components/Admin/TicketsPage';
import TicketDetails from './components/Employee/TicketDetails';
import AgentTicketDetails from './components/Agent/AgentTicketDetails';
import ResolvedTickets from './components/Admin/ResolvedTickets';
import AgentNavbar from "./components/Agent/Navbar";
import EmployeeNavbar from "./components/Employee/Navbar";
import AdminNavbar from "./components/Admin/Navbar";
import PendingTickets from "./components/Agent/PendingTickets"
import AgentResolvedTickets from "./components/Agent/ResolvedTickets";

const App = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    // Set Authorization Header Globally
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];  // Remove header if token is missing
    }
  }, []); // Runs once when app loads

  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    setUserRole(localStorage.getItem("role"));
  }, [location.pathname]);

  // Pages where Navbar is NOT needed
  const noNavbarRoutes = ["/login", "/", "/adminlogin", "/change-password", "/forgot-password"];
  const dynamicNoNavbarRoutes = ["/ticket/:ticketId", "/employee/ticket/:ticketId", "/reset-password/:token"];
  const isNoNavbarPage = noNavbarRoutes.includes(location.pathname) ||
    dynamicNoNavbarRoutes.some((route) => matchPath(route, location.pathname));

  return (
    <>
      {!isNoNavbarPage && (
        userRole === "Admin" ? <AdminNavbar /> :
          userRole === "Agent" ? <AgentNavbar /> :
            userRole === "Employee" ? <EmployeeNavbar /> :
              null  // Fallback in case role is missing
      )}

      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard-employee" element={<EmployeeDashboard />} />
        <Route path="/dashboard-agent" element={<AgentDashboard />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard-employee/previous-tickets" element={<PreviousTickets />} />
        <Route path="/dashboard-admin/all-tickets" element={<TicketsPage />} />
        <Route path="/dashboard-admin/resolved-tickets" element={<ResolvedTickets />} />
        <Route path="/employee/ticket/:ticketId" element={<TicketDetails />} />
        <Route path="/ticket/:ticketId" element={<AgentTicketDetails />} />
        <Route path="/dashboard-agent/pending-tickets" element={<PendingTickets />} />
        <Route path="/dashboard-agent/resolved-tickets" element={<AgentResolvedTickets />} />
      </Routes>
    </>
  );
}

export default App;
