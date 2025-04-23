import { io } from 'socket.io-client';
import baseURL from '../config';
import { getUserId } from './authService';

// Configuration
const SOCKET_URL = baseURL;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const PING_INTERVAL = 20000;

// Socket state
let socket = null;
let reconnectAttempts = 0;
let pingInterval = null;
let connectionStatus = {
  connected: false,
  authenticated: false,
  error: null
};

// Event listeners
const listeners = {
  'authenticated': new Set(),
  'error': new Set(),
  'room-joined': new Set(),
  'player-joined': new Set(),
  'opponent-ready': new Set(),
  'game-starting': new Set(),
  'opponent-progress': new Set(),
  'opponent-finished': new Set(),
  'game-completed': new Set(),
  'game-cancelled': new Set(),
  'player-disconnected': new Set(),
  'rematch-requested': new Set(),
  'rematch-created': new Set(),
  'rematch-declined': new Set(),
  'room-updated': new Set(),
  'active-rooms-available': new Set()
};

// Update connection status and notify listeners
const updateStatus = (updates) => {
  connectionStatus = { ...connectionStatus, ...updates };
  console.log('Socket connection status:', connectionStatus);
};

// Start sending periodic pings to keep connection alive
const startHeartbeat = () => {
  clearInterval(pingInterval);
  pingInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('ping', { timestamp: Date.now() });
    }
  }, PING_INTERVAL);
};

const SocketService = {
  // Connect to socket server
  connect: () => {
    // Clean up existing connection
    if (socket) {
      socket.off();
      socket.disconnect();
    }
    
    clearInterval(pingInterval);
    
    // Create new connection
    socket = io(`${SOCKET_URL}/multiplayer`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY,
      timeout: 10000
    });
    
    updateStatus({
      connected: false,
      authenticated: false,
      error: null
    });
    
    // Set up connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      reconnectAttempts = 0;
      updateStatus({ connected: true, error: null });
      
      // Authenticate automatically if user ID is available
      const userId = getUserId();
      if (userId) {
        socket.emit('authenticate', { userId });
      }
      
      startHeartbeat();
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      updateStatus({
        connected: false,
        error: `Connection error: ${error.message}`
      });
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      clearInterval(pingInterval);
      updateStatus({
        connected: false,
        authenticated: false
      });
    });
    
    socket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      updateStatus({ authenticated: true });
      
      // Notify authenticated listeners
      listeners.authenticated.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in authenticated listener:', error);
        }
      });
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      updateStatus({
        error: typeof error === 'string' ? error : 
               (error.message || 'Unknown error')
      });
      
      // Notify error listeners
      listeners.error.forEach(callback => {
        try {
          callback(error);
        } catch (err) {
          console.error('Error in error listener:', err);
        }
      });
    });
    
    // Set up game event handlers
    setupGameEventHandlers();
    
    return socket;
  },
  
  // Disconnect socket
  disconnect: () => {
    clearInterval(pingInterval);
    
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    updateStatus({
      connected: false,
      authenticated: false,
      error: null
    });
  },
  
  // Add event listener
  on: (event, callback) => {
    if (!listeners[event]) {
      listeners[event] = new Set();
    }
    
    listeners[event].add(callback);
    
    // Return unsubscribe function
    return () => {
      if (listeners[event]) {
        listeners[event].delete(callback);
      }
    };
  },
  
  // Join a room
  joinRoom: (roomId) => {
    if (!ensureConnection()) return false;
    
    const userId = getUserId();
    if (!userId) {
      console.error('Cannot join room: User ID not found');
      return false;
    }
    
    console.log(`Joining room ${roomId} as user ${userId}`);
    socket.emit('join-room', { roomId, userId });
    return true;
  },
  
  // Host starts the match
  hostStartMatch: (roomId) => {
    if (!ensureConnection()) return false;
    
    const userId = getUserId();
    console.log('Emitting host-start-match for room:', roomId);
    
    return new Promise((resolve, reject) => {
      // Add a timeout to detect if the server doesn't respond
      const timeout = setTimeout(() => {
        console.error('Server did not acknowledge host-start-match within 5 seconds');
        reject(new Error('Server timeout - no acknowledgment received'));
        
        // Try alternative approach as fallback
        socket.emit('simulate-game-start', { roomId, userId });
      }, 5000);
      
      socket.emit('host-start-match', { 
        roomId, 
        userId,
        clientTimestamp: Date.now() 
      }, (response) => {
        clearTimeout(timeout);
        console.log('host-start-match acknowledgment:', response);
        
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  },
  
  // Use peer notifications as fallback for sync
  notifyPeerDirectly: (roomId, eventType, data) => {
    if (!ensureConnection()) return false;
    
    console.log(`Sending direct peer notification: ${eventType}`);
    socket.emit('peer-notification', {
      roomId,
      userId: getUserId(),
      eventType,
      payload: data,
      timestamp: Date.now()
    });
    
    return true;
  },
  
  // Set player ready
  setPlayerReady: (roomId) => {
    if (!ensureConnection()) return false;
    
    const userId = getUserId();
    socket.emit('player-ready', { roomId, userId });
    return true;
  },
  
  // Update typing progress (with rate limiting)
  updateProgress: (() => {
    let lastUpdateTime = 0;
    const MIN_UPDATE_INTERVAL = 100; // ms
    
    return (roomId, progress, wpm, accuracy, score) => {
      if (!ensureConnection()) return false;
      
      const now = Date.now();
      if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
        return false; // Rate limit updates
      }
      
      lastUpdateTime = now;
      const userId = getUserId();
      socket.emit('update-progress', { 
        roomId, 
        userId, 
        progress, 
        wpm, 
        accuracy, 
        score 
      });
      return true;
    };
  })(),
  
  // Player finished typing
  playerFinished: (roomId, finalStats) => {
    if (!ensureConnection()) return false;
    
    const userId = getUserId();
    
    // Validate roomId before sending
    if (!roomId || roomId.trim() === '') {
      console.error('Cannot finish game: Invalid room ID');
      return false;
    }
    
    console.log(`Sending player-finished for room: ${roomId}`, finalStats);
    
    socket.emit('player-finished', { 
      roomId, 
      userId, 
      finalStats 
    });
    return true;
  },
  
  // Request rematch
  requestRematch: (roomId) => {
    if (!ensureConnection()) return false;
    
    const userId = getUserId();
    socket.emit('request-rematch', { roomId, userId });
    return true;
  },
  
  // Accept rematch
  acceptRematch: (roomId, contentConfig) => {
    if (!ensureConnection()) return false;
    
    const userId = getUserId();
    socket.emit('accept-rematch', { 
      roomId, 
      userId, 
      contentConfig 
    });
    return true;
  },
  
  // Decline rematch
  declineRematch: (roomId) => {
    if (!ensureConnection()) return false;
    
    const userId = getUserId();
    socket.emit('decline-rematch', { roomId, userId });
    return true;
  },
  
  // Configure room
  configureRoom: (roomCode, config) => {
    if (!ensureConnection()) return false;
    
    socket.emit('room-configuration', {
      roomCode,
      ...config
    });
    return true;
  },
  
  // Check connection status
  isConnected: () => {
    return socket && socket.connected;
  },
  
  // Get current connection status
  getStatus: () => {
    return { ...connectionStatus };
  },
  
  // Force manual ping
  ping: () => {
    if (socket && socket.connected) {
      socket.emit('ping', { timestamp: Date.now() });
      return true;
    }
    return false;
  }
};

// Helper function to ensure socket is connected
function ensureConnection() {
  if (!socket || !socket.connected) {
    console.warn('Socket not connected, attempting to reconnect...');
    SocketService.connect();
    return false;
  }
  return true;
}

// Setup game event handlers
function setupGameEventHandlers() {
  if (!socket) return;
  
  // List of all game events
  const gameEvents = [
    'room-joined', 'player-joined', 'opponent-ready', 
    'game-starting', 'opponent-progress', 'opponent-finished', 
    'game-completed', 'game-cancelled', 'player-disconnected', 
    'rematch-requested', 'rematch-created', 'rematch-declined', 
    'room-updated', 'active-rooms-available'
  ];
  
  // Set up handlers for all game events
  gameEvents.forEach(event => {
    socket.on(event, (data) => {
      console.log(`Received ${event} event:`, data);
      
      if (listeners[event]) {
        listeners[event].forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in ${event} listener:`, error);
          }
        });
      }
    });
  });
  
  // Special handler for pong to check connection health
  socket.on('pong', (data) => {
    const latency = Date.now() - data.timestamp;
    console.log(`Pong received with ${latency}ms latency`);
  });
}

export default SocketService;