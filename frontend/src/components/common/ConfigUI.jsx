import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';

/**
 * Shared UI components for GameConfiguration and MultiPlayerForm
 * These components maintain consistent styling across both interfaces
 */

/**
 * OptionButton - Versatile button component for selections
 * 
 * @param {Object} props
 * @param {boolean} props.selected - Whether this option is selected
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.useAccentBg - Whether to use accent background when selected
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {string} props.iconPosition - Position of icon (left, right)
 * @param {string} props.size - Button size (sm, md, lg)
 */
export const OptionButton = ({
  selected,
  onClick,
  children,
  className = '',
  useAccentBg = true,
  icon = null,
  iconPosition = 'left',
  size = 'md',
  disabled = false,
  ...props
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };
  
  // Base styling that's shared between both implementations
  const baseClasses = `
    rounded-xl border transition-all duration-300
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${sizeClasses[size] || sizeClasses.md}
  `;
  
  // Selection styling
  const selectedClasses = useAccentBg
    ? 'bg-accent/20 border-accent text-white'
    : 'bg-white/10 border-white/10 text-white';
    
  // Default styling
  const unselectedClasses = 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white';
  
  // Composite className
  const compositeClassName = `
    ${baseClasses}
    ${selected ? selectedClasses : unselectedClasses}
    ${className}
  `;
  
  // Icon rendering based on position
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <div className={`${iconPosition === 'left' ? 'mr-2' : 'ml-2'} flex-shrink-0`}>
        {icon}
      </div>
    );
  };
  
  // Check icon for selected state (optional)
  const renderSelectedIndicator = () => {
    if (!selected) return null;
    
    return (
      <CheckIcon className="text-accent ml-auto flex-shrink-0" size={18} />
    );
  };
  
  return (
    <button
      onClick={onClick}
      className={compositeClassName}
      disabled={disabled}
      {...props}
    >
      <div className="flex items-center">
        {iconPosition === 'left' && renderIcon()}
        <div className="flex-grow">{children}</div>
        {iconPosition === 'right' && renderIcon()}
        {renderSelectedIndicator()}
      </div>
    </button>
  );
};

/**
 * OptionCard - Card-style selection component with icon and description
 * 
 * @param {Object} props
 * @param {boolean} props.selected - Whether this option is selected
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 */
export const OptionCard = ({
  selected,
  onClick,
  icon,
  title,
  description,
  className = '',
  disabled = false
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all
        ${selected 
          ? 'bg-accent/20 border-accent' 
          : 'bg-white/5 border-white/10 hover:bg-white/10'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && (
        <div className={`p-2 rounded-full ${
          selected ? 'bg-accent/20' : 'bg-white/10'
        }`}>
          {React.cloneElement(icon, {
            className: selected ? 'text-accent' : 'text-white/60',
            size: 20
          })}
        </div>
      )}
      <div className="text-left flex-grow"> 
        <div className="font-bold text-white">{title}</div>
        <div className="text-white/60 text-sm">{description}</div>
      </div>
      {selected && (
        <CheckIcon className="text-accent ml-auto" size={18} />
      )}
    </button>
  );
};

/**
 * SectionHeader - Consistent section header with optional icon
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.icon - Optional icon
 */
export const SectionHeader = ({ title, icon = null, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 mb-3 ${className}`}>
      {icon && React.cloneElement(icon, { 
        className: "text-accent", 
        size: 18 
      })}
      <h3 className="text-white text-lg font-semibold">{title}</h3>
    </div>
  );
};

/**
 * AnimatedContainer - Framer Motion animated container
 */
export const AnimatedContainer = ({ children, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring", damping: 25, staggerChildren: 0.05 }
    },
    exit: { opacity: 0, y: 20, scale: 0.95 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`p-6 max-w-3xl bg-black/60 backdrop-blur-3xl rounded-2xl shadow-lg border border-accent/30 ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * ErrorDisplay - Consistent error display component
 */
export const ErrorDisplay = ({ error }) => {
  if (!error) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-4"
    >
      {error}
    </motion.div>
  );
};

/**
 * ActionButton - Primary action button with consistent styling
 */
export const ActionButton = ({ 
  onClick, 
  children, 
  isLoading = false,
  disabled = false,
  className = '',
  variant = 'primary',
  icon = null,
  iconPosition = 'right'
}) => {
  const variants = {
    primary: `
      bg-accent hover:bg-accent/80 text-white 
      shadow-lg shadow-accent/10 hover:shadow-accent/20
    `,
    secondary: `
      bg-white/10 hover:bg-white/20 text-white
    `,
    outline: `
      bg-transparent border border-white/30 hover:border-white/50 text-white
    `
  };
  
  const selectedVariant = variants[variant] || variants.primary;
  
  const renderIcon = () => {
    if (!icon) return null;
    return iconPosition === 'left' ? 
      <span className="mr-2">{icon}</span> : 
      <span className="ml-2">{icon}</span>;
  };
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        flex items-center justify-center gap-2 
        px-6 py-3 rounded-lg font-medium
        transition-all duration-300 
        ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${selectedVariant}
        ${className}
      `}
    >
      {isLoading && (
        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
      )}
      {iconPosition === 'left' && renderIcon()}
      {children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default {
  OptionButton,
  OptionCard,
  SectionHeader,
  AnimatedContainer,
  ErrorDisplay,
  ActionButton
};