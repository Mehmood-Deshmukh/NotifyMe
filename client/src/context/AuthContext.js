import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const baseUrl = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser && JSON.parse(storedUser);
    console.log(parsedUser);
    if (parsedUser && !isTokenExpired(parsedUser.token)) {
      setUser(parsedUser);
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const isTokenExpired = (token) => {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= exp * 1000;
    } catch {
      return true; 
    }
  };

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        data.user.token = data.session.access_token;
        saveUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred' };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      
      if (response.ok) {
        data.user.token = data.session.access_token;
        saveUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred' };
    }
  };

  const googleSignIn = async (credential) => {
    try {
      const response = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json();
      if (response.ok) {
        data.user.token = data.session.access_token;
        saveUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred during Google sign-in' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, googleSignIn }}>
      {children}
    </AuthContext.Provider>
  );
};