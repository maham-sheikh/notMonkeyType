// Components/features/multiplayer/TypingArea.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import TestArea from '../typing/TestArea';
import Keyboard from '../../common/Keyboard';

const TypingArea = ({ 
  testText, 
  charClasses, 
  currentIndex, 
  countdown, 
  testStarted, 
  timeRemaining, 
  inputRef,
  userInput 
}) => {
  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 relative "
      >
        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown > 0 && !testStarted && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"
            >
              <motion.div
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-7xl font-bold text-accent"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Timer */}
        <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full flex items-center gap-2">
          <Clock className="text-white/60" size={16} />
          <span className="text-white font-mono">
            {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
        
        {/* Test content */}
        <TestArea 
          testText={testText}
          charClasses={charClasses}
          currentIndex={currentIndex}
        />
        
        {/* Hidden input for focus */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={() => {}} // Prevent React warnings
          className="opacity-0 absolute left-[-9999px]"
          autoFocus
          tabIndex={-1}
        />
      </motion.div>
      
      {/* Keyboard */}
      <div className="w-full flex justify-center ">
        <Keyboard />
      </div>
    </div>
  );
};

export default TypingArea;