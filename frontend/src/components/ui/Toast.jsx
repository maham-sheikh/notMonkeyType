import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  
  // Toast configuration based on type
  const toastConfig = {
    success: {
      icon: <CheckCircle size={18} />,
      bgColor: 'from-green-500/90 to-green-600/90',
      borderColor: 'border-green-400',
      shadowColor: 'shadow-green-500/20'
    },
    error: {
      icon: <AlertCircle size={18} />,
      bgColor: 'from-red-500/90 to-red-600/90',
      borderColor: 'border-red-400',
      shadowColor: 'shadow-red-500/20'
    },
    info: {
      icon: <Info size={18} />,
      bgColor: 'from-accent/90 to-accent/90',
      borderColor: 'border-accent/70',
      shadowColor: 'shadow-accent/20'
    },
    warning: {
      icon: <AlertTriangle size={18} />,
      bgColor: 'from-amber-500/90 to-amber-600/90',
      borderColor: 'border-amber-400',
      shadowColor: 'shadow-amber-500/20'
    }
  };

  const config = toastConfig[type] || toastConfig.info;
  
  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [duration]);

  // Auto-close after duration with fade-out effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      
      // Wait for animation to complete before removing toast
      const exitTimer = setTimeout(() => {
        onClose();
      }, 300);
      
      return () => clearTimeout(exitTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Handle close click
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 backdrop-blur-md bg-gradient-to-r ${config.bgColor} 
        border border-l-4 ${config.borderColor} text-white p-4 rounded-lg 
        ${config.shadowColor} shadow-lg flex items-start max-w-sm min-w-[320px] 
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-y-[-1rem] opacity-0' : 'translate-y-0 opacity-100'}`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3 text-white mt-0.5">
        {config.icon}
      </div>
      <div className="flex-grow">
        <div className="text-sm font-medium">{message}</div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/20 h-1 mt-2 rounded-full overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all ease-linear duration-100"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <button 
        onClick={handleClose}
        className="ml-3 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none flex-shrink-0"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;