import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface CSVUploadProps {
  stockId: number;
  stockName: string;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

interface UploadStatus {
  isUploading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
  recordsProcessed?: number;
}

export default function CSVUpload({ stockId, stockName, onUploadSuccess, onUploadError }: CSVUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    isSuccess: false,
    isError: false,
    message: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setUploadStatus({
        isUploading: false,
        isSuccess: false,
        isError: true,
        message: 'Please select a CSV file'
      });
      onUploadError?.('Invalid file type. Please select a CSV file.');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        isUploading: false,
        isSuccess: false,
        isError: true,
        message: 'File size too large. Maximum 10MB allowed.'
      });
      onUploadError?.('File size too large. Maximum 10MB allowed.');
      return;
    }

    setUploadStatus({
      isUploading: true,
      isSuccess: false,
      isError: false,
      message: 'Uploading CSV file...'
    });

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/stocks/${stockId}/price-data/upload`, {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus({
          isUploading: false,
          isSuccess: true,
          isError: false,
          message: result.message,
          recordsProcessed: result.data?.recordsProcessed
        });
        onUploadSuccess?.();
      } else {
        setUploadStatus({
          isUploading: false,
          isSuccess: false,
          isError: true,
          message: result.message || 'Upload failed'
        });
        onUploadError?.(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        isUploading: false,
        isSuccess: false,
        isError: true,
        message: 'Network error. Please try again.'
      });
      onUploadError?.('Network error. Please try again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const resetUploadStatus = () => {
    setUploadStatus({
      isUploading: false,
      isSuccess: false,
      isError: false,
      message: ''
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Upload Price Data
        </h3>
        {uploadStatus.message && (
          <button
            onClick={resetUploadStatus}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Upload CSV file with historical price data for <strong>{stockName}</strong>
        </p>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">Expected CSV format:</p>
          <p>Date,Open,High,Low,Close*,Volume</p>
          <p className="mt-1 text-gray-400">
            *Date should be in Excel serial number format (e.g., 45807)
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : uploadStatus.isError
            ? 'border-red-300 bg-red-50'
            : uploadStatus.isSuccess
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadStatus.isUploading}
        />

        {uploadStatus.isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : uploadStatus.isSuccess ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-sm text-green-600 font-medium">
              Upload Successful!
            </p>
            {uploadStatus.recordsProcessed && (
              <p className="text-xs text-green-500 mt-1">
                {uploadStatus.recordsProcessed} records processed
              </p>
            )}
          </div>
        ) : uploadStatus.isError ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-sm text-red-600 font-medium">
              Upload Failed
            </p>
            <p className="text-xs text-red-500 mt-1">
              {uploadStatus.message}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              Drop CSV file here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 10MB
            </p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {uploadStatus.message && !uploadStatus.isUploading && (
        <div className={`mt-4 p-3 rounded-md ${
          uploadStatus.isSuccess 
            ? 'bg-green-50 text-green-700' 
            : uploadStatus.isError 
            ? 'bg-red-50 text-red-700' 
            : 'bg-gray-50 text-gray-700'
        }`}>
          <div className="flex items-center">
            {uploadStatus.isSuccess ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : uploadStatus.isError ? (
              <AlertCircle className="w-4 h-4 mr-2" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm">{uploadStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
