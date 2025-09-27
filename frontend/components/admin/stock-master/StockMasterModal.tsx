'use client';

import React, { useState } from 'react';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
import { StockMasterItem, NewStockMasterForm } from './types';

interface StockMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockMasters: StockMasterItem[];
  onCreateStockMaster: (data: NewStockMasterForm) => void;
  onDeleteStockMaster: (id: number) => void;
  newStockMaster: NewStockMasterForm;
  setNewStockMaster: (data: NewStockMasterForm) => void;
}

const StockMasterModal: React.FC<StockMasterModalProps> = ({
  isOpen,
  onClose,
  stockMasters,
  onCreateStockMaster,
  onDeleteStockMaster,
  newStockMaster,
  setNewStockMaster
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStockMaster.name.trim()) {
      onCreateStockMaster(newStockMaster);
      setNewStockMaster({ name: '' });
      setIsCreating(false);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this stock master?')) {
      onDeleteStockMaster(id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle MySQL datetime format: 2025-09-27 00:11:11
      if (!dateString || dateString === null || dateString === undefined) {
        console.log('Date string is null/undefined:', dateString);
        return 'N/A';
      }
      
      console.log('Formatting date:', dateString);
      
      // Replace space with 'T' to make it ISO format for better parsing
      const isoString = dateString.replace(' ', 'T');
      const date = new Date(isoString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date after parsing:', isoString);
        return 'Invalid Date';
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'Invalid Date';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-themeTeal">Manage Stock Masters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Create Form */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-themeTeal">Add New Stock Master</h3>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center px-3 py-1 text-sm bg-themeTeal text-white rounded hover:bg-themeTealDark transition duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                {isCreating ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-themeTeal mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStockMaster.name}
                    onChange={(e) => setNewStockMaster({ ...newStockMaster, name: e.target.value })}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal"
                    placeholder="Enter stock master name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewStockMaster({ name: '' });
                    }}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-themeTeal rounded hover:bg-themeTealDark transition duration-200"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Stock Masters List */}
          <div>
            <h3 className="text-lg font-medium text-themeTeal mb-4">Existing Stock Masters</h3>
            {stockMasters.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No stock masters found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stockMasters.map((stockMaster) => (
                      <tr key={stockMaster.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stockMaster.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stockMaster.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(stockMaster.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDelete(stockMaster.id)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMasterModal;
