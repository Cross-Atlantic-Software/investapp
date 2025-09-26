'use client';

/**
 * Utility functions for sorting data with case-insensitive alphabetical sorting
 */

export interface SortConfig {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Creates a sort handler function that handles case-insensitive alphabetical sorting
 * @param setSortBy - Function to set the sort field
 * @param setSortOrder - Function to set the sort order
 * @param defaultSortField - Default field to sort by (usually 'createdAt')
 * @returns Function to handle sort clicks
 */
export const createSortHandler = (
  setSortBy: (field: string) => void,
  setSortOrder: (order: 'asc' | 'desc') => void,
  defaultSortField: string = 'createdAt'
) => {
  return (field: string) => {
    setSortBy(field);
    // Default to descending for date fields, ascending for name fields
    const isDateField = field.includes('date') || field.includes('Date') || field === 'createdAt' || field === 'updatedAt';
    setSortOrder(isDateField ? 'desc' : 'asc');
  };
};

/**
 * Gets the backend sort parameters for API calls
 * @param sortBy - Current sort field
 * @param sortOrder - Current sort order
 * @returns Object with sort_by and sort_order for API calls
 */
export const getSortParams = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  return {
    sort_by: sortBy,
    sort_order: sortOrder.toUpperCase()
  };
};

/**
 * Case-insensitive string comparison for alphabetical sorting
 * This ensures that "Apple" comes before "banana" regardless of case
 */
export const caseInsensitiveCompare = (a: string, b: string): number => {
  return a.toLowerCase().localeCompare(b.toLowerCase());
};

/**
 * Sort data array with case-insensitive alphabetical sorting for name fields
 * @param data - Array of data to sort
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order (asc/desc)
 * @returns Sorted array
 */
export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): T[] => {
  return [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
    if (bValue == null) return sortOrder === 'asc' ? 1 : -1;
    
    // Case-insensitive alphabetical sorting for string fields
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = caseInsensitiveCompare(aValue, bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }
    
    // Default comparison for numbers and dates
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};
