import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { FinancialDataUploadProps } from './types';

export default function FinancialDataUpload({ stockId, stockName, onUploadSuccess }: FinancialDataUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>('income_statement');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: 'income_statement', label: 'Income Statement' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'cash_flow', label: 'Cash Flow' }
  ];

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadStatus({ status: 'uploading', message: 'Uploading CSV file...' });

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const token = sessionStorage.getItem('adminToken') || '';

      const response = await fetch(`/api/admin/stocks/${stockId}/financial-data/${selectedCategory}/upload`, {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus({
          status: 'success',
          message: `Successfully uploaded ${result.data.totalProcessed} records (${result.data.inserted} new, ${result.data.updated} updated)`
        });
        setSelectedFile(null);
        onUploadSuccess?.();
      } else {
        setUploadStatus({
          status: 'error',
          message: result.message || 'Upload failed'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        status: 'error',
        message: 'Network error. Please try again.'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus({ status: 'idle', message: '' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus({ status: 'idle', message: '' });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus({ status: 'idle', message: '' });
  };

  const uploadFile = () => {
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Financial Data for {stockName}
        </h3>
        
        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Financial Statement Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload Area */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV File
          </label>
          
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your CSV file here, or click to select
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Select CSV File
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {selectedFile && (
          <div className="flex justify-end">
            <button
              onClick={uploadFile}
              disabled={uploadStatus.status === 'uploading'}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadStatus.status === 'uploading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Upload CSV'
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus.message && (
          <div className={`mt-4 p-3 rounded-md flex items-center ${
            uploadStatus.status === 'success' 
              ? 'bg-green-50 text-green-800' 
              : uploadStatus.status === 'error'
              ? 'bg-red-50 text-red-800'
              : 'bg-blue-50 text-blue-800'
          }`}>
            {uploadStatus.status === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : uploadStatus.status === 'error' ? (
              <AlertCircle className="h-5 w-5 mr-2" />
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            )}
            {uploadStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}
