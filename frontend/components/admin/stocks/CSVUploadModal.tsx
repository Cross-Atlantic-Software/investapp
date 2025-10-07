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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 m-0">
      <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Upload Price Data</h3>
              <p className="text-xs text-themeTealWhite mt-1">Upload CSV file with historical price data</p>
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
      </div>
    </div>
  );
}
