const mongoose = require("mongoose");
const Joi = require("joi");
const ContentGeneratorController = require("../Controllers/ContentGeneratorController");


// Status constants for better readability
const ROOM_STATUS = {
  WAITING: 'waiting',   // Room created, waiting for second player
  ACTIVE: 'active',     // Both players joined, game in progress
  COMPLETED: 'completed', // Game finished
  CANCELLED: 'cancelled'  // Room closed without completion
};

const multiplayerRoomSchema = new mongoose.Schema({
  roomId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  hostId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  guestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },
  status: { 
    type: String, 
    enum: Object.values(ROOM_STATUS),
    default: ROOM_STATUS.WAITING 
  },
  contentConfig: {
    type: { 
      type: String, 
      enum: ["paragraph", "code"], 
      default: "paragraph" 
    },
    level: { 
      type: String, 
      enum: ["beginner", "intermediate", "expert"], 
      default: "intermediate" 
    },
    language: { 
      type: String, 
      enum: [null, "javascript", "python"], 
      default: null 
    },
    genre: { 
      type: String, 
      required: true 
    }
  },
  generatedContent: { 
    type: String,
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // Automatically delete rooms after 24 hours
  },
  startedAt: { 
    type: Date, 
    default: null 
  },
  endedAt: { 
    type: Date, 
    default: null 
  }
});

// Player performance schema for tracking individual stats during the multiplayer session
const playerPerformanceSchema = new mongoose.Schema({
  roomId: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  progress: { 
    type: Number, 
    default: 0,     // Percentage of text completed (0-100)
    min: 0,
    max: 100 
  },
  wpm: { 
    type: Number, 
    default: 0 
  },
  accuracy: { 
    type: Number, 
    default: 0 
  },
  score: { 
    type: Number, 
    default: 0 
  },
  isHost: { 
    type: Boolean, 
    required: true 
  },
  finishedAt: { 
    type: Date, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for efficient queries
multiplayerRoomSchema.index({ roomId: 1 });
multiplayerRoomSchema.index({ hostId: 1 });
multiplayerRoomSchema.index({ status: 1 });
playerPerformanceSchema.index({ roomId: 1 });
playerPerformanceSchema.index({ userId: 1 });

const MultiplayerRoom = mongoose.models.MultiplayerRoom || mongoose.model("MultiplayerRoom", multiplayerRoomSchema);
const PlayerPerformance = mongoose.models.PlayerPerformance || mongoose.model("PlayerPerformance", playerPerformanceSchema);

// Validation functions
const validateRoomCreation = (data) => {
  const schema = Joi.object({
    hostId: Joi.string().required().label("Host ID"),
    contentConfig: Joi.object({
      type: Joi.string().valid("paragraph", "code").default("paragraph").label("Content Type"),
      level: Joi.string().valid("beginner", "intermediate", "expert").default("intermediate").label("Difficulty Level"),
      language: Joi.string().valid("javascript", "python", null).label("Programming Language"),
      genre: Joi.string().required().label("Genre")
    }).required().label("Content Configuration")
  });
  return schema.validate(data);
};

const validateJoinRoom = (data) => {
  const schema = Joi.object({
    roomId: Joi.string().required().label("Room ID"),
    guestId: Joi.string().required().label("Guest ID")
  });
  return schema.validate(data);
};

const validatePerformanceUpdate = (data) => {
  const schema = Joi.object({
    roomId: Joi.string().required().label("Room ID"),
    userId: Joi.string().required().label("User ID"),
    progress: Joi.number().min(0).max(100).label("Progress"),
    wpm: Joi.number().min(0).label("Words Per Minute"),
    accuracy: Joi.number().min(0).max(100).label("Accuracy"),
    score: Joi.number().min(0).label("Score")
  });
  return schema.validate(data);
};

// Helper methods
const generateRoomId = () => {
  // Generate a 6-character alphanumeric room ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getAvailableGenres = (type, language = null) => {
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
};


// Create a new multiplayer room
const createRoom = async (hostId, email, contentConfig) => {
  try {
    // Generate unique room ID
    let roomId;
    let isUnique = false;
    
    while (!isUnique) {
      roomId = generateRoomId();
      const existingRoom = await MultiplayerRoom.findOne({ roomId });
      if (!existingRoom) {
        isUnique = true;
      }
    }
    
    // Validate the genre for the given content type and language
    const availableGenres = getAvailableGenres(
      contentConfig.type, 
      contentConfig.language
    );
    
    if (!availableGenres.includes(contentConfig.genre)) {
      throw new Error("Invalid genre for the selected content type and language");
    }
    
    // Generate the content based on the configuration
    const generatedContent = await generateContent(contentConfig);
    
    // Create the room
    const room = new MultiplayerRoom({
      roomId,
      hostId,
      contentConfig,
      generatedContent,
      status: ROOM_STATUS.WAITING
    });
    
    await room.save();
    
    // Create initial player performance record for host
    const hostPerformance = new PlayerPerformance({
      roomId,
      userId: hostId,
      email,
      isHost: true
    });
    
    await hostPerformance.save();
    
    return room;
  } catch (error) {
    console.error("Error creating multiplayer room:", error);
    throw error;
  }
};

// Generate content for the room using ContentGeneratorController
const generateContent = async (contentConfig) => {
  try {
    // Create mock request and response objects to use with ContentGeneratorController
    const req = {
      body: {
        type: contentConfig.type,
        level: contentConfig.level,
        language: contentConfig.language,
        genre: contentConfig.genre
      }
    };
    
    let content = null;
    
    const res = {
      status: () => ({
        json: (data) => {
          console.error("Content generation error:", data.error);
          throw new Error(data.error);
        }
      }),
      json: (data) => {
        content = data.content;
      }
    };
    
    await ContentGeneratorController.generateContent(req, res);
    
    return content;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};

// Join an existing room
const joinRoom = async (roomId, guestId, email) => {
  try {
    const room = await MultiplayerRoom.findOne({ roomId });
    
    if (!room) {
      throw new Error("Room not found");
    }
    
    if (room.status !== ROOM_STATUS.WAITING) {
      throw new Error("Room is not available for joining");
    }
    
    if (room.hostId.toString() === guestId.toString()) {
      throw new Error("Cannot join your own room");
    }
    
    // Update room status
    room.guestId = guestId;
    room.status = ROOM_STATUS.ACTIVE;
    room.startedAt = new Date();
    
    await room.save();
    
    // Create player performance record for guest
    const guestPerformance = new PlayerPerformance({
      roomId,
      userId: guestId,
      email,
      isHost: false
    });
    
    await guestPerformance.save();
    
    return room;
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
};

// Update player performance
const updatePlayerPerformance = async (performanceData) => {
  try {
    const { roomId, userId, progress, wpm, accuracy, score } = performanceData;
    
    // Find the player's performance record
    const performance = await PlayerPerformance.findOne({ roomId, userId });
    
    if (!performance) {
      throw new Error("Player performance record not found");
    }
    
    // Update the fields
    if (progress !== undefined) performance.progress = progress;
    if (wpm !== undefined) performance.wpm = wpm;
    if (accuracy !== undefined) performance.accuracy = accuracy;
    if (score !== undefined) performance.score = score;
    
    // Mark as finished if progress is 100%
    if (progress === 100 && !performance.finishedAt) {
      performance.finishedAt = new Date();
      
      // Check if both players have finished
      const allPerformances = await PlayerPerformance.find({ roomId });
      const allFinished = allPerformances.every(p => p.finishedAt);
      
      if (allFinished) {
        // Mark the room as completed
        await MultiplayerRoom.updateOne(
          { roomId }, 
          { 
            status: ROOM_STATUS.COMPLETED,
            endedAt: new Date()
          }
        );
      }
    }
    
    await performance.save();
    return performance;
  } catch (error) {
    console.error("Error updating player performance:", error);
    throw error;
  }
};

// Get room details with player performances
const getRoomWithPerformances = async (roomId) => {
  try {
    const room = await MultiplayerRoom.findOne({ roomId });
    
    if (!room) {
      throw new Error("Room not found");
    }
    
    const performances = await PlayerPerformance.find({ roomId });
    
    return {
      room,
      performances
    };
  } catch (error) {
    console.error("Error fetching room with performances:", error);
    throw error;
  }
};

// Get active rooms for a user (either as host or guest)
const getActiveRoomsForUser = async (userId) => {
  try {
    const rooms = await MultiplayerRoom.find({
      $or: [
        { hostId: userId },
        { guestId: userId }
      ],
      status: { $in: [ROOM_STATUS.WAITING, ROOM_STATUS.ACTIVE] }
    }).sort({ createdAt: -1 });
    
    return rooms;
  } catch (error) {
    console.error("Error fetching active rooms for user:", error);
    throw error;
  }
};

// Cancel a room (only host can cancel)
const cancelRoom = async (roomId, userId) => {
  try {
    const room = await MultiplayerRoom.findOne({ roomId });
    
    if (!room) {
      throw new Error("Room not found");
    }
    
    if (room.hostId.toString() !== userId.toString()) {
      throw new Error("Only the host can cancel the room");
    }
    
    if (room.status === ROOM_STATUS.COMPLETED) {
      throw new Error("Cannot cancel a completed room");
    }
    
    room.status = ROOM_STATUS.CANCELLED;
    room.endedAt = new Date();
    
    await room.save();
    return room;
  } catch (error) {
    console.error("Error cancelling room:", error);
    throw error;
  }
};

// Get completed game history for a user
const getCompletedGamesForUser = async (userId) => {
  try {
    const performances = await PlayerPerformance.find({ 
      userId,
      finishedAt: { $ne: null }
    }).sort({ createdAt: -1 });
    
    const roomIds = performances.map(p => p.roomId);
    
    const rooms = await MultiplayerRoom.find({
      roomId: { $in: roomIds },
      status: ROOM_STATUS.COMPLETED
    });
    
    // Combine data for completed games
    const completedGames = await Promise.all(performances.map(async (perf) => {
      const room = rooms.find(r => r.roomId === perf.roomId);
      
      if (!room) return null;
      
      // Get opponent's performance
      const opponentPerf = await PlayerPerformance.findOne({
        roomId: perf.roomId,
        userId: { $ne: userId }
      });
      
      return {
        roomId: perf.roomId,
        date: room.endedAt || perf.finishedAt,
        contentType: room.contentConfig.type,
        level: room.contentConfig.level,
        genre: room.contentConfig.genre,
        playerPerformance: {
          wpm: perf.wpm,
          accuracy: perf.accuracy,
          score: perf.score
        },
        opponentPerformance: opponentPerf ? {
          wpm: opponentPerf.wpm,
          accuracy: opponentPerf.accuracy,
          score: opponentPerf.score
        } : null,
        won: opponentPerf ? perf.score > opponentPerf.score : false,
        isHost: perf.isHost
      };
    }));
    
    // Filter out nulls and sort by date
    return completedGames.filter(Boolean).sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error("Error fetching completed games for user:", error);
    throw error;
  }
};

module.exports = {
  MultiplayerRoom,
  PlayerPerformance,
  ROOM_STATUS,
  validateRoomCreation,
  validateJoinRoom,
  validatePerformanceUpdate,
  createRoom,
  joinRoom,
  updatePlayerPerformance,
  getRoomWithPerformances,
  getActiveRoomsForUser,
  cancelRoom,
  getCompletedGamesForUser
};