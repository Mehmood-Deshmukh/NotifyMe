import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
        {user && <p className="mb-4">Hello, {user.name || user.email}!</p>}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;