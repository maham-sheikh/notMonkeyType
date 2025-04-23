import axios from 'axios';
import baseURL from '../config';
import { getUserId } from '../services/authService';  // Added auth service import

/**
 * Service for accessing multiplayer game statistics
 */
const friendService = {
  /**
   * Retrieve multiplayer statistics for a specific user
   * @param {string} userId - The ID of the user to fetch stats for
   * @returns {Promise<Object>} Detailed multiplayer statistics
   */
  getUserMultiplayerStats: async (userId) => {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Get current authenticated user ID for additional security
    const currentUserId = getUserId();
    if (!currentUserId) {
      throw new Error('Authentication required');
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }
      
      const response = await axios.post(
        `${baseURL}/api/multiplayer/stats/user`,
        { 
          userId,
          requesterId: currentUserId  // Include requester ID for potential access control
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user multiplayer stats:', error);
      
      // Standardized error handling
      if (error.response) {
        const errorMessage = error.response.data?.error || 
                             `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      }
      
      // Fallback error handling
      throw error;
    }
  },
};

export default friendService;