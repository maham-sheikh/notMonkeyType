import React from 'react';

// Button variants:
// primary: main CTA buttons (default)
// secondary: less prominent actions
// danger: destructive actions
// ghost: subtle buttons

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  icon = null,
  ...props 
}) => {
  // Base classes
  const baseClasses = 'rounded-lg transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-accent hover:bg-accentHover text-white focus:ring-accent/40',
    secondary: 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400'
  };
  
  // Disabled state
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Compose classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <div className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

export default Button;