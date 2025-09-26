'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import GenericSearchableMultiSelect from '@/components/admin/shared/GenericSearchableMultiSelect';
import { ActivityFormModalProps, NewActivityForm } from './types';

const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  activityTypes,
  editingItem,
  initialData,
  title,
  submitLabel,
  loading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<NewActivityForm>(
    initialData || {
      description: '',
      icon: null,
      activity_type_ids: []
    }
  );

  useEffect(() => {
    if (editingItem) {
      setFormData({
        description: editingItem.description,
        icon: null,
        activity_type_ids: editingItem.activity_types?.map(at => at.id) || []
      });
    } else if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        description: '',
        icon: null,
        activity_type_ids: []
      });
    }
  }, [editingItem, initialData, isOpen]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      description: '',
      icon: null,
      activity_type_ids: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
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
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                rows={3}
                placeholder="Enter activity description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-themeTeal mb-2">
                Activity Types
              </label>
              <GenericSearchableMultiSelect
                options={activityTypes.map(at => ({ value: at.id, label: at.name }))}
                selectedValues={formData.activity_type_ids}
                onChange={(values) => setFormData({ ...formData, activity_type_ids: values })}
                placeholder="Select activity types..."
                forceAbove={true}
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
              disabled={!formData.description || loading}
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

export default ActivityFormModal;
