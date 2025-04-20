import React from 'react';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

import Button from '../../ui/Button';
import Modal from '../../ui/Modal';

const ResultsModal = ({ scores, onClose }) => {
  // Calculate combined score for each player
  const processedScores = scores.map(score => ({
    ...score,
    combinedScore: score.accuracy + score.wpm
  }))
  // Sort players by combined score in descending order
  .sort((a, b) => b.combinedScore - a.combinedScore);

  // Medal icons for top 3 positions
  const medalIcons = [
    <FaTrophy className="text-yellow-400 text-2xl" />,
    <FaMedal className="text-gray-400 text-2xl" />,
    <FaAward className="text-amber-700 text-2xl" />
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Results"
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-4">
        {processedScores.map((score, index) => (
          <div 
            key={index}
            className={`
              bg-white rounded-lg shadow-md p-6 flex flex-col justify-between
              ${index === 0 ? 'border-2 border-yellow-400' : ''}
              transition duration-300 transform hover:scale-105
            `}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Player {index + 1}
                </h3>
                {index < 3 && (
                  <div className="ml-2">
                    {medalIcons[index]}
                  </div>
                )}
              </div>
              
              <p className="text-lg text-gray-700 mt-2">
                <span className="font-semibold">Email:</span> {score.email}
              </p>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">WPM</p>
                  <p className="text-indigo-700 text-xl font-bold">{score.wpm.toFixed(2)}</p>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Accuracy</p>
                  <p className="text-indigo-700 text-xl font-bold">{score.accuracy.toFixed(2)}%</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="bg-indigo-100 px-4 py-2 rounded-full">
                <span className="text-indigo-800 font-semibold">Score: {score.score}</span>
              </div>
              
              <div className="text-right">
                <span className="text-sm text-gray-600">Combined:</span>
                <span className="block text-lg font-bold text-indigo-600">{score.combinedScore.toFixed(2)}</span>
              </div>
            </div>
            
            {index === 0 && (
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-white p-2 rounded-full">
                <FaTrophy />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={onClose} 
          variant="primary"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ResultsModal;