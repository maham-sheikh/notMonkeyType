import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  closeOnOverlayClick = true,
}) => {
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Width classes based on maxWidth prop
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div 
        className={`${
          widthClasses[maxWidth]
        } w-full mx-4 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 transition duration-300 transform`}
      >
        <div className="relative p-6">
          {title && (
            <div className="text-white text-xl font-bold mb-4">{title}</div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          
          <div className="text-white">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;