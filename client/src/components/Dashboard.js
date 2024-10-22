import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setupWebPush } from '../webPushSetup';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const baseUrl = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    fetchTasks();
    setupWebPush(user);
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      setError('An error occurred while fetching tasks');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddTask = async () => {
    if (!newTaskName || !dueDate) {
      setError('Please enter task name and due date');
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ taskName: newTaskName, dueDate }),
      });

      if (response.ok) {
        setNewTaskName('');
        setDueDate('');
        fetchTasks();
      } else {
        setError('Failed to add task');
      }
    } catch (err) {
      setError('An error occurred while adding the task');
    }
  };

  const renderTask = (task) => {
    const isCompleted = new Date() > new Date(task.dueDate);

    return (
      <div key={task.id} className="bg-blue-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold">{task.taskName}</h3>
        <p className="text-gray-600">Due Date: {task.dueDate}</p>
        <div className="mt-2">
          <span
            className={`${
              isCompleted
                ? 'bg-green-500'
                : 'bg-yellow-500'
            } text-white text-sm px-2 py-1 rounded`}
          >
            {isCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Hello, Mehmood!</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Task Name"
            value={newTaskName} 
            onChange={(e) => setNewTaskName(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
          />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
  
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Manage Your Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No tasks found.</p>
            </div>
          ) : (
            tasks.map((task) => (
              renderTask(task)
            ))
          )}
        </div>
      </div>
  

      <button
        onClick={handleLogout} 
        className="mt-8 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
