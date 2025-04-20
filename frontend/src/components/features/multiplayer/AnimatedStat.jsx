import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimatedStat - A component that animates value changes smoothly
 * 
 * @param {Object} props
 * @param {string} props.label - The label for the stat
 * @param {number} props.value - The current value
 * @param {string} props.suffix - Optional suffix (like %)
 * @param {React.ReactNode} props.icon - Icon to display
 */
const AnimatedStat = ({ label, value, suffix = '', icon }) => {
  // Convert to string for display and animation key
  const displayValue = value.toString();
  
  return (
    <div className="bg-black/20 rounded p-2 flex flex-col items-center">
      <div className="text-gray-400 mb-1">
        {icon}
      </div>
      <div className="text-xs text-gray-300">{label}</div>
      <div className="font-bold text-white h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayValue}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {displayValue}{suffix}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedStat;