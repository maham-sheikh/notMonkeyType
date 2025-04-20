import React from 'react';
import { 
  Trophy, Clock, Target, Flame 
} from 'lucide-react';
import { motion } from 'framer-motion';

const ScoreCard = ({ wpm, time, accuracy, score, onClose }) => {
  const scoreDetails = [
    { 
      icon: Flame, 
      label: "Words Per Minute", 
      value: wpm 
    },
    { 
      icon: Clock, 
      label: "Time", 
      value: `${time} seconds` 
    },
    { 
      icon: Target, 
      label: "Accuracy", 
      value: `${accuracy}%` 
    },
    { 
      icon: Trophy, 
      label: "Score", 
      value: score 
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className=" p-8 w-full max-w-md bg-black/5 backdrop-blur-2xl rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-accent/70"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <Trophy className="mr-4 text-yellow-400" size={36} />
            Test Results
          </h2>
          <button 
            onClick={onClose} 
            className="text-white/50 hover:text-white transition"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          {scoreDetails.map(({ icon: Icon, label, value }, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Icon className="text-accentHover" size={24} />
                </div>
                <p className="text-white/60 text-sm uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreCard;