// src/components/features/typing/StatsDisplay.jsx
import React from 'react';

const StatsDisplay = ({ wpm, accuracy, timeRemaining }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Stats</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-white/60">WPM</p>
          <p className="text-2xl font-bold text-white">{wpm}</p>
        </div>
        
        <div>
          <p className="text-white/60">Accuracy</p>
          <p className="text-2xl font-bold text-white">{accuracy}%</p>
        </div>
        
        <div>
          <p className="text-white/60">Time Remaining</p>
          <p className="text-2xl font-bold text-white">{timeRemaining}s</p>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;