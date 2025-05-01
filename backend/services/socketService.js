const socketIO = require('socket.io');
const {
  MultiplayerRoom,
  PlayerPerformance,
  ROOM_STATUS,
  updatePlayerPerformance
} = require('../models/MultiplayerSessionModel');
const { User } = require('../models/user');

/**
 * Initialize and configure socket service
 * @param {Object} server - HTTP/Express server
 * @returns {Object} - Socket.io instance
 */
const initSocketService = (server) => {
  // Initialize socket.io with configuration
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    maxHttpBufferSize: 1e8, // 100 MB
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Create multiplayer namespace
  const multiplayer = io.of('/multiplayer');
  
  // Tracking structures
  const userSockets = new Map(); // userId -> Set of socketIds
  const roomUsers = new Map();   // roomId -> Map of userId -> {socketId, userData}
  const socketData = new Map();  // socketId -> {userId, currentRoomId, userData}

  // Middleware for connection logging and setup
  multiplayer.use((socket, next) => {
    console.log(`Socket connection attempt: ${socket.id}`);
    socketData.set(socket.id, {
      userId: null,
      currentRoomId: null,
      userData: null,
      authenticated: false
    });
    next();
  });

  // Handle connections
  multiplayer.on('connection', handleSocketConnection);

  /**
   * Main socket connection handler
   * @param {Object} socket - Socket.io socket
   */
  function handleSocketConnection(socket) {
    console.log(`Socket connected: ${socket.id}`);

    // Register event handlers
    registerAuthHandlers(socket);
    registerRoomHandlers(socket);
    registerGameHandlers(socket);
    registerUtilityHandlers(socket);
    
    // Handle disconnection
    socket.on('disconnect', () => handleDisconnect(socket));
  }

  /**
   * Register authentication related handlers
   * @param {Object} socket - Socket.io socket
   */
  function registerAuthHandlers(socket) {
    socket.on('authenticate', async ({ userId }) => {
      try {
        if (!userId) {
          socket.emit('error', { message: 'Authentication failed: User ID is required' });
          return;
        }

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
          socket.emit('error', { message: 'Authentication failed: User not found' });
          return;
        }

        // Store user data
        const userData = {
          userId: user._id.toString(),
          userName: `${user.firstName} ${user.lastName}`,
          email: user.email
        };

        // Update tracking
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        
        // Update socket data
        socketData.set(socket.id, {
          ...socketData.get(socket.id),
          userId,
          userData,
          authenticated: true
        });

        console.log(`User authenticated: ${userData.userName} (${userId})`);
        socket.emit('authenticated', { 
          userId: userData.userId,
          userName: userData.userName 
        });
        
        // Check for active rooms to rejoin
        const activeRooms = await findActiveRoomsForUser(userId);
        if (activeRooms.length > 0) {
          socket.emit('active-rooms-available', {
            rooms: activeRooms.map(room => ({
              roomId: room.roomId,
              status: room.status,
              createdAt: room.createdAt
            }))
          });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { message: 'Authentication failed: ' + error.message });
      }
    });
  }

  /**
   * Register room related handlers
   * @param {Object} socket - Socket.io socket
   */
  function registerRoomHandlers(socket) {
    // Join room
    socket.on('join-room', async ({ roomId, userId }) => {
      try {
        // Validate authentication
        const socketInfo = socketData.get(socket.id);
        if (!socketInfo || !socketInfo.authenticated || socketInfo.userId !== userId) {
          socket.emit('error', { message: 'Not authenticated or user ID mismatch' });
          return;
        }

        // Get room and check if it exists
        const room = await MultiplayerRoom.findOne({ roomId });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Handle player joining
        const result = await handlePlayerJoiningRoom(socket, room, userId, socketInfo);
        if (!result) return;
        
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room: ' + error.message });
      }
    });

    // Room configuration
    socket.on('room-configuration', async (config) => {
      try {
        const { roomCode, type, level, language, genre, testDuration } = config;
        const socketInfo = socketData.get(socket.id);
        
        if (!socketInfo || !socketInfo.authenticated) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Verify room exists
        const room = await MultiplayerRoom.findOne({ roomId: roomCode });
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Verify user is host
        const performance = await PlayerPerformance.findOne({ 
          roomId: roomCode, 
          userId: socketInfo.userId 
        });
        
        if (!performance || !performance.isHost) {
          socket.emit('error', { message: 'Only the host can configure the room' });
          return;
        }

        // Update room configuration
        const contentConfig = {
          type: type || 'paragraph',
          level: level || 'intermediate',
          language: language || null,
          genre: genre || 'general',
          testDuration: testDuration || 10
        };

        // Generate content based on config
        const generatedContent = generateTestContent(contentConfig);

        // Update room
        const updatedRoom = await MultiplayerRoom.findOneAndUpdate(
          { roomId: roomCode },
          { contentConfig, generatedContent },
          { new: true }
        );

        // Notify all clients in the room
        multiplayer.to(roomCode).emit('room-updated', {
          roomId: roomCode,
          contentConfig,
          generatedContent: updatedRoom.generatedContent
        });
      } catch (error) {
        console.error('Room configuration error:', error);
        socket.emit('error', { message: 'Failed to configure room: ' + error.message });
      }
    });
  }

  /**
   * Register game related handlers
   * @param {Object} socket - Socket.io socket
   */
  function registerGameHandlers(socket) {
    // Host starts match
   // Also improve host-start-match handler for direct start
socket.on('host-start-match', async ({ roomId, userId, clientTimestamp }, callback) => {
  try {
    console.log(`Host ${userId} starting match in room ${roomId}`);
    
    // Always acknowledge receipt
    if (typeof callback === 'function') {
      callback({ received: true, timestamp: Date.now() });
    }
    
    // Force game to start for all players
    const startTime = new Date().toISOString();
    console.log(`Broadcasting forced game-starting to all players in room ${roomId}`);
    
    multiplayer.to(roomId).emit('game-starting', {
      startTime,
      roomId,
      forced: true,
      hostId: userId,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Host start match error:', error);
    if (typeof callback === 'function') {
      callback({ error: 'Failed to start match', details: error.message });
    }
  }
});
    // Fallback mechanism for game start
    socket.on('simulate-game-start', (data) => {
      console.log("Received simulated game start", data);
      
      // Notify room that game is starting
      multiplayer.to(data.roomId).emit('game-starting', {
        startTime: new Date().toISOString(),
        simulated: true
      });
    });

    // Peer notification (fallback communication)
    socket.on('peer-notification', (data) => {
      console.log('Received peer notification:', data);
      
      // Route game-starting events
      if (data.eventType === 'game-starting') {
        multiplayer.to(data.roomId).emit('game-starting', data.payload);
      }
    });

    // Player ready status
   socket.on('player-ready', async ({ roomId, userId }) => {
  try {
    console.log(`Player ${userId} is ready in room ${roomId}`);
    
    const socketInfo = socketData.get(socket.id);
    if (!socketInfo || !socketInfo.authenticated || socketInfo.userId !== userId) {
      socket.emit('error', { message: 'Not authenticated or user ID mismatch' });
      return;
    }

    // Update player performance to ready
    await PlayerPerformance.findOneAndUpdate(
      { roomId, userId },
      { isReady: true },
      { new: true }
    );

    // Get all players in this room
    const performances = await PlayerPerformance.find({ roomId });
    console.log(`Room ${roomId} has ${performances.length} players, checking if all ready`);
    
    // At least 2 players and all marked as ready
    const allReady = performances.length > 1 && performances.every(p => p.isReady);
    
    // IMPORTANT: Broadcast to all clients that this player is ready
    // This ensures everyone knows the ready status
    multiplayer.to(roomId).emit('player-ready', { 
      userId,
      timestamp: Date.now()
    });
    
    if (allReady) {
      console.log(`All players ready in room ${roomId}, starting game`);
      
      // Update room status to active
      await MultiplayerRoom.findOneAndUpdate(
        { roomId },
        { 
          status: ROOM_STATUS.ACTIVE,
          startedAt: new Date()
        },
        { new: true }
      );

      // CRITICAL: Notify all clients that game is starting
      const startTime = new Date().toISOString();
      console.log(`Broadcasting game-starting to all players in room ${roomId} at ${startTime}`);
      
      multiplayer.to(roomId).emit('game-starting', {
        startTime,
        roomId,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Error setting player ready:', error);
    socket.emit('error', { message: 'Failed to set ready status: ' + error.message });
  }
});


    socket.on('game-starting', (data) => {
      console.log("GAME STARTING EVENT RECEIVED:", data);
      
      // Immediately notify all listeners
      if (listeners['game-starting']) {
        listeners['game-starting'].forEach(callback => {
          try {
            console.log("Executing game-starting callback");
            callback(data);
          } catch (error) {
            console.error(`Error in game-starting listener:`, error);
          }
        });
      }
    });
    

    // Update typing progress
    socket.on('update-progress', async ({ roomId, userId, progress, wpm, accuracy, score }) => {
      try {
        // Validate socket and user
        const socketInfo = socketData.get(socket.id);
        if (!socketInfo || !socketInfo.authenticated || socketInfo.userId !== userId) {
          socket.emit('error', { message: 'Not authenticated or user ID mismatch' });
          return;
        }

        // Update performance in database
        const performanceData = {
          roomId,
          userId,
          progress,
          wpm,
          accuracy,
          score
        };

        await updatePlayerPerformance(performanceData);
        
        // Broadcast progress to other players
        socket.to(roomId).emit('opponent-progress', {
          userId,
          progress,
          wpm,
          accuracy,
          score,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating progress:', error);
        socket.emit('error', { message: 'Failed to update progress: ' + error.message });
      }
    });

    // Player finished typing
  // In socketService.js - player-finished event handler
  socket.on('player-finished', async ({ roomId, userId, finalStats }) => {
    try {
      console.log(`Player ${userId} finished in room ${roomId} with stats:`, finalStats);
      
      // Validate socket and user
      const socketInfo = socketData.get(socket.id);
      if (!socketInfo || !socketInfo.authenticated || socketInfo.userId !== userId) {
        socket.emit('error', { message: 'Not authenticated or user ID mismatch' });
        return;
      }
  
      // Verify the room exists
      const room = await MultiplayerRoom.findOne({ roomId });
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Get all performances to track both players
      const performances = await PlayerPerformance.find({ roomId });
      
      // Update the current player's performance
      let playerPerformance = performances.find(p => p.userId.toString() === userId);
      const { wpm, accuracy, score } = finalStats;
      
      if (!playerPerformance) {
        // Create new performance record if needed
        playerPerformance = new PlayerPerformance({
          roomId,
          userId,
          email: socketInfo.userData?.email || 'unknown',
          isHost: room.hostId.toString() === userId,
          progress: 100,
          wpm,
          accuracy,
          score,
          finishedAt: new Date()
        });
      } else {
        // Update existing performance
        playerPerformance.progress = 100;
        playerPerformance.wpm = wpm;
        playerPerformance.accuracy = accuracy;
        playerPerformance.score = score;
        playerPerformance.finishedAt = new Date();
      }
      
      // Save the current player's performance
      await playerPerformance.save();
      
      // Ensure opponent's partial progress is saved
      const opponentPerformance = performances.find(p => p.userId.toString() !== userId);
      if (opponentPerformance && !opponentPerformance.finishedAt) {
        await opponentPerformance.save();
      }
      
      // Now safely send the update to other players
      socket.to(roomId).emit('opponent-finished', {
        userId,
        wpm,
        accuracy,
        score,
        finishedAt: playerPerformance.finishedAt
      });
  
      // Check if all players finished and update room status
      await checkGameCompletion(roomId);
    } catch (error) {
      console.error('Error setting player finished:', error);
      socket.emit('error', { message: 'Failed to record completion: ' + error.message });
    }
  });

    // Rematch request/response handlers
    socket.on('request-rematch', async ({ roomId, userId }) => {
      try {
        // Validate socket and user
        const socketInfo = socketData.get(socket.id);
        if (!socketInfo || !socketInfo.authenticated || socketInfo.userId !== userId) {
          socket.emit('error', { message: 'Not authenticated or user ID mismatch' });
          return;
        }

        // Verify room is completed
        const room = await MultiplayerRoom.findOne({ roomId });
        if (!room || room.status !== ROOM_STATUS.COMPLETED) {
          socket.emit('error', { message: 'Cannot request rematch for this room' });
          return;
        }

        // Broadcast rematch request
        socket.to(roomId).emit('rematch-requested', { userId });
      } catch (error) {
        console.error('Request rematch error:', error);
        socket.emit('error', { message: 'Failed to request rematch: ' + error.message });
      }
    });

    socket.on('accept-rematch', async ({ roomId, userId, contentConfig }) => {
      try {
        // Validate socket and user
        const socketInfo = socketData.get(socket.id);
        if (!socketInfo || !socketInfo.authenticated || socketInfo.userId !== userId) {
          socket.emit('error', { message: 'Not authenticated or user ID mismatch' });
          return;
        }

        // Create new room for rematch
        await handleRematchCreation(roomId, userId, contentConfig);
      } catch (error) {
        console.error('Accept rematch error:', error);
        socket.emit('error', { message: 'Failed to create rematch: ' + error.message });
      }
    });

    socket.on('decline-rematch', ({ roomId, userId }) => {
      // Validate socket and user
      const socketInfo = socketData.get(socket.id);
      if (!socketInfo || !socketInfo.authenticated || socketInfo.userId !== userId) {
        socket.emit('error', { message: 'Not authenticated or user ID mismatch' });
        return;
      }
      
      // Broadcast decline
      socket.to(roomId).emit('rematch-declined', { userId });
    });
  }

  /**
   * Register utility handlers
   * @param {Object} socket - Socket.io socket
   */
  function registerUtilityHandlers(socket) {
    // Ping handler to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  }

  /**
   * Handle player joining a room
   * @param {Object} socket - Socket.io socket
   * @param {Object} room - Room document
   * @param {string} userId - User ID
   * @param {Object} socketInfo - Socket info from tracking
   * @returns {boolean} - Success or failure
   */
  async function handlePlayerJoiningRoom(socket, room, userId, socketInfo) {
    // Get all player performances
    const performances = await PlayerPerformance.find({ roomId: room.roomId });
    
    // Check if user is already in room
    let userPerformance = performances.find(p => p.userId.toString() === userId);
    
    // If not, try to add as guest
    if (!userPerformance) {
      // Check room availability
      if (room.status !== ROOM_STATUS.WAITING) {
        socket.emit('error', { message: 'Room is not available for joining' });
        return false;
      }
      
      if (performances.length >= 2) {
        socket.emit('error', { message: 'Room is already full' });
        return false;
      }
      
      // Create performance record
      try {
        userPerformance = new PlayerPerformance({
          roomId: room.roomId,
          userId,
          email: socketInfo.userData.email,
          isHost: false, // Joining as guest
          progress: 0,
          wpm: 0,
          accuracy: 100,
          score: 0
        });
        await userPerformance.save();
        
        // Update room with guest ID
        room.guestId = userId;
        await room.save();
      } catch (err) {
        socket.emit('error', { message: 'Failed to join room: ' + err.message });
        return false;
      }
    }

    // Leave previous room if any
    if (socketInfo.currentRoomId) {
      socket.leave(socketInfo.currentRoomId);
      
      // Update room tracking
      if (roomUsers.has(socketInfo.currentRoomId)) {
        const roomUserMap = roomUsers.get(socketInfo.currentRoomId);
        roomUserMap.delete(userId);
        
        if (roomUserMap.size === 0) {
          roomUsers.delete(socketInfo.currentRoomId);
        }
      }
    }

    // Join socket room
    socket.join(room.roomId);
    
    // Update tracking
    socketData.set(socket.id, {
      ...socketInfo,
      currentRoomId: room.roomId
    });
    
    if (!roomUsers.has(room.roomId)) {
      roomUsers.set(room.roomId, new Map());
    }
    
    roomUsers.get(room.roomId).set(userId, {
      socketId: socket.id,
      userData: socketInfo.userData,
      isHost: userPerformance.isHost
    });

    // Prepare player information
    const players = await getFormattedPlayers(room.roomId, userId);
    const currentPlayer = players.find(p => p.userId === userId);
    const opponent = players.find(p => p.userId !== userId);

    // Notify player they joined
    socket.emit('room-joined', {
      roomId: room.roomId,
      status: room.status,
      contentConfig: room.contentConfig,
      generatedContent: room.generatedContent,
      players,
      playerInfo: currentPlayer,
      opponentInfo: opponent || null,
      isHost: currentPlayer?.isHost || false
    });

    // Notify others in room
    socket.to(room.roomId).emit('player-joined', {
      userId,
      name: socketInfo.userData.userName,
      isHost: userPerformance.isHost
    });

    return true;
  }

  /**
   * Handle rematch creation
   * @param {string} originalRoomId - Original room ID
   * @param {string} userId - User ID of host for new room
   * @param {Object} contentConfig - Content configuration
   */
  async function handleRematchCreation(originalRoomId, userId, contentConfig) {
    // Verify room is completed
    const room = await MultiplayerRoom.findOne({ roomId: originalRoomId });
    if (!room || room.status !== ROOM_STATUS.COMPLETED) {
      throw new Error('Cannot accept rematch for this room');
    }

    // Get original players
    const performances = await PlayerPerformance.find({ roomId: originalRoomId });
    if (performances.length < 2) {
      throw new Error('Not enough players for rematch');
    }

    // Set host for new room
    const hostId = userId;
    
    // Create new room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Get host user
    const hostUser = await User.findById(hostId);
    if (!hostUser) {
      throw new Error('Host user not found');
    }
    
    // Generate content
    const finalConfig = contentConfig || room.contentConfig;
    const generatedContent = generateTestContent(finalConfig);
    
    // Create new room
    const newRoom = new MultiplayerRoom({
      roomId: newRoomId,
      hostId: hostId,
      hostEmail: hostUser.email,
      contentConfig: finalConfig,
      generatedContent,
      status: ROOM_STATUS.WAITING
    });
    await newRoom.save();
    
    // Create performance records for all players
    for (const perf of performances) {
      const user = await User.findById(perf.userId);
      if (!user) continue;
      
      await new PlayerPerformance({
        roomId: newRoomId,
        userId: perf.userId,
        email: user.email,
        isHost: perf.userId.toString() === hostId
      }).save();
    }
    
    // Notify all clients about new room
    multiplayer.to(originalRoomId).emit('rematch-created', {
      originalRoomId,
      newRoomId
    });
  }

  /**
   * Handle disconnect event
   * @param {Object} socket - Socket.io socket
   */
  async function handleDisconnect(socket) {
    const socketInfo = socketData.get(socket.id);
    if (!socketInfo) return;
    
    const { userId, currentRoomId } = socketInfo;
    console.log(`Socket disconnected: ${socket.id}, User: ${userId}`);
    
    if (userId) {
      // Update user socket tracking
      if (userSockets.has(userId)) {
        const userSocketSet = userSockets.get(userId);
        userSocketSet.delete(socket.id);
        
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
          
          // Handle room cleanup if this was user's last connection
          if (currentRoomId) {
            await handleUserDisconnectFromRoom(userId, currentRoomId);
          }
        }
      }
      
      // Update room tracking
      if (currentRoomId && roomUsers.has(currentRoomId)) {
        const roomUserMap = roomUsers.get(currentRoomId);
        roomUserMap.delete(userId);
        
        if (roomUserMap.size === 0) {
          roomUsers.delete(currentRoomId);
        } else {
          // Notify other users about disconnect
          multiplayer.to(currentRoomId).emit('player-disconnected', { 
            userId,
            name: socketInfo.userData?.userName || "Unknown Player"
          });
        }
      }
    }
    
    // Clean up socket data
    socketData.delete(socket.id);
  }

  /**
   * Handle user disconnection from room
   * @param {string} userId - User ID
   * @param {string} roomId - Room ID
   */
  async function handleUserDisconnectFromRoom(userId, roomId) {
    // Get room to check status
    const room = await MultiplayerRoom.findOne({ roomId });
    
    if (room) {
      // Only handle active or waiting rooms
      if (room.status === ROOM_STATUS.WAITING || room.status === ROOM_STATUS.ACTIVE) {
        // Check if user was host
        const performance = await PlayerPerformance.findOne({
          roomId,
          userId
        });
        
        if (performance && performance.isHost) {
          // Cancel room if host disconnects
          await MultiplayerRoom.findOneAndUpdate(
            { roomId },
            { status: ROOM_STATUS.CANCELLED },
            { new: true }
          );
          
          // Notify remaining players
          multiplayer.to(roomId).emit('game-cancelled', {
            reason: 'Host disconnected from the game'
          });
        } else if (room.status === ROOM_STATUS.ACTIVE) {
          // Cancel active game if any player disconnects
          await MultiplayerRoom.findOneAndUpdate(
            { roomId },
            { status: ROOM_STATUS.CANCELLED },
            { new: true }
          );
          
          // Notify remaining players
          multiplayer.to(roomId).emit('game-cancelled', {
            reason: 'Opponent disconnected'
          });
        }
      }
    }
  }

/**
 * Enhanced function to check if game is complete and update status
 * @param {string} roomId - Room ID
 */
async function checkGameCompletion(roomId) {
  try {
    // Get all performances
    const performances = await PlayerPerformance.find({ roomId });
    
    if (!performances || performances.length === 0) {
      console.log(`No performances found for room: ${roomId}`);
      return;
    }
    
    const allFinished = performances.length > 1 && performances.every(p => p.finishedAt);
    
    if (allFinished) {
      // Sort by score (highest first)
      performances.sort((a, b) => b.score - a.score);
      
      // Check for tie
      const isTie = performances.length > 1 && performances[0].score === performances[1].score;
      
      // Get winner ID
      const winnerId = isTie ? null : performances[0].userId.toString();
      
      // Update room status
      await MultiplayerRoom.findOneAndUpdate(
        { roomId },
        { 
          status: ROOM_STATUS.COMPLETED,
          endedAt: new Date(),
          winnerId
        },
        { new: true }
      );

      // Format player details
      const playerDetails = await Promise.all(performances.map(async (perf) => {
        const user = await User.findById(perf.userId);
        return {
          userId: perf.userId.toString(),
          name: user ? `${user.firstName} ${user.lastName}` : "Unknown Player",
          wpm: perf.wpm,
          accuracy: perf.accuracy,
          score: perf.score,
          finishedAt: perf.finishedAt
        };
      }));

      // Notify all clients
      multiplayer.to(roomId).emit('game-completed', {
        winnerId,
        isTie,
        performances: playerDetails
      });
      
      console.log(`Game completed in room ${roomId}, winner: ${winnerId || 'Tie'}`);
    }
  } catch (error) {
    console.error('Error checking game completion:', error);
  }
}

  /**
   * Get formatted player info
   * @param {string} roomId - Room ID
   * @param {string} currentUserId - Current user ID
   * @returns {Array} - Formatted player info
   */
  async function getFormattedPlayers(roomId, currentUserId) {
    const performances = await PlayerPerformance.find({ roomId });
    
    // Prepare player information
    const players = await Promise.all(performances.map(async (perf) => {
      const user = await User.findById(perf.userId);
      return {
        userId: perf.userId.toString(),
        name: user ? `${user.firstName} ${user.lastName}` : "Unknown Player",
        isHost: perf.isHost,
        progress: perf.progress || 0,
        wpm: perf.wpm || 0,
        accuracy: perf.accuracy || 100,
        score: perf.score || 0,
        isReady: perf.isReady || false
      };
    }));

    // Format players to identify current user
    return players.map(player => ({
      ...player,
      isCurrentUser: player.userId === currentUserId,
      displayName: player.userId === currentUserId ? 'You' : player.name
    }));
  }

  /**
   * Find active rooms for a user
   * @param {string} userId - User ID
   * @returns {Array} - Active rooms
   */
  async function findActiveRoomsForUser(userId) {
    try {
      // Find performances for this user
      const performances = await PlayerPerformance.find({ userId });
      if (!performances.length) return [];
      
      // Get roomIds
      const roomIds = performances.map(p => p.roomId);
      
      // Find active/waiting rooms
      const rooms = await MultiplayerRoom.find({
        roomId: { $in: roomIds },
        status: { $in: [ROOM_STATUS.WAITING, ROOM_STATUS.ACTIVE] }
      }).sort({ createdAt: -1 }); // Most recent first
      
      return rooms;
    } catch (error) {
      console.error('Error finding active rooms:', error);
      return [];
    }
  }

  /**
   * Generate test content based on configuration
   * @param {Object} config - Content configuration
   * @returns {string} - Generated content
   */
  function generateTestContent(config) {
    // This is a placeholder - in a real implementation, you would
    // generate content based on the config settings
    return `Sample text for ${config.type} typing test at ${config.level} level with ${config.genre} content.
This is placeholder text that would normally be generated based on the specific configuration settings.
The real content would include appropriate vocabulary and complexity based on the selected level.
For technical content, it might include terminology related to programming, science, or other specialized fields.
For creative content, it might include more descriptive language and narrative elements.`;
  }

  return io;
};

module.exports = { initSocketService };