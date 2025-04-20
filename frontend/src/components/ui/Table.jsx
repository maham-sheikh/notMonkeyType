import React, { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import TablePagination from './TablePagination';
import { formatTableValue } from './TableFormatter';

const Table = ({ 
  title, 
  columns, 
  data, 
  initialSortKey = null, 
  initialSortDirection = "asc"
}) => {
  const [sortConfig, setSortConfig] = useState({ 
    key: initialSortKey, 
    ascending: initialSortDirection === "asc" 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [sortConfig]);
  
  const handleSort = (key) => {
    const ascending = sortConfig.key === key ? !sortConfig.ascending : true;
    setSortConfig({ key, ascending });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-accent/30 ml-1 inline-block" />;
    return sortConfig.ascending ? 
      <FaSortUp className="text-accent ml-1 inline-block" /> : 
      <FaSortDown className="text-accent ml-1 inline-block" />;
  };
  
  const getSortedData = () => {
    if (!sortConfig.key) return [...data];
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      const type = column?.type;
      
      if (type === 'date' || sortConfig.key.toLowerCase().includes('date') || sortConfig.key.toLowerCase().includes('time')) {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        return sortConfig.ascending ? dateA - dateB : dateB - dateA;
      }
      
      if (type === 'number' || !isNaN(parseFloat(a[sortConfig.key]))) {
        const numA = parseFloat(a[sortConfig.key]);
        const numB = parseFloat(b[sortConfig.key]);
        return sortConfig.ascending ? numA - numB : numB - numA;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.ascending ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.ascending ? 1 : -1;
      }
      
      return 0;
    });
  };
  
  const sortedData = getSortedData();
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const emptyRows = Math.max(0, rowsPerPage - paginatedData.length);

  return (
    <div className="bg-black/5 backdrop-blur-xl rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-accent/70 overflow-hidden">
      <div className="relative p-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/5 rounded-full blur-xl"></div>
        
        <h2 className="text-white text-4xl font-black tracking-tight mb-8">{title}</h2>
        
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map(({ label, key }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="text-left p-4 text-white/80 font-semibold cursor-pointer hover:text-accent transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      {label} {getSortIcon(key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                <>
                  {paginatedData.map((row, rowIndex) => (
                    <tr 
                      key={rowIndex} 
                      className="hover:bg-accent/5 transition-colors duration-200"
                    >
                      {columns.map(({ key, type }) => (
                        <td 
                          key={key} 
                          className="p-4 text-white text-opacity-90 font-medium border-t border-accent/5"
                        >
                          {formatTableValue(row[key], type, key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                    <tr key={`empty-${index}`} className="h-[60px]">
                      {columns.map(({ key }) => (
                        <td key={key} className="border-t border-accent/5"></td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="p-8 text-center text-white/50 border-t border-accent/5"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {data.length > rowsPerPage && (
          <div className="mt-2">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedData.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;