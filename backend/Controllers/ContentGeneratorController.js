const axios = require("axios");

class ContentGeneratorController {
  // Get available genres based on content type and language
  static getAvailableGenres(type, language = null) {
    const genres = {
      paragraph: ["general", "technical", "creative"],
      code: {
        javascript: ["algorithm", "dataStructure", "utility"],
        python: ["algorithm", "dataStructure", "utility"],
      },
    };

    if (type === "code" && language) {
      return genres.code[language] || [];
    }

    return genres[type] || [];
  }

  // Prompt template generator
  static _getPromptTemplate(type, level, language, genre) {
    const templates = {
      paragraph: {
        beginner: {
          general: "Write a simple, beginner-friendly paragraph about {genre}.",
          technical: "Create a beginner-level paragraph that introduces {genre}.",
          creative: "Write an engaging, simple paragraph about {genre}.",
        },
        intermediate: {
          general: "Compose a detailed paragraph about {genre} with deeper insights.",
          technical: "Write an intermediate-level paragraph explaining {genre}.",
          creative: "Craft a creative and thought-provoking paragraph on {genre}.",
        },
        expert: {
          general: "Write an advanced, analytical paragraph about {genre}.",
          technical: "Compose a complex paragraph on {genre} with in-depth insights.",
          creative: "Create an intellectually challenging paragraph about {genre}.",
        },
      },
      code: {
        beginner: {
          javascript: {
            algorithm: "Write a simple JavaScript function for {genre}.",
            dataStructure: "Implement a basic {genre} structure in JavaScript.",
            utility: "Develop a basic JavaScript utility function for {genre}.",
          },
          python: {
            algorithm: "Write a Python function implementing {genre}.",
            dataStructure: "Create a simple {genre} implementation in Python.",
            utility: "Develop a basic Python script for {genre}.",
          },
        },
        intermediate: {
          javascript: {
            algorithm: "Implement an intermediate {genre} algorithm in JavaScript.",
            dataStructure: "Create an advanced {genre} structure in JavaScript.",
            utility: "Write a JavaScript utility handling {genre} efficiently.",
          },
          python: {
            algorithm: "Write a Python implementation for an intermediate {genre}.",
            dataStructure: "Develop an optimized {genre} data structure in Python.",
            utility: "Create a Python utility function handling {genre}.",
          },
        },
        expert: {
          javascript: {
            algorithm: "Develop a complex JavaScript algorithm for {genre}.",
            dataStructure: "Implement an expert-level {genre} in JavaScript.",
            utility: "Create an advanced JavaScript utility function for {genre}.",
          },
          python: {
            algorithm: "Implement an advanced {genre} algorithm in Python.",
            dataStructure: "Develop an optimized Python structure for {genre}.",
            utility: "Write a sophisticated Python utility for {genre}.",
          },
        },
      },
    };

    let baseTemplate = templates[type]?.[level];
    if (type === "code" && language) {
      baseTemplate = baseTemplate?.[language]?.[genre];
    } else {
      baseTemplate = baseTemplate?.[genre] || baseTemplate?.general;
    }

    return baseTemplate ? baseTemplate.replace("{genre}", genre) : null;
  }

  // Content generation method
  static async generateContent(req, res) {
    try {
      const { type = "paragraph", level = "intermediate", language = null, genre } = req.body;

      // Validate input
      const validTypes = ["paragraph", "code"];
      const validLevels = ["beginner", "intermediate", "expert"];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid content type" });
      }
      if (!validLevels.includes(level)) {
        return res.status(400).json({ error: "Invalid difficulty level" });
      }
      if (type === "code" && !language) {
        return res.status(400).json({ error: "Language is required for code generation" });
      }
      if (type === "code" && !["javascript", "python"].includes(language)) {
        return res.status(400).json({ error: "Invalid programming language" });
      }

      // Validate genre
      const availableGenres = ContentGeneratorController.getAvailableGenres(type, language);
      if (!availableGenres.includes(genre)) {
        return res.status(400).json({ error: "Invalid genre for the selected type" });
      }

      // Get prompt template
      const prompt = ContentGeneratorController._getPromptTemplate(type, level, language, genre);
      if (!prompt) {
        return res.status(500).json({ error: "Failed to generate prompt template" });
      }

      // API call to LLM
      const response = await axios.post(
        process.env.LLM_API_ENDPOINT,
        {
          model: process.env.LLM_MODEL,
          messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: type === "code" ? 500 : 300,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.LLM_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract generated content
      const generatedContent = response.data.choices[0]?.message?.content?.trim();

      res.json({
        content: generatedContent,
        type,
        level,
        language: type === "code" ? language : undefined,
        genre,
      });
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({
        error: "Failed to generate content",
        details: error.response ? error.response.data : error.message,
      });
    }
  }
}

module.exports = ContentGeneratorController;
