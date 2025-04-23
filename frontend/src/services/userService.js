import axios from 'axios';
import baseURL from '../config';
const userService = {
  // Get user profile information
  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${baseURL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to load profile data');
    }
  },

  // Change user password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.post(
        `${baseURL}/api/profile/changePassword`, 
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.post(
        `${baseURL}/api/profile/deleteAccount`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  },
};

export default userService;