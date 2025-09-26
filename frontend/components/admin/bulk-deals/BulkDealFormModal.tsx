'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Types
interface BulkDeal {
  id: number;
  icon: string;
  value: string;
  label: string;
  created_at: string;
  updated_at: string;
}

interface NewBulkDealForm {
  value: string;
  label: string;
  icon: File | null;
}

interface BulkDealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewBulkDealForm) => void;
  editingItem?: BulkDeal | null;
  title: string;
  submitLabel: string;
  loading?: boolean;
}

const BulkDealFormModal: React.FC<BulkDealFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  title,
  submitLabel,
  loading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<NewBulkDealForm>({
    value: '',
    label: '',
    icon: null
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        value: editingItem.value,
        label: editingItem.label,
        icon: null
      });
    } else {
      setFormData({
        value: '',
        label: '',
        icon: null
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      value: '',
      label: '',
      icon: null
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-themeTealWhite transition duration-300 cursor-pointer"
            >
              <X width={20} height={20}/>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-themeTeal mb-2">
                Value
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                placeholder="Enter value (e.g., ₹50 Cr, 100+ Deals)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-themeTeal mb-2">
                Label
              </label>
              <textarea
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                rows={3}
                placeholder="Enter label description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-themeTeal mb-2">
                Icon
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, icon: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
              />
              {editingItem?.icon && (
                <div className="mt-2">
                  <p className="text-sm text-themeTeal">Current icon:</p>
                  <img src={editingItem.icon} alt="Current icon" className="h-8 w-8 rounded-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 flex-shrink-0 border-t border-themeTealLighter">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-themeTeal border border-themeTealLighter rounded-md hover:bg-themeTealWhite transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.value || !formData.label || loading}
              className="px-4 py-2 bg-themeTeal text-white rounded-md hover:bg-themeSkyBlue disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Processing...' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkDealFormModal;
