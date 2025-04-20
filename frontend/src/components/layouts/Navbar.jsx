import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Keyboard, 
  Users,
  Home,
  PlayCircle,
  LogOut,
  Crown,
  Copy
} from 'lucide-react';


const NavigationBar = ({
  mode = 'SinglePlayer',
  onStartTest,
  onEndTest,
  testStarted = false,
  onLeaveGame,
  roomCode = '',
  isHost = false,
  isWaiting = false,
  onHostStart,
  canStartMatch = false
}) => {
  // Clipboard copy utility
  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
    }
  };

  // Render multiplayer controls
const renderMultiplayerControls = () => {
  if (isHost && canStartMatch) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={onLeaveGame}
          className="flex items-center justify-center space-x-1 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-300"
        >
          <LogOut size={16} />
          <span className="text-sm">Cancel</span>
        </button>
        
        <button
          onClick={onHostStart}
          className="flex items-center justify-center space-x-1 px-4 py-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors duration-300"
        >
          <PlayCircle size={18} />
          <span className="text-sm font-medium">Start Match</span>
        </button>
      </div>
    );
  }
  
  // For all other cases, just show Cancel button
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onLeaveGame}
        className="flex items-center justify-center space-x-1 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-300"
      >
        <LogOut size={16} />
        <span className="text-sm">Cancel</span>
      </button>
    </div>
  );
};

  // Single player controls with start/stop only
  const renderSinglePlayerControls = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={testStarted ? onEndTest : onStartTest}
        className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded-full transition-colors duration-300 ${
          testStarted 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
        }`}
      >
        {testStarted ? (
          <>
            <LogOut size={16} />
            <span className="text-sm">Stop</span>
          </>
        ) : (
          <>
            <PlayCircle size={16} />
            <span className="text-sm">Start</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-accent/5 to-accent/5 backdrop-blur-xl border-b border-accent/10"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center px-4 py-3">
          {/* Left Navigation Section */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/home" 
              className="flex items-center justify-center h-10 w-10 rounded-full bg-accent/10 hover:bg-accent/20 text-white transition-colors"
            >
              <Home size={18} />
            </Link>
            
            <Link 
              to="/home" 
              className="hidden md:flex items-center space-x-2 text-white hover:opacity-80 transition"
            >
              <Keyboard className="text-accent" size={24} />
              <span className="text-xl font-bold tracking-tight">NOTMonkeyType</span>
            </Link>
          </div>
          
          {/* Central Navigation Section */}
          <div className="flex items-center space-x-4">
            {/* Mode Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              {mode === "MultiPlayer" ? (
                <>
                  <Users size={16} className="text-accent" />
                  <span className="text-sm text-white">Multiplayer</span>
                </>
              ) : (
                <>
                  <Keyboard size={16} className="text-accent" />
                  <span className="text-sm text-white">Single Player</span>
                </>
              )}
            </div>
            
            {/* Room Code Display */}
            {mode === "MultiPlayer" && roomCode && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-sm text-white font-light">Room: </span>
                <span className="font-mono font-bold text-white">{roomCode}</span>
                {isHost && (
                  <span className="ml-1 flex items-center px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    <Crown size={12} className="mr-1" />
                    <span className="text-xs">Host</span>
                  </span>
                )}
                <button
                  onClick={copyRoomCode}
                  className="ml-1 p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Copy room code"
                >
                  <Copy size={14} className="text-white/60 hover:text-white" />
                </button>
              </div>
            )}
            
            {/* Contextual Game Controls */}
            {mode === "MultiPlayer" ? renderMultiplayerControls() : renderSinglePlayerControls()}
          </div>
          
          {/* Status Indicator */}
          <div className="w-24 flex justify-end">
            {mode === "MultiPlayer" && (
              <div className="px-8 py-1.5 rounded-full bg-accent/10 text-accent text-sm">
                {isWaiting ? 'Waiting...' : (testStarted ? 'Race in progress' : 'Ready')}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavigationBar;