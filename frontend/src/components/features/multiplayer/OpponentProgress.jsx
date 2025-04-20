import React from 'react';
import { motion } from 'framer-motion';
import { Keyboard, User } from 'lucide-react';

const OpponentProgress = ({ opponentData, testTextLength }) => {
  if (!opponentData) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-accent/20 p-1.5 rounded-full">
          <User size={16} className="text-accent" />
        </div>
        <span className="text-white font-medium">{opponentData.name}</span>
        <div className="flex items-center ml-auto space-x-4">
          <div className="text-xs text-white/70">
            <span className="text-accent font-semibold">{opponentData.wpm || '-'}</span> WPM
          </div>
          <div className="text-xs text-white/70">
            <span className="text-accent font-semibold">{opponentData.accuracy || '-'}%</span> Accuracy
          </div>
        </div>
      </div>
      
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="absolute left-0 top-0 bottom-0 bg-gray-400"
          style={{ width: `${opponentData.progress || 0}%` }}
          animate={{ width: `${opponentData.progress || 0}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
      </div>
      
      {/* Typing indicator */}
      {opponentData.progress < 100 && (
        <div className="flex justify-end mt-1">
          <div className="flex items-center text-xs text-white/60">
            <Keyboard size={12} className="mr-1" />
            <span className="flex items-center">
              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-0.5 animate-pulse"></span>
              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-0.5 animate-pulse animation-delay-150"></span>
              <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-pulse animation-delay-300"></span>
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OpponentProgress;