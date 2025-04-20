import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';


const Timer = ({ duration = 5, onClose }) => {
  const [countdown, setCountdown] = useState(duration);

  // Countdown effect
  useEffect(() => {
    if (countdown <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onClose]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Get Ready!"
      maxWidth="sm"
    >
      <div className="flex flex-col items-center justify-center py-6">
        <div className="text-6xl font-bold text-white mb-4">{countdown}</div>
        <p className="text-white text-lg">
          {countdown > 0 
            ? 'The game will start soon...' 
            : 'Go!'}
        </p>
      </div>
    </Modal>
  );
};

export default Timer;