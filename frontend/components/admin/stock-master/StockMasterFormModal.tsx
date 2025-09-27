'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { StockMasterFormModalProps, NewStockMasterForm } from './types';

const StockMasterFormModal: React.FC<StockMasterFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  initialData,
  title,
  submitLabel,
  loading = false
}) => {
  const [formData, setFormData] = useState<NewStockMasterForm>(
    initialData || {
      name: ''
    }
  );

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name
      });
    } else if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: ''
      });
    }
  }, [editingItem, initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ name: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-themeTeal">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-themeTeal mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal"
              placeholder="Enter stock master name"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-themeTeal hover:bg-themeTealDark rounded-md transition duration-200 disabled:opacity-50"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMasterFormModal;
