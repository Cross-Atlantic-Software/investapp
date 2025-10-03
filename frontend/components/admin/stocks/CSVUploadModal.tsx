import React from 'react';
import { X } from 'lucide-react';
import CSVUpload from './CSVUpload';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: number;
  stockName: string;
  onUploadSuccess?: () => void;
}

export default function CSVUploadModal({ 
  isOpen, 
  onClose, 
  stockId, 
  stockName,
  onUploadSuccess 
}: CSVUploadModalProps) {
  if (!isOpen) return null;

  const handleUploadSuccess = () => {
    onUploadSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Price Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <CSVUpload
            stockId={stockId}
            stockName={stockName}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(error) => {
              console.error('Upload error:', error);
              // Error is already handled in CSVUpload component
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
