import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrophyIcon, 
  RefreshCwIcon, 
  XIcon, 
  ActivityIcon, 
  TargetIcon, 
  ClockIcon 
} from 'lucide-react';

// Fixed StatItem component with proper background
const StatItem = ({ icon: Icon, label, value }) => (
  <motion.div 
    className="relative p-2 rounded-xl text-center shadow-xl overflow-hidden group bg-black/20"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="absolute inset-0 border border-white/10 rounded-xl"></div>
    
    <div className="flex items-center justify-center gap-1.5 mb-2">
      <Icon size={15} className="text-white/80 group-hover:text-white transition-colors duration-300" />
      <span className="text-xs font-medium tracking-wide text-white/80 group-hover:text-white transition-colors duration-300 uppercase">{label}</span>
    </div>
    <p className="text-xl font-bold text-white relative z-10">{value}</p>
  </motion.div>
);

const MultiPlayerScoreCard = ({ results, playerInfo, onClose }) => {
  // Sort players by score
  const sortedPlayers = [...results.players].sort((a, b) => b.score - a.score);
  
  // Determine winner
  const winner = results.isTie ? null : sortedPlayers[0];
  const isPlayerWinner = winner && winner.userId === playerInfo?.userId;
  
  // Function to refresh page
  const handleReturn = () => {
    window.location.reload();
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="w-full max-w-2xl max-h-[95%] bg-black/80 backdrop-blur-xl rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-accent/70 overflow-hidden"
      >
        {/* Header with result */}
        <div className="relative p-4 text-center">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white rounded-xl transition-colors"
          >
            <XIcon size={20} />
          </motion.button>
          
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.3, damping: 12 }}
            className="mb-4 inline-flex justify-center"
          >
            <div className={`p-4 rounded-xl shadow-2xl ${
              results.isTie 
                ? 'bg-gradient-to-br from-violet-600/40 to-purple-800/20 border-2 border-purple-500/40' 
                : 'bg-gradient-to-br from-amber-500/40 to-orange-700/20 border-2 border-amber-500/40'
            }`}>
              <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              >
                <TrophyIcon className={results.isTie ? "text-purple-300" : "text-amber-300"} size={38} />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80"
          >
            {results.isTie ? "It's a tie!" : isPlayerWinner ? "You win!" : "You lose!"}
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 max-w-md mx-auto"
          >
            {results.isTie 
              ? "Both players finished with the same score" 
              : isPlayerWinner 
                ? "Congratulations on your victory!" 
                : "Better luck next time!"}
          </motion.p>
        </div>
        
        {/* Player results */}
        <div className="relative py-4 px-12">
          <div className="grid grid-cols-1 gap-2 mb-4">
            {sortedPlayers.map((player, index) => {
              // Determine if this player is the winner
              const isWinner = winner && winner.userId === player.userId;
              
              return (
                <motion.div 
                  key={player.userId}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                  className={`relative rounded-xl border p-4 shadow-2xl ${
                    player.isPlayer 
                      ? 'bg-gradient-to-br from-accent/40 via-accent/30 to-accent/30 border-accent' 
                      : 'bg-gradient-to-br from-white/15 via-white/8 to-transparent border-white/15'
                  }`}
                >
                  {/* Glow effect for winner */}
                  {isWinner && (
                    <div className="absolute inset-0 -z-10 bg-yellow-600/50 rounded-xl blur-xl"></div>
                  )}
                  
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-4">
                      {/* Icon container with correct styling */}
                      <div className={`p-3 rounded-xl shadow-lg ${
                        isWinner
                          ? 'bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/40' 
                          : player.isPlayer
                            ? 'bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/40'
                            : 'bg-gradient-to-br from-white/15 to-white/5 border border-white/15'
                      }`}>
                        {isWinner 
                          ? <TrophyIcon className="text-amber-400" size={22} /> 
                          : <ActivityIcon className={player.isPlayer ? 'text-accent' : 'text-white/80'} size={22} />
                        }
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">{player.name}</h3>
                        <p className="text-white/70 text-sm mt-0.5">{player.isPlayer ? 'You' : 'Opponent'}</p>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="bg-gradient-to-r from-black/50 to-black/30 px-5 py-2 rounded-xl border border-white/10 shadow-lg"
                    >
                      <span className="text-xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 text-transparent bg-clip-text">{player.score}</span>
                      <span className="text-white/60 ml-1 text-sm">pts</span>
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <StatItem icon={ActivityIcon} label="WPM" value={player.wpm} />
                    <StatItem icon={TargetIcon} label="Accuracy" value={`${player.accuracy}%`} />
                    <StatItem 
                      icon={ClockIcon} 
                      label="Time" 
                      value={player.finishedAt 
                        ? new Date(player.finishedAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })
                        : '—'
                      } 
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Action Button */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center"
          >
            <motion.button 
              onClick={handleReturn}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 bg-gradient-to-r from-accent/80 to-accent/70 hover:from-accent/90 hover:to-accent/80 px-8 py-3.5 rounded-xl transition-all duration-300 border border-accent/50 font-medium shadow-lg"
            >
              <RefreshCwIcon size={20} className="text-white" />
              <span className="text-white text-lg">Play Again</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MultiPlayerScoreCard;