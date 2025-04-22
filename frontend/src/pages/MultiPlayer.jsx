import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader } from 'lucide-react';

import NavigationBar from '../components/layouts/Navbar';
import MultiPlayerForm from '../components/features/multiplayer/MultiPlayerForm';
import MultiPlayerScoreCard from '../components/common/MultiPlayerScoreCard';
import TypingArea from '../components/features/multiplayer/TypingArea';
import PlayersPanel from '../components/features/multiplayer/PlayersPanel';

import useMultiplayerGame from '../hooks/useMultiplayerGame';


const MultiPlayer = () => {
  // Use the multiplayer game hook to manage all game logic and state
  const {
    gameState,
    userInput,
    currentIndex,
    charClasses,
    stats,
    loading,
    error,
    inputRef,
    handleHostStart,
    resetGame,
    endTest,
    setRoomCode,
    toggleScoreCard
  } = useMultiplayerGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800/40 to-gray-700/40 relative overflow-hidden">
      {/* Navigation */}
      <NavigationBar 
        mode="MultiPlayer"
        testStarted={gameState.testStarted}
        onLeaveGame={resetGame}
        onEndTest={endTest}
        roomCode={gameState.roomCode}
        isHost={gameState.isHost}
        onHostStart={handleHostStart}
        canStartMatch={gameState.canStartMatch}
        isWaiting={gameState.isWaiting}
      />

      {/* Main Content */}
      {gameState.showForm ? (
        <MultiPlayerForm 
          setRoomCode={setRoomCode}
          loading={loading}
          error={error}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 pt-16 pb-4 relative z-20"
        >
          {/* Error message */}
          {error && (
            <div className="absolute z-50 top-20 left-28   bg-red-500 border border-red-500/30 p-4 rounded-lg flex items-center">
              <AlertTriangle className="text-white mr-3" size={24} />
              <span className="text-white">{error}</span>
            </div>
          )}
      
        
          {/* Game area */}
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            {/* Typing area (70%) */}
            <div className="md:w-[70%] ">
              <TypingArea
                testText={gameState.testText}
                charClasses={charClasses}
                currentIndex={currentIndex}
                countdown={gameState.countdown}
                testStarted={gameState.testStarted}
                timeRemaining={gameState.timeRemaining}
                inputRef={inputRef}
                userInput={userInput}
              />
            </div>
            
            {/* Stats panel (30%) */}
            <div className="md:w-[30%]">

                      {/* Room info */}
            <div className="mb-6 mt-2">
            <h2 className="text-2xl font-bold text-white">
              Room: {gameState.roomCode}
              {gameState.isWaiting && (
                <span className="ml-3 text-sm text-amber-400 flex items-center">
                  <Loader className="animate-spin mr-1" size={16} />
                  Waiting for opponent...
                </span>
              )}
            </h2>
          </div>
          
            <PlayersPanel
            key={`player-panel-${stats.opponentProgress}-${gameState.opponentInfo?.score || 0}`}
              playerInfo={gameState.playerInfo}
              opponentInfo={gameState.opponentInfo}
              progress={stats.progress}
              wpm={stats.wpm}
              accuracy={stats.accuracy}
              score={stats.score}
              opponentProgress={stats.opponentProgress}
            />
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Score Card */}
      <AnimatePresence>
        {gameState.showScoreCard && gameState.gameResults && (
          <MultiPlayerScoreCard
            results={gameState.gameResults}
            playerInfo={gameState.playerInfo}
            opponentInfo={gameState.opponentInfo}
            onClose={() => toggleScoreCard(false)}
            onRematch={resetGame}
          />
        )}
      </AnimatePresence>
      
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default MultiPlayer;