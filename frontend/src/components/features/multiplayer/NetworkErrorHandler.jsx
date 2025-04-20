import React, { useState, useEffect } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import SocketService from '../../../services/SocketService';

const NetworkErrorHandler = ({ onRetry }) => {
  const [networkError, setNetworkError] = useState(false);
  
  // Check for network errors when component mounts and periodically
  useEffect(() => {
    const checkNetworkStatus = () => {
      const status = SocketService.getStatus();
      const hasError = status && status.error && !status.connected;
      setNetworkError(hasError);
    };
    
    // Initial check
    checkNetworkStatus();
    
    // Periodic check
    const interval = setInterval(checkNetworkStatus, 5000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, []);
  
  // If no network error, don't render anything
  if (!networkError) {
    return null;
  }
  
  // Render network error message with retry button
  return (
    <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-center gap-3">
      <AlertTriangleIcon className="text-red-500 flex-shrink-0" size={24} />
      <div className="flex-grow">
        <p className="text-red-400">Network error. Please check your connection and try again.</p>
      </div>
      <button 
        onClick={() => {
          onRetry();
          // Re-check status after a brief delay
          setTimeout(() => {
            const status = SocketService.getStatus();
            setNetworkError(status && status.error && !status.connected);
          }, 1000);
        }}
        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <RefreshCwIcon size={14} />
        <span>Retry</span>
      </button>
    </div>
  );
};

export default NetworkErrorHandler;