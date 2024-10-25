import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { setupWebPush } from "../webPushSetup";
import { Plus, LogOut, Calendar } from "lucide-react";
import { Toast } from 'primereact/toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const toast = useRef(null);

  useEffect(() => {
    fetchTasks();
    setupWebPush(user);
  }, [user]);

  const showToast = (severity, summary, detail) => {
    toast.current.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000
    });
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      } else {
        showToast('error', 'Error', 'Failed to fetch tasks');
      }

      setLoading(false);
    } catch (err) {
      showToast('error', 'Error', 'An error occurred while fetching tasks');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged Out', 'You have been successfully logged out');
    navigate("/login");
  };

  const handleAddTask = async () => {
    if (!newTaskName || !dueDate) {
      showToast('warn', 'Validation Error', 'Please enter task name and due date');
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ taskName: newTaskName, dueDate }),
      });

      if (response.ok) {
        showToast('success', 'Success', 'Task added successfully');
        setNewTaskName("");
        setDueDate("");
        fetchTasks();
      } else {
        showToast('error', 'Error', 'Failed to add task');
      }
    } catch (err) {
      showToast('error', 'Error', 'An error occurred while adding the task');
    }
  };

  const renderTask = (task) => {
    const isCompleted = new Date() > new Date(task.dueDate);
    const formattedDate = new Date(task.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        key={task.id}
        className="bg-white rounded-lg p-6 shadow-sm transition-all hover:shadow-md border border-gray-100"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">{task.taskName}</h3>
          <span
            className={`${
              isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            } text-xs px-2 py-1 rounded-full font-medium`}
          >
            {isCompleted ? "Completed" : "Pending"}
          </span>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar size={14} className="mr-2" />
          {formattedDate}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">
            Welcome back, Mehmood
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            <span>Sign out</span>
          </button>
        </div>

        <div className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddTask}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add Task
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  No tasks yet. Add your first task to get started.
                </p>
              </div>
            ) : (
              tasks.map(renderTask)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;