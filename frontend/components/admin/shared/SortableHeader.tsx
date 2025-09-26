'use client';

import React from 'react';

interface SortableHeaderProps {
  field: string;
  children: React.ReactNode;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  children,
  sortBy,
  sortOrder,
  onSort,
  className = "cursor-pointer hover:bg-themeTeal/80 transition-colors"
}) => {
  const SortIcon = () => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-themeTealWhite ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-white ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div
      className={className}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {children}
        <SortIcon />
      </div>
    </div>
  );
};

export default SortableHeader;
