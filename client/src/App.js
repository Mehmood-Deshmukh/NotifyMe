import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import HomePage from './components/home';
import Timetable from './components/timetable';
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/home" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/home" /> : <Signup />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/home"
        element={user ? <HomePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={user ? <Navigate to="/home" /> : <Login />}
      />
      <Route
        path="/timetable"
        element={user ? <Timetable /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <PrimeReactProvider>
      <Router>
        <AppRoutes />
      </Router>
      </PrimeReactProvider>
    </AuthProvider>
  );
}

export default App;