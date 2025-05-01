const express = require("express");
const router = express.Router();
const { Room } = require("../models/room");
const auth = require("../middleware/auth");

// Create a new room
router.post("/create", auth, async (req, res) => {
  try {
    const { hostId, hostName } = req.body;
    
    if (!hostId || !hostName) {
      return res.status(400).json({ message: "Host ID and name are required" });
    }
    
    const room = await Room.createRoom(hostId, hostName);
    
    res.status(201).json({ 
      roomCode: room.roomCode,
      hostId: room.hostId,
      status: room.status,
      players: room.players
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get room details by code
router.get("/:roomCode", async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode });
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    res.status(200).json({
      roomCode: room.roomCode,
      hostId: room.hostId,
      status: room.status,
      players: room.players,
      createdAt: room.createdAt
    });
  } catch (error) {
    console.error("Error getting room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Join a room
router.post("/:roomCode/join", auth, async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { playerId, playerName } = req.body;
    
    if (!playerId || !playerName) {
      return res.status(400).json({ message: "Player ID and name are required" });
    }
    
    const room = await Room.findOne({ roomCode });
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    // Check if room is full
    if (room.players.length >= 2) {
      return res.status(400).json({ message: "Room is full" });
    }
    
    // Check if player is already in the room
    const playerExists = room.players.find(p => p.id === playerId);
    if (!playerExists) {
      // Add player to room
      room.players.push({
        id: playerId,
        name: playerName,
        isHost: false
      });
      
      await room.save();
    }
    
    res.status(200).json({
      roomCode: room.roomCode,
      hostId: room.hostId,
      status: room.status,
      players: room.players
    });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get active rooms (optional, for room discovery)
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.getActiveRooms();
    
    res.status(200).json(rooms.map(room => ({
      roomCode: room.roomCode,
      hostName: room.hostName,
      playerCount: room.players.length,
      status: room.status,
      createdAt: room.createdAt
    })));
  } catch (error) {
    console.error("Error getting active rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;