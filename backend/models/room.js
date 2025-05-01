const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  hostId: {
    type: String,
    required: true
  },
  hostName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'countdown', 'playing', 'completed'],
    default: 'waiting'
  },
  players: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    socketId: String,
    isHost: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Automatically delete rooms after 1 hour
  }
});

// Static method to create a room
roomSchema.statics.createRoom = async function(hostId, hostName) {
  // Generate a random room code (3-digit number)
  const roomCode = Math.floor(100 + Math.random() * 900).toString();
  
  // Check if room code already exists
  const existingRoom = await this.findOne({ roomCode });
  if (existingRoom) {
    // Try again with a different code
    return this.createRoom(hostId, hostName);
  }
  
  // Create and return the new room
  return this.create({
    roomCode,
    hostId,
    hostName,
    players: [{
      id: hostId,
      name: hostName,
      isHost: true
    }]
  });
};

// Static method to get active rooms
roomSchema.statics.getActiveRooms = function() {
  return this.find({ status: { $ne: 'completed' } })
    .sort({ createdAt: -1 })
    .limit(10);
};

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room };