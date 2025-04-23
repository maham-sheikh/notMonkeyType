import axios from 'axios';
import baseURL from '../config';
import { jwtDecode } from 'jwt-decode';

const API_URL = `${baseURL}/api`;

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response && error.response.data) {
    throw new Error(error.response.data.message || 'An error occurred');
  }
  throw new Error('Network error. Please try again later.');
};

// Get user ID from token
export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded._id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};

export const getUserInfoFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded._id,
      email: decoded.email,
      name: decoded.name || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim(),
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      isAuthenticated: true
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return {
      id: null,
      email: null,
      name: null,
      firstName: null,
      lastName: null,
      isAuthenticated: false
    };
  }
};

// Auth service functions
const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/authenticate`, credentials);
      return response.data.data; // Return token
    } catch (error) {
      return handleError(error);
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/registerUsers`, userData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Verify email
  verifyEmail: async (email, verificationCode) => {
    try {
      const response = await axios.post(`${API_URL}/verifyEmail`, {
        email,
        verificationCode
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete user (used when verification is canceled)
  deleteUser: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/deleteUser`, { email });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Get current user ID
  getUserId,


  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await axios.post(
        `${API_URL}/profile/changePassword`, 
        passwordData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete account
  deleteAccount: async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/profile/deleteAccount`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};

export default authService;