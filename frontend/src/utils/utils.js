// utils.js

// Function to round a number to 1 decimal place
export const roundToOneDecimal = (num) => {
    if (typeof num !== 'number') return num; // Return as-is if not a number
    return Math.round(num * 10) / 10;
  };
  
  // Function to format date as '14-Aug-2024'
  export const formatDate = (dateString) => {
    if (!dateString) return ''; // Handle empty/null values
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };
  