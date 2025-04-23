import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded._id,
          email: decoded.email,
          name: decoded.name || decoded.firstName || ''
        });
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const token = await authService.login(credentials);
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set user
      const decoded = jwtDecode(token);
      setUser({
        id: decoded._id,
        email: decoded.email,
        name: decoded.name || decoded.firstName || ''
      });
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Verify email
  const verifyEmail = async (email, code) => {
    try {
      setError(null);
      const response = await authService.verifyEmail(email, code);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Get user ID function
  const getUserId = () => {
    if (user) {
      return user.id;
    }
    
    // If user state isn't loaded yet but token exists, try to get ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded._id;
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
    
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        verifyEmail,
        logout,
        getUserId // Export the new function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);