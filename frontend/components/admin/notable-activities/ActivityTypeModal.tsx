'use client';

import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { ActivityTypeModalProps } from './types';

const ActivityTypeModal: React.FC<ActivityTypeModalProps> = ({
  isOpen,
  onClose,
  activityTypes,
  onCreateActivityType,
  onDeleteActivityType,
  newActivityType,
  setNewActivityType
}) => {
  const handleSubmit = () => {
    onCreateActivityType(newActivityType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 m-0">
      <div className="bg-white rounded w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Manage Activity Types</h2>
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
          {/* Create New Activity Type */}
          <div className="mb-6 p-4 border border-themeTealLighter rounded">
            <h3 className="text-lg font-semibold text-themeTeal mb-3">Create New Activity Type</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newActivityType.name}
                onChange={(e) => setNewActivityType({ name: e.target.value })}
                placeholder="Activity type name..."
                className="input-theme"
              />
              <button
                onClick={handleSubmit}
                disabled={!newActivityType.name.trim()}
                className="buttonStyle"
              >
                Create
              </button>
            </div>
          </div>

          {/* Activity Types List */}
          <div>
            <h3 className="text-lg font-semibold text-themeTeal mb-3">Existing Activity Types</h3>
            <div className="space-y-2">
              {activityTypes.map((activityType) => (
                <div key={activityType.id} className="flex items-center justify-between p-3 border border-themeTealLighter rounded">
                  <span className="text-themeTeal text-sm font-medium">{activityType.name}</span>
                  <button
                    onClick={() => onDeleteActivityType(activityType.id)}
                    className="text-red-600 hover:text-red-900 text-sm transition duration-300 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {activityTypes.length === 0 && (
                <p className="text-themeTeal text-center py-4">No activity types found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTypeModal;
