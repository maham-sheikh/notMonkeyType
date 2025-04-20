import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TablePagination = ({ currentPage, totalPages, totalItems, rowsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-white/60 text-sm">
        {startItem}-{endItem} of {totalItems}
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            currentPage === 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'bg-black/20 hover:bg-accent/20 transition-colors duration-200'
          }`}
        >
          <FaChevronLeft className="h-3 w-3 text-white" />
        </button>
        
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="w-8 h-8 flex items-center justify-center text-white/50">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                  currentPage === page 
                    ? 'bg-accent text-white font-medium' 
                    : 'bg-black/20 text-white hover:bg-accent/20'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            currentPage === totalPages 
              ? 'opacity-30 cursor-not-allowed' 
              : 'bg-black/20 hover:bg-accent/20 transition-colors duration-200'
          }`}
        >
          <FaChevronRight className="h-3 w-3 text-white" />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;