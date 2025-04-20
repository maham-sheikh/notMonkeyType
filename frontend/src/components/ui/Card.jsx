import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  hover = false,
  shadow = true,
  gradient = false,
}) => {
  const baseClasses = 'rounded-lg overflow-hidden';
  
  const shadowClasses = shadow ? 'shadow-lg' : '';
  
  const hoverClasses = hover ? 'transition duration-300 transform hover:scale-105' : '';
  
  const bgClasses = gradient 
    ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
    : 'bg-transparent backdrop-filter backdrop-blur-md backdrop-saturate-150 bg-opacity-20';
  
  const cardClasses = `
    ${baseClasses}
    ${shadowClasses}
    ${hoverClasses}
    ${bgClasses}
    ${className}
  `;

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className="px-6 py-4">
          {title && <div className="font-bold text-2xl text-white mb-2">{title}</div>}
          {subtitle && <p className="text-white text-base">{subtitle}</p>}
        </div>
      )}
      <div className={!title && !subtitle ? '' : 'px-6 py-4'}>
        {children}
      </div>
    </div>
  );
};

export default Card;