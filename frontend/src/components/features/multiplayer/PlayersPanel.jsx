import React, { memo } from 'react';
import PlayerProgress from './PlayerProgress';

/**
 * PlayersPanel component - displays both players' progress and stats
 * Uses memo to prevent unnecessary re-renders
 */
const PlayersPanel = memo(({
  playerInfo,
  opponentInfo,
  progress,
  wpm,
  accuracy,
  score,
  opponentProgress
}) => {
  // Ensure values are valid numbers with fallbacks
  const safeProgress = typeof progress === 'number' ? progress : 0;
  const safeWpm = typeof wpm === 'number' ? wpm : 0;
  const safeAccuracy = typeof accuracy === 'number' ? accuracy : 0;
  const safeScore = typeof score === 'number' ? score : 0;
  
  // Use opponentInfo progress first, fall back to opponentProgress prop
  const calculatedOpponentProgress = 
    opponentInfo?.progress !== undefined ? 
    opponentInfo.progress : 
    opponentProgress || 0;
    
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4">
      <h2 className="text-xl font-bold text-white  mb-4">Players</h2>
      
      <div className="space-y-2">
        {/* Current player progress */}
        <PlayerProgress
          name={playerInfo?.name || 'You'}
          progress={safeProgress}
          wpm={safeWpm}
          accuracy={safeAccuracy}
          score={safeScore}
          isPlayer={true}
        />
        
        {/* Opponent progress */}
        <PlayerProgress
          name={opponentInfo?.name || 'Opponent'}
          progress={calculatedOpponentProgress}
          wpm={opponentInfo?.wpm || 0}
          accuracy={opponentInfo?.accuracy || 0}
          score={opponentInfo?.score || 0}
          isPlayer={false}
          isWaiting={!opponentInfo?.userId}
        />
      </div>
    </div>
  );
});

// Add display name for debugging
PlayersPanel.displayName = 'PlayersPanel';

export default PlayersPanel;