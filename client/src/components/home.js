import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleTaskReminders = () => {
    navigate("/dashboard");
  };

  const handleTimetable = () => {
    navigate("/timetable");
  };

  if (!user) {
    navigate("/login");
  }

  const features = [
    {
      title: "Real-time Updates",
      description: "Stay synchronized across all your devices",
      icon: "⏰",
    },
    {
      title: "Smart Notifications",
      description: "Get reminded when it matters most",
      icon: "🔔",
    },
    {
      title: "Easy Planning",
      description: "Intuitive interface for quick scheduling",
      icon: "✏️",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Notify Me!
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email || "User"}
              </span>
              <button
            onClick={handleLogout}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            <span>Sign out</span>
          </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome{user?.displayName ? `, ${user.displayName}` : ""}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your daily routine with our powerful task management and
            scheduling tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Task Reminders
              </h3>
              <p className="text-gray-600 mb-6">
                Never miss important tasks with our smart reminder system
              </p>
              <button
                onClick={handleTaskReminders}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Reminders
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Timetable
              </h3>
              <p className="text-gray-600 mb-6">
                Create and manage your schedule effortlessly
              </p>
              <button
                onClick={handleTimetable}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Timetable
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
