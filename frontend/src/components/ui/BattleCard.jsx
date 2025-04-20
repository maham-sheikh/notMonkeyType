import React from 'react';
import { 
  Trophy, 
  Activity, 
  Target, 
  Calendar 
} from 'lucide-react';

const BattleCard = ({ game, isWinner, currentUserId }) => {
  const { playerPerformance, opponentPerformance, date, contentType, level } = game;
  
  // Determine if current user was the player or opponent in this game
  const isPlayer = playerPerformance.userId === currentUserId;
  const userPerf = isPlayer ? playerPerformance : opponentPerformance;
  const opponentPerf = isPlayer ? opponentPerformance : playerPerformance;
  
  // Performance comparison section component
  const PerformanceMetric = ({ label, icon: Icon, value, isUserMetric }) => (
    <div className="bg-black/30 p-3 rounded-xl text-center group transition-all duration-300 hover:bg-black/40">
      <p className="text-xs text-white/60 mb-1.5 tracking-wider uppercase">{label}</p>
      <div className="flex items-center justify-center gap-2">
        <Icon 
          size={16} 
          className={`
            transition-colors duration-300
            ${isUserMetric 
              ? 'text-accent group-hover:scale-110' 
              : 'text-white/60 group-hover:text-white/80'}
          `} 
        />
        <p className={`
          text-xl font-bold 
          ${isUserMetric ? 'text-white' : 'text-white/90'}
          transition-colors duration-300 
          group-hover:text-accent
        `}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div 
      className={`
        rounded-xl overflow-hidden shadow-lg
        ${isWinner 
          ? 'bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30' 
          : 'bg-gradient-to-br from-white/10 to-transparent border-2 border-white/15'}
        transform transition-all duration-300
        relative
      `}
    >
      {/* Decorative corner accent */}
      <div className={`
        absolute top-0 right-0 w-0 h-0 
        border-t-[40px] border-l-[40px] border-transparent
        ${isWinner 
          ? 'border-t-accent/20' 
          : 'border-t-white/10'}
      `} />

      {/* Content Container */}
      <div className="p-5">
        {/* Header: Date and Game Type */}
        <div className="flex justify-between items-center text-sm text-white/60 mb-4">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-xl">
            <Calendar size={14} className="text-accent/70" />
            <span className="tracking-wider">
              {new Date(date).toLocaleDateString('en-US', {
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-black/20 text-xs font-medium capitalize tracking-tighter">
            {contentType} • {level}
          </div>
        </div>
        
        {/* Result Banner with Dynamic Styling */}
        <div 
          className={`
            rounded-xl p-3 mb-4 text-center text-sm font-semibold tracking-wider uppercase
            ${isWinner 
              ? 'bg-accent/20 text-accent' 
              : 'bg-white/10 text-white/80'}
          `}
        >
          {isWinner ? (
            <span className="flex items-center justify-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              Victory
            </span>
          ) : (
            <span>Defeat</span>
          )}
        </div>
        
        {/* Performance Comparison Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <PerformanceMetric 
            label="Your WPM" 
            icon={Activity} 
            value={userPerf.wpm} 
            isUserMetric={true} 
          />
          <PerformanceMetric 
            label="Their WPM" 
            icon={Activity} 
            value={opponentPerf.wpm} 
            isUserMetric={false} 
          />
          <PerformanceMetric 
            label="Your Accuracy" 
            icon={Target} 
            value={`${userPerf.accuracy}%`} 
            isUserMetric={true} 
          />
          <PerformanceMetric 
            label="Their Accuracy" 
            icon={Target} 
            value={`${opponentPerf.accuracy}%`} 
            isUserMetric={false} 
          />
        </div>
      </div>
    </div>
  );
};

export default BattleCard;