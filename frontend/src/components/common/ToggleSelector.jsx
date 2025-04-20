import React from 'react';

const ToggleSelector = ({ selectedValue, onToggleChange }) => {
  // Options for the toggle (you can customize these if needed)
  const options = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ];
  
  // Calculate left position for the slider
  const getLeftPosition = () => {
    if (selectedValue === 'beginner') return 'left-1';
    if (selectedValue === 'intermediate') return 'left-1/3';
    return 'left-2/3';
  };

  return (
    <div className="relative w-full mt-4 rounded-md h-10 p-1 bg-transparent">
      <div className="flex w-full">
        {options.map((option) => (
          <div
            key={option.value}
            className={`w-1/3 flex justify-center items-center cursor-pointer ${
              selectedValue === option.value ? 'bg-transparent' : 'bg-transparent'
            }`}
            onClick={() => onToggleChange(option.value)}
          >
            <button className="py-2 px-4 rounded-md text-md font-medium">
              {option.label}
            </button>
          </div>
        ))}
      </div>
      
      <span
        className={`
          ${getLeftPosition()}
          text-white bg-indigo-800 px-4 py-4 text-xl
          flex items-center justify-center w-1/3 rounded h-[1.88rem]
          transition-all duration-300 ease-linear top-[4px] absolute
        `}
      >
        {options.find(option => option.value === selectedValue)?.label}
      </span>
    </div>
  );
};

export default ToggleSelector;