const express = require('express');
const ContentGeneratorController = require('../Controllers/ContentGeneratorController');

const router = express.Router();

// Route for generating content
router.post('/generate', ContentGeneratorController.generateContent);

// Route for getting available genres
router.get('/genres', (req, res) => {
  const { type, language } = req.query;
  
  // Validate input
  const validTypes = ['paragraph', 'code'];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid content type' });
  }

  try {
    const genres = ContentGeneratorController.getAvailableGenres(type, language);
    res.json({ genres });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;