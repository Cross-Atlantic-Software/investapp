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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 m-0">
        <div className="bg-white rounded shadow w-full max-w-4xl mx-4 mt-8 mb-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-themeTealWhite">Manage Stock Tags</h3>
            </div>
            <button
              onClick={onClose}
              className="text-themeTealWhite transition duration-300 cursor-pointer"
            >
              <X width={20} height={20}/>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Create Form */}
          <div className="mb-4">
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center px-3 py-1 text-sm bg-themeTeal text-white rounded hover:bg-themeTealDark transition duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                {isCreating ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleSubmit} className="bg-themeTealWhite p-4 rounded-lg border border-themeTealLighter">
                <div className="mb-4">
                  <label className="block text-xs font-medium text-themeTeal mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStockMaster.name}
                    onChange={(e) => setNewStockMaster({ ...newStockMaster, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
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
                    className="px-4 py-2 text-sm text-themeTeal bg-themeTealWhite border border-themeTealLighter rounded hover:bg-themeTealLighter transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-themeTeal rounded hover:bg-themeTealLight transition duration-200"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Stock Masters List */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-themeTeal uppercase tracking-wider">Existing Stock Tags</h3>
            {stockMasters.length === 0 ? (
              <div className="text-center py-16 min-h-[400px] flex flex-col items-center justify-center">
                <svg className="mx-auto h-16 w-16 text-themeTealLighter mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-themeTeal mb-2">No stock masters found</h3>
                <p className="text-sm text-themeTealLighter">Get started by adding a new stock master.</p>
              </div>
            ) : (
              <div className="bg-white rounded border border-themeTealLighter">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-themeTeal border-b border-themeTealLighter">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-themeTealLighter">
                      {stockMasters.map((stockMaster, index) => (
                        <tr 
                          key={stockMaster.id}
                          className={`hover:bg-themeTealWhite transition duration-300 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-themeTealWhite'
                          }`}
                        >
                          <td className="px-4 py-3 text-left">
                            <div className="text-sm text-themeTeal">{stockMaster.id}</div>
                          </td>
                          <td className="px-4 py-3 text-left">
                            <div className="text-sm font-medium text-themeTeal">{stockMaster.name}</div>
                          </td>
                          <td className="px-4 py-3 text-left">
                            <div className="text-sm text-themeTeal">{formatDate(stockMaster.created_at)}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleDelete(stockMaster.id)}
                                className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer"
                                title="Delete Stock Master"
                              >
                                <Trash2 width={16} height={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMasterModal;
