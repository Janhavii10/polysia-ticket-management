import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../styles/pendinguser.css";

const PendingUser = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    // Fetch pending users on component mount
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get('/api/admin/pending-users');
        setPendingUsers(response.data.pendingUsers);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPendingUsers();
  }, []);

  const approveUser = async (id) => {
    try {
      await axios.post('/api/admin/approve', { pendingUserId: id });
      setPendingUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const rejectUser = async (id) => {
    try {
      await axios.post('/api/admin/reject', { pendingUserId: id });
      setPendingUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="user-auth-container">
      <h1>Pending Users</h1>

      {pendingUsers.length === 0 ? (
        <p className="no-users-message">No user approval pending</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.user_id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="approve-btn" onClick={() => approveUser(user._id)}>Approve</button>
                  <button className="reject-btn" onClick={() => rejectUser(user._id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingUser;

