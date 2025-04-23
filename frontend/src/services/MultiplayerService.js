import axios from 'axios';
import baseURL from '../config';
import { getUserId } from './authService';

const API_URL = `${baseURL}/api/multiplayer`;

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle API errors
const handleApiError = (error) => {
  const errorMessage = error.response?.data?.error || 
                      error.response?.data?.details || 
                      error.message || 
                      'An error occurred';
  
  console.error('API Error:', errorMessage);
  throw new Error(errorMessage);
};

const MultiplayerService = {
  // Create a new room
  createRoom: async (contentConfig = {}) => {
    try {
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('User authentication required');
      }
      
      // Default content config
      const finalConfig = {
        type: contentConfig.type || 'paragraph',
        level: contentConfig.level || 'intermediate',
        genre: contentConfig.genre || 'general'
      };
      
      const response = await axios.post(`${API_URL}/rooms`, {
        hostId: userId,
        contentConfig: finalConfig
      }, {
        headers: getAuthHeader()
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Join an existing room
  joinRoom: async (roomId) => {
    try {
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('User authentication required');
      }
      
      const response = await axios.post(`${API_URL}/rooms/join`, {
        roomId,
        guestId: userId
      }, {
        headers: getAuthHeader()
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get room details
  getRoomDetails: async (roomId) => {
    try {
      const response = await axios.get(`${API_URL}/rooms/${roomId}`, {
        headers: getAuthHeader()
      });
      
      // Process player information
      const currentUserId = getUserId();
      
      if (currentUserId && response.data.players) {
        // Identify current user and opponent
        const currentPlayer = response.data.players.find(p => p.userId === currentUserId);
        const opponent = response.data.players.find(p => p.userId !== currentUserId);
        
        // Format player info
        response.data.playerInfo = currentPlayer ? {
          ...currentPlayer,
          isCurrentUser: true,
          displayName: 'You'
        } : null;
        
        response.data.opponentInfo = opponent ? {
          ...opponent,
          isCurrentUser: false,
          displayName: opponent.name
        } : null;
        
        // Set host flag
        response.data.isHost = currentPlayer?.isHost || false;
      }
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Check if a room exists and is available
  checkRoomAvailability: async (roomId) => {
    try {
      const response = await axios.get(`${API_URL}/rooms/${roomId}/availability`, {
        headers: getAuthHeader()
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Cancel a room (host only)
  cancelRoom: async (roomId) => {
    try {
      const userId = getUserId();
      
      const response = await axios.post(`${API_URL}/rooms/${roomId}/cancel`, {
        userId
      }, {
        headers: getAuthHeader()
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  saveFinalScore: async (roomId, performanceData) => {
    try {
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('User authentication required');
      }
      
      const response = await axios.post(`${API_URL}/performance`, {
        roomId,
        userId,
        progress: performanceData.progress,
        wpm: performanceData.wpm,
        accuracy: performanceData.accuracy,
        score: performanceData.score
      }, {
        headers: getAuthHeader()
      });
      
      console.log('Final score saved to database:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving final score:', error);
      return handleApiError(error);
    }
  }
};

export default MultiplayerService;