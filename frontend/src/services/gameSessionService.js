import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import baseURL from '../config';

const API_URL = `${baseURL}/api/gameSession`;

// Helper function to handle API errors consistently
const handleError = (error) => {
  console.error('API error:', error);
  
  if (error.response) {
    throw new Error(error.response.data?.message || `Error: ${error.response.status}`);
  } else if (error.request) {
    throw new Error('No response from server. Please check your connection.');
  } else {
    throw new Error(error.message || 'An unknown error occurred');
  }
};

// Get user ID from token
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const decoded = jwtDecode(token);
    
    return decoded._id;
  } catch (error) {
    console.error('Token decode error:', error);
    throw new Error('Authentication invalid');
  }
};


const getEmailFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const decoded = jwtDecode(token);
    return decoded.email;
  } catch (error) {
    console.error('Token decode error:', error);
    throw new Error('Authentication invalid');
  }
};

// Fetch all game sessions for leaderboard
export const fetchGameSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Fetch game sessions for currently logged-in user
export const fetchUserGameSessions = async () => {
  try {
    const userId = getUserIdFromToken();
    return await fetchGameSessionsByUserId(userId);
  } catch (error) {
    return handleError(error);
  }
};

// Fetch game sessions for a specific user ID
export const fetchGameSessionsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Add a new game session
export const addGameSession = async (sessionData) => {
  try {
    const response = await axios.post(`${API_URL}/add`, sessionData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Delete a game session by ID
export const deleteGameSession = async (sessionId) => {
  try {
    const response = await axios.delete(`${API_URL}/${sessionId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Save a completed game session with user authentication
export const saveGameResult = async (gameData) => {
  try {

    const userId = getUserIdFromToken();
    const email = getEmailFromToken();
    console.log("Saving game result...,User ID",userId);

    const sessionData = { ...gameData, userId ,email};

    console.log("Session Data:", sessionData);

    const response = await axios.post(`${API_URL}/add`, sessionData);
    console.log("Response:", response);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};
