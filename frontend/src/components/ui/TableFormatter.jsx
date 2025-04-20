import { format, parseISO } from 'date-fns';

/**
 * Format a value based on its type and column key
 * @param {any} value - The value to format
 * @param {string} type - The data type (number, date, etc.)
 * @param {string} key - The column key
 * @returns {string} Formatted value
 */
export const formatTableValue = (value, type, key) => {
  // Handle null/undefined values
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  try {
    // Handle date formatting
    if (
      type === 'date' || 
      (typeof key === 'string' && 
        (key.toLowerCase().includes('date') || 
         key.toLowerCase().includes('time') ||
         key.toLowerCase().includes('created') ||
         key.toLowerCase().includes('updated'))
      )
    ) {
      // Check if it looks like an ISO date
      if (typeof value === 'string' && value.includes('T')) {
        try {
          const date = parseISO(value);
          return format(date, 'd MMM yyyy');
        } catch (e) {
          // If date parsing fails, return original
          return value;
        }
      }
      return value;
    }
    
    // Handle number formatting
    if (type === 'number' || !isNaN(parseFloat(value))) {
      const num = parseFloat(value);
      
      // For integers or large numbers, don't show decimals
      if (Number.isInteger(num) || num > 1000) {
        return Math.round(num).toString();
      }
      
      // For floating point numbers, show one decimal place
      // This also fixes issues with values like 97.1999999999999
      return Number(num.toFixed(1)).toString();
    }
    
    // Default return the original value
    return value;
  } catch (error) {
    // If any error occurs during formatting, return the original value
    console.warn(`Formatting error for ${key}:`, error);
    return String(value);
  }
};