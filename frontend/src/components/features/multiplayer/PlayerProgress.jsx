import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, ActivityIcon, TargetIcon, AwardIcon, Loader } from 'lucide-react';
import AnimatedStat from './AnimatedStat';
import AnimatedProgressBar from './AnimatedProgressBar';

/**
 * PlayerProgress component - displays an individual player's stats and progress
 * Memoized to prevent unnecessary re-renders
 */
const PlayerProgress = memo(({
  name,
  progress,
  wpm,
  accuracy,
  score,
  isPlayer,
  isWaiting = false
}) => {
  // Ensure all values are safe numbers
  const safeProgress = Math.min(Math.max(0, Number(progress) || 0), 100);
  const safeWpm = Number(wpm) || 0;
  const safeAccuracy = Number(accuracy) || 0;
  const safeScore = Number(score) || 0;

  return (
    <motion.div 
      className={`rounded-lg p-4 ${isPlayer ? 'bg-accent/40' : 'bg-accent/10'}`}
      initial={{ opacity: 0.8, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Player info */}
      <div className="flex items-center mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isPlayer ? 'bg-yellow-400/90' : 'bg-gray-400/20'}`}>
          {isWaiting ? (
            <Loader className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <UserIcon className="w-4 h-4 text-white" />
          )}
        </div>
        <span className="font-medium text-white">{name}</span>
        {isWaiting && (
          <span className="ml-2 text-xs text-gray-400 flex items-center">
            Waiting for player to join...
          </span>
        )}
      </div>

      {/* Progress bar with smooth animation */}
      <AnimatedProgressBar 
        progress={safeProgress} 
        color={isPlayer ? "bg-gray-200" : "bg-gray-200"} 
      />

      {/* Stats with animations */}
      <div className="grid grid-cols-3 gap-2">
        <AnimatedStat
          icon={<ActivityIcon className="w-3 h-3" />}
          label="WPM"
          value={safeWpm}
        />
        
        <AnimatedStat
          icon={<TargetIcon className="w-3 h-3" />}
          label="Accuracy"
          value={safeAccuracy}
          suffix="%"
        />
        
        <AnimatedStat
          icon={<AwardIcon className="w-3 h-3" />}
          label="Score"
          value={safeScore}
        />
      </div>
    </motion.div>
  );
});

// Add display name for debugging
PlayerProgress.displayName = 'PlayerProgress';

export default PlayerProgress;