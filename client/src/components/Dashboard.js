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
  const [reminderTime, setReminderTime] = useState('');
  const [error, setError] = useState('');

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const ISTOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds

  useEffect(() => {
    fetchTasks();
    setupWebPush(user);
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
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
    if (!newTaskName || !dueDate || !reminderTime) {
      setError('Please enter task name, due date, and reminder time');
      return;
    }

    // Check if running on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    try {
      const dueDateAdjusted = isLocalhost ? new Date(dueDate) : new Date(new Date(dueDate).getTime() + ISTOffset);
      const reminderTimeAdjusted = isLocalhost ? new Date(reminderTime) : new Date(new Date(reminderTime).getTime() + ISTOffset);

      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          taskName: newTaskName,
          dueDate: dueDateAdjusted.toISOString(),
          reminderTime: reminderTimeAdjusted.toISOString()
        })
      });

      if (response.ok) {
        setNewTaskName('');
        setDueDate('');
        setReminderTime('');
        fetchTasks();
      } else {
        setError('Failed to add task');
      }
    } catch (err) {
      setError('An error occurred while adding the task');
    }
  };

  // Function to format UTC date to local time, adjusting for IST if not on localhost
  const formatLocalTime = (utcDate) => {
    const date = new Date(utcDate);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Apply offset only if not running on localhost
    const localDate = isLocalhost ? date : new Date(date.getTime() + ISTOffset);
    return localDate.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
        {user && <p className="mb-4">Hello, {user.firstname || user.email}!</p>}
        <div className="space-y-4">
          <div>
            <label htmlFor="newTaskName" className="block text-sm font-medium text-gray-700">Task Name</label>
            <input
              id="newTaskName"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter task name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700">Reminder Time</label>
            <input
              id="reminderTime"
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <button
            onClick={handleAddTask}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Task
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>
          {tasks.map((task) => (
            <div key={task.id} className="bg-gray-50 p-3 rounded-md mb-2">
              <p className="text-gray-800">{task.taskName}</p>
              <p className="text-sm text-gray-500">Due: {formatLocalTime(task.dueDate)}</p>
              <p className="text-sm text-gray-500">Reminder: {formatLocalTime(task.reminderTime)}</p>
              <p className="text-sm text-gray-500">Status: {task.isCompleted ? 'Completed' : 'Pending'}</p>
            </div>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
