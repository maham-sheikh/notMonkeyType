import React from 'react';

/**
 * A reusable component for displaying loading and error states
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether content is loading
 * @param {string|null} props.error - Error message, if any
 * @param {React.ReactNode} props.children - Content to display when not loading or errored
 * @param {string} props.title - Title to display in loading/error states
 * @param {Function} props.onRetry - Optional callback for retry button
 * @param {string} props.loadingMessage - Custom loading message
 * @param {string} props.errorMessage - Prefix for error message
 * @param {string} props.className - Additional CSS classes
 */
const LoadingErrorState = ({
  loading = false,
  error = null,
  children,
  title = '',
  onRetry = null,
  loadingMessage = 'Loading data...',
  errorMessage = 'Error:',
  className = '',
}) => {
  if (!loading && !error) {
    return children;
  }

  return (
    <div className={`rounded-lg shadow-lg backdrop-blur-lg bg-white/10 p-6 ${className}`}>
      {title && <h2 className="text-white text-4xl font-extrabold tracking-tighter mb-6">{title}</h2>}
      
      <div className="flex flex-col justify-center items-center min-h-[400px] text-center">
        {loading && (
          <div className="space-y-4">
            {/* Loading spinner */}
            <div className="inline-block w-12 h-12 rounded-full border-4 border-accent/40 border-t-transparent animate-spin"></div>
            
            {/* Loading message */}
            <div className="animate-pulse text-white text-xl">
              {loadingMessage}
            </div>
          </div>
        )}
        
        {error && (
          <div className="space-y-6">
            {/* Error icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-400">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            </div>
            
            {/* Error message */}
            <div className="text-red-400 text-xl max-w-md">
              {errorMessage} {error}
            </div>
            
            {/* Retry button */}
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-6 py-2 bg-accent hover:bg-accent/40 text-white rounded-lg transition duration-300 flex items-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingErrorState;