import React from 'react';

const Toggler = ({ selectedValue, onToggleChange }) => {
  const options = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full p-1">
      {options.map((option) => (
        <button
          key={option}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
            selectedValue === option.toLowerCase()
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-300 hover:bg-white/30"
          }`}
          onClick={() => onToggleChange(option.toLowerCase())}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default Toggler;
