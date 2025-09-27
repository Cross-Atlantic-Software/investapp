'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Loader, SortableHeader } from '@/components/admin/shared';
import { StockMasterTableProps } from './types';

const StockMasterTable: React.FC<StockMasterTableProps> = ({
  stockMasters,
  loading,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort
}) => {
  const formatDate = (dateString: string) => {
    try {
      // Handle MySQL datetime format: 2025-09-27 00:11:11
      if (!dateString) return 'N/A';
      
      // Replace space with 'T' to make it ISO format for better parsing
      const isoString = dateString.replace(' ', 'T');
      const date = new Date(isoString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="w-100 md:w-full overflow-hidden">
        <div className="flex justify-center items-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-100 md:w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-themeTealLighter">
          <thead className="bg-themeTeal">
            <tr>
              <SortableHeader
                field="id"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                ID
              </SortableHeader>
              <SortableHeader
                field="name"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Name
              </SortableHeader>
              <SortableHeader
                field="created_at"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Created At
              </SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-themeTealLighter">
            {stockMasters.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-themeTeal">
                  No stock masters found
                </td>
              </tr>
            ) : (
              stockMasters.map((stockMaster) => (
                <tr key={stockMaster.id} className="hover:bg-themeTealWhite">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {stockMaster.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {stockMaster.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {formatDate(stockMaster.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onEdit(stockMaster)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(stockMaster.id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMasterTable;
