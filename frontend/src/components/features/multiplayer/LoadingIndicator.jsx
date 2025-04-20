import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="mt-4 text-center">
      <div className="inline-block w-6 h-6 border-2 border-white border-t-accent rounded-full animate-spin"></div>
      <p className="text-white mt-2">Processing...</p>
    </div>
  );
};

export default LoadingIndicator;