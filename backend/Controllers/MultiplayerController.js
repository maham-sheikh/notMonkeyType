const {
  MultiplayerRoom,
  PlayerPerformance,
  ROOM_STATUS,
  validatePerformanceUpdate,
  updatePlayerPerformance,
  getRoomWithPerformances
} = require("../models/MultiplayerSessionModel");
const { User } = require("../models/user");

class MultiplayerController {
//update
  static async updatePerformance(req, res) {
    try {
      const { error } = validatePerformanceUpdate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const performance = await updatePlayerPerformance(req.body);

      res.json({
        message: "Performance updated successfully",
        performance: {
          userId: performance.userId,
          progress: performance.progress,
          wpm: performance.wpm,
          accuracy: performance.accuracy,
          score: performance.score,
          finishedAt: performance.finishedAt
        }
      });
    } catch (error) {
      console.error("Error in updatePerformance:", error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        error: "Failed to update performance",
        details: error.message
      });
    }
  }
  

  // Save final player score
  static async saveFinalScore(req, res) {
    try {
      const { error } = validatePerformanceUpdate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { roomId, userId, wpm, accuracy, score } = req.body;
      
      // Find the player's performance record
      let performance = await PlayerPerformance.findOne({ roomId, userId });
      
      if (!performance) {
        console.log(`Creating new performance record for userId: ${userId} in room: ${roomId}`);
        // Verify the room exists
        const room = await MultiplayerRoom.findOne({ roomId });
        if (!room) {
          return res.status(404).json({ error: 'Room not found' });
        }
        
        // Get user email
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        // Create new performance record
        performance = new PlayerPerformance({
          roomId,
          userId,
          email: user.email,
          isHost: room.hostId.toString() === userId,
          progress: 100,
          wpm,
          accuracy,
          score,
          finishedAt: new Date()
        });
      } else {
        // Update existing performance
        performance.progress = 100;
        performance.wpm = wpm;
        performance.accuracy = accuracy;
        performance.score = score;
        performance.finishedAt = new Date();
      }
      
      await performance.save();
      
      // Check if all players finished and update room status if needed
      const allPerformances = await PlayerPerformance.find({ roomId });
      const allFinished = allPerformances.length > 1 && allPerformances.every(p => p.finishedAt);
      
      if (allFinished) {
        await MultiplayerRoom.findOneAndUpdate(
          { roomId },
          { 
            status: ROOM_STATUS.COMPLETED,
            endedAt: new Date()
          },
          { new: true }
        );
      }
      
      res.json({
        message: 'Final score saved successfully',
        performance: {
          userId: performance.userId,
          wpm: performance.wpm,
          accuracy: performance.accuracy,
          score: performance.score,
          finishedAt: performance.finishedAt
        }
      });
    } catch (error) {
      console.error('Error saving final score:', error);
      res.status(500).json({
        error: 'Failed to save final score',
        details: error.message
      });
    }
  }

  // Get room details (useful for retrieving player scores)
  static async getRoomDetails(req, res) {
    try {
      const { roomId } = req.params;
      const roomData = await getRoomWithPerformances(roomId);

      // Format the response data
      const response = {
        roomId: roomData.room.roomId,
        status: roomData.room.status,
        players: await Promise.all(roomData.performances.map(async (perf) => {
          const user = await User.findById(perf.userId);
          return {
            userId: perf.userId,
            name: user ? `${user.firstName} ${user.lastName}` : "Unknown Player",
            isHost: perf.isHost,
            progress: perf.progress,
            wpm: perf.wpm,
            accuracy: perf.accuracy,
            score: perf.score,
            finishedAt: perf.finishedAt
          };
        }))
      };

      res.json(response);
    } catch (error) {
      console.error("Error in getRoomDetails:", error);
      res.status(error.message.includes("not found") ? 404 : 500).json({
        error: "Failed to get room details",
        details: error.message
      });
    }
  }


static async getUserMultiplayerStats(req, res) {
  try {
    console.log('Entering getUserMultiplayerStats');
    console.log('Request body:', req.body);
    const { userId } = req.body; 
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get all user performances (completed games)
    const userPerformances = await PlayerPerformance.find({ 
      userId,
      finishedAt: { $ne: null }
    });
    
    if (userPerformances.length === 0) {
      return res.json({
        summary: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winRate: 0,
          averageWpm: 0,
          averageAccuracy: 0,
          bestWpm: 0,
          bestAccuracy: 0
        },
        recentGames: [],
        opponents: [],
        performanceByLevel: {},
        performanceByContentType: {}
      });
    }
    
    // Get room IDs where this user has played
    const roomIds = userPerformances.map(p => p.roomId);
    
    // Get completed room details
    const rooms = await MultiplayerRoom.find({
      roomId: { $in: roomIds },
      status: ROOM_STATUS.COMPLETED
    });
    
    // Get all performances in these rooms to calculate outcomes
    const allRoomPerformances = await PlayerPerformance.find({
      roomId: { $in: roomIds },
      finishedAt: { $ne: null }
    });
    
    // Group performances by room for easier processing
    const performancesByRoom = {};
    allRoomPerformances.forEach(perf => {
      if (!performancesByRoom[perf.roomId]) {
        performancesByRoom[perf.roomId] = [];
      }
      performancesByRoom[perf.roomId].push(perf);
    });
    
    // Calculate game outcomes and stats
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let totalWpm = 0;
    let totalAccuracy = 0;
    let bestWpm = 0;
    let bestAccuracy = 0;
    
    // Track unique opponents and their data
    const opponents = new Map();
    
    // Track performance by content type and level
    const performanceByContentType = {};
    const performanceByLevel = {};
    
    // Process each room to calculate statistics
    const gameResults = rooms.map(room => {
      const userPerf = userPerformances.find(p => p.roomId === room.roomId);
      const roomPerfs = performancesByRoom[room.roomId] || [];
      const opponentPerf = roomPerfs.find(p => p.userId.toString() !== userId);
      
      // Track WPM and accuracy stats
      totalWpm += userPerf.wpm;
      totalAccuracy += userPerf.accuracy;
      bestWpm = Math.max(bestWpm, userPerf.wpm);
      bestAccuracy = Math.max(bestAccuracy, userPerf.accuracy);
      
      // Determine game outcome
      let outcome = 'unknown';
      if (opponentPerf) {
        if (userPerf.score > opponentPerf.score) {
          outcome = 'win';
          wins++;
        } else if (userPerf.score < opponentPerf.score) {
          outcome = 'loss';
          losses++;
        } else {
          outcome = 'tie';
          ties++;
        }
        
        // Track opponent stats
        const opponentId = opponentPerf.userId.toString();
        if (!opponents.has(opponentId)) {
          opponents.set(opponentId, {
            userId: opponentId,
            games: 0,
            wins: 0,
            losses: 0,
            ties: 0
          });
        }
        
        const opponentStats = opponents.get(opponentId);
        opponentStats.games++;
        if (outcome === 'win') opponentStats.wins++;
        if (outcome === 'loss') opponentStats.losses++;
        if (outcome === 'tie') opponentStats.ties++;
      }
      
      // Track performance by content type
      const contentType = room.contentConfig.type;
      if (!performanceByContentType[contentType]) {
        performanceByContentType[contentType] = {
          games: 0,
          averageWpm: 0,
          averageAccuracy: 0,
          totalWpm: 0,
          totalAccuracy: 0
        };
      }
      performanceByContentType[contentType].games++;
      performanceByContentType[contentType].totalWpm += userPerf.wpm;
      performanceByContentType[contentType].totalAccuracy += userPerf.accuracy;
      
      // Track performance by level
      const level = room.contentConfig.level;
      if (!performanceByLevel[level]) {
        performanceByLevel[level] = {
          games: 0,
          averageWpm: 0,
          averageAccuracy: 0,
          totalWpm: 0,
          totalAccuracy: 0
        };
      }
      performanceByLevel[level].games++;
      performanceByLevel[level].totalWpm += userPerf.wpm;
      performanceByLevel[level].totalAccuracy += userPerf.accuracy;
      
      // Return game result with details
      return {
        roomId: room.roomId,
        date: room.endedAt || userPerf.finishedAt,
        contentType: room.contentConfig.type,
        level: room.contentConfig.level,
        genre: room.contentConfig.genre,
        outcome,
        playerPerformance: {
          wpm: userPerf.wpm,
          accuracy: userPerf.accuracy,
          score: userPerf.score
        },
        opponentPerformance: opponentPerf ? {
          userId: opponentPerf.userId.toString(),
          wpm: opponentPerf.wpm,
          accuracy: opponentPerf.accuracy,
          score: opponentPerf.score
        } : null
      };
    });
    
    // Calculate averages for content types and levels
    Object.values(performanceByContentType).forEach(stats => {
      if (stats.games > 0) {
        stats.averageWpm = Math.round(stats.totalWpm / stats.games);
        stats.averageAccuracy = Math.round(stats.totalAccuracy / stats.games);
      }
    });
    
    Object.values(performanceByLevel).forEach(stats => {
      if (stats.games > 0) {
        stats.averageWpm = Math.round(stats.totalWpm / stats.games);
        stats.averageAccuracy = Math.round(stats.totalAccuracy / stats.games);
      }
    });
    
    // Enrich opponent data with user details
    const opponentDetailPromises = Array.from(opponents.entries()).map(async ([opponentId, stats]) => {
      const opponentUser = await User.findById(opponentId);
      return {
        ...stats,
        name: opponentUser ? `${opponentUser.firstName} ${opponentUser.lastName}` : "Unknown Player",
        winRate: stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0
      };
    });
    
    const opponentDetails = await Promise.all(opponentDetailPromises);
    
    // Sort games by date (most recent first)
    gameResults.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get 10 most recent games
    const recentGames = gameResults.slice(0, 10);
    
    // Return comprehensive stats
    res.json({
      summary: {
        totalGames: gameResults.length,
        wins,
        losses,
        ties,
        winRate: gameResults.length > 0 ? Math.round((wins / gameResults.length) * 100) : 0,
        averageWpm: gameResults.length > 0 ? Math.round(totalWpm / gameResults.length) : 0,
        averageAccuracy: gameResults.length > 0 ? Math.round(totalAccuracy / gameResults.length) : 0,
        bestWpm,
        bestAccuracy,
        userName: `${user.firstName} ${user.lastName}`
      },
      recentGames,
      opponents: opponentDetails.sort((a, b) => b.games - a.games),
      performanceByLevel,
      performanceByContentType,
      allGames: gameResults
    });
  } catch (error) {
    console.error("Error in getUserMultiplayerStats:", error);
    res.status(500).json({
      error: "Failed to retrieve multiplayer statistics",
      details: error.message
    });
  }
}

  
}

module.exports = MultiplayerController;