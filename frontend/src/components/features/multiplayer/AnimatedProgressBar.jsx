import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedProgressBar - A progress bar with smooth transitions between values
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.color - CSS color class for the progress bar
 */
const AnimatedProgressBar = ({ progress, color = "bg-accent" }) => {
  // Ensure progress is within bounds
  const safeProgress = Math.min(Math.max(0, Number(progress) || 0), 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span>Progress</span>
        <motion.span
          key={`progress-${safeProgress}`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {safeProgress}%
        </motion.span>
      </div>
      <div className="h-2 bg-gray-950/40 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: `${safeProgress > 0 ? safeProgress - 1 : 0}%` }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ 
            type: "spring", 
            stiffness: 60, 
            damping: 20 
          }}
        />
      </div>
    </div>
  );
};

export default AnimatedProgressBar;