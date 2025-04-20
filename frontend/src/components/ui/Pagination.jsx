import React from 'react';
import { 

   ChevronLeft, ChevronRight,  
} from 'lucide-react';

// Enhanced Pagination Component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => (
  <div className="flex items-center justify-center space-x-4 mt-8">
    <button 
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="
        p-2 rounded-full bg-black/30 
        hover:bg-accent/20 
        disabled:opacity-30 
        transition-all group
      "
    >
      <ChevronLeft 
        className="
          w-5 h-5 
          group-hover:text-accent 
          transition-colors
        " 
      />
    </button>
    <div className="
      px-4 py-2 
      bg-black/30 
      rounded-full 
      text-sm 
      flex items-center 
      space-x-2
    ">
      <span className="text-white/60">Page</span>
      <span className="text-white font-bold">{currentPage}</span>
      <span className="text-white/60">of</span>
      <span className="text-accent">{totalPages}</span>
    </div>
    <button 
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="
        p-2 rounded-full bg-black/30 
        hover:bg-accent/20 
        disabled:opacity-30 
        transition-all group
      "
    >
      <ChevronRight 
        className="
          w-5 h-5 
          group-hover:text-accent 
          transition-colors
        " 
      />
    </button>
  </div>
);


export default Pagination;