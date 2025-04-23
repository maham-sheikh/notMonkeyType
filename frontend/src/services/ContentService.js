import axios from 'axios';
import baseURL from '../config';

class ContentService {
  // Fetch available genres
  static async getGenres(type, language = null) {
    try {
      const params = new URLSearchParams({
        type,
        ...(type === 'code' && language ? { language } : {})
      });

      const response = await axios.get(`${baseURL}/api/content/genres?${params}`);
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  // Generate content
  static async generateContent(params) {
    try {
      const response = await axios.post(`${baseURL}/api/content/generate`, params);
      return response.data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  // Save game session
  static async saveGameSession(sessionData) {
    try {
      const response = await axios.post(`http://${baseURL}/api/gameSession/add`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error saving game session:', error);
      throw error;
    }
  }
}

export default ContentService;