import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedId = localStorage.getItem('userId');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');

    if (savedToken && savedUsername && savedRole) {
      setToken(savedToken);
      setUser({ id: savedId ? parseInt(savedId) : null, username: savedUsername, role: savedRole });
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/auth/login', { usernameOrEmail, password });
      const { accessToken, id, username, role } = response.data;

      // Save to local storage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('userId', id);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      // Update state
      setToken(accessToken);
      setUser({ id, username, role });
      
      return { success: true, role };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
