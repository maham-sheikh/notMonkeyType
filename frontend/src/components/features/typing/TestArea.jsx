// src/components/features/typing/TestArea.jsx
import React, { useRef, useEffect } from 'react';

const TestArea = ({ testText, charClasses, currentIndex }) => {
  const containerRef = useRef(null);

  // Auto-scroll only after 200 characters are typed
  // useEffect(() => {
  //   if (containerRef.current && currentIndex >= 200) {
  //     const container = containerRef.current;
  //     const spans = container.querySelectorAll('span');
      
  //     if (spans[currentIndex]) {
  //       spans[currentIndex].scrollIntoView({ 
  //         behavior: 'smooth', 
  //         block: 'center'
  //       });
  //     }
  //   }
  // }, [currentIndex]);

  return (
    <div 
      ref={containerRef}
      className="word-container bg-gray-950/70 font-mono text-lg leading-relaxed p-4 h-64 overflow-y-auto rounded-xl scrollbar-hide"
      style={{ 
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none',  /* IE and Edge */
      }}
    >
      {/* Hide scrollbar for Chrome, Safari and Opera */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {testText.split("").map((char, index) => {
        let className = "text-gray-400"; // default
        
        if (charClasses[index] === 'correct') {
          className = "text-green-400";
        } else if (charClasses[index] === 'wrong') {
          className = "text-red-500";
        }
        
        // Highlight current character position
        if (index === currentIndex) {
          className += " bg-accent/30";
        }
        
        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default TestArea;