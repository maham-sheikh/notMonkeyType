// src/components/features/typing/GameInfo.jsx
import React from 'react';
import { Shield, Zap, Crosshair, Clock } from 'lucide-react';

const GameInfo = ({ config }) => {
  // Get difficulty icon
  const getDifficultyIcon = () => {
    switch (config.difficultyLevel) {
      case 'beginner':
        return <Shield className="text-green-400" />;
      case 'expert':
        return <Crosshair className="text-red-400" />;
      case 'intermediate':
      default:
        return <Zap className="text-yellow-400" />;
    }
  };
  
  // Format time
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };
  
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/60">Type</span>
          <span className="text-white capitalize">{config.type || 'Paragraph'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white/60">Difficulty</span>
          <div className="flex items-center space-x-2">
            {getDifficultyIcon()}
            <span className="text-white capitalize">{config.difficultyLevel || 'Intermediate'}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white/60">Duration</span>
          <div className="flex items-center space-x-2">
            <Clock className="text-accent" />
            <span className="text-white">{formatTime(config.testDuration || 60)}</span>
          </div>
        </div>
        
        {config.genre && (
          <div className="flex items-center justify-between">
            <span className="text-white/60">Genre</span>
            <span className="text-white capitalize">{config.genre}</span>
          </div>
        )}
        
        {config.language && (
          <div className="flex items-center justify-between">
            <span className="text-white/60">Language</span>
            <span className="text-white capitalize">{config.language}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInfo;