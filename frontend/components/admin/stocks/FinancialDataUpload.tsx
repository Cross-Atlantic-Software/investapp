import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react';
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
  const [dataExists, setDataExists] = useState<{[key: string]: boolean}>({
    income_statement: false,
    balance_sheet: false,
    cash_flow: false
  });
  const [checkingData, setCheckingData] = useState(false);

  const categories = [
    { value: 'income_statement', label: 'Income Statement' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'cash_flow', label: 'Cash Flow' }
  ];

  // Check if financial data exists for all categories
  const checkDataExists = async () => {
    setCheckingData(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const newDataExists = { ...dataExists };
      
      for (const category of categories) {
        const response = await fetch(`/api/admin/stocks/${stockId}/financial-data/${category.value}/exists`, {
          method: 'GET',
          headers: {
            'token': token,
          },
        });

        if (response.ok) {
          const result = await response.json();
          newDataExists[category.value] = result.success && result.data?.exists;
        }
      }
      
      setDataExists(newDataExists);
    } catch (error) {
      console.error('Error checking data existence:', error);
    } finally {
      setCheckingData(false);
    }
  };

  // Check for existing data when component mounts
  useEffect(() => {
    checkDataExists();
  }, [stockId]);

  // Handle CSV download for a specific category
  const handleDownloadCSV = async (category: string) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/stocks/${stockId}/financial-data/${category}/export`, {
        method: 'GET',
        headers: {
          'token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      // Get the CSV content
      const csvContent = await response.text();
      
      // Create a blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock_${stockId}_${category}_data.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setUploadStatus({
        status: 'error',
        message: `Failed to download ${category.replace('_', ' ')} CSV`
      });
    }
  };

  // Handle CSV delete for a specific category
  const handleDeleteCSV = async (category: string) => {
    const categoryName = category.replace('_', ' ');
    if (!window.confirm(`Are you sure you want to delete all ${categoryName} data for this stock? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/stocks/${stockId}/financial-data/${category}/delete`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete CSV data');
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadStatus({
          status: 'success',
          message: `${categoryName} data deleted successfully`
        });
        // Refresh data existence check after successful deletion
        checkDataExists();
        onUploadSuccess?.();
      } else {
        throw new Error(result.message || 'Failed to delete data');
      }
    } catch (error) {
      console.error('Error deleting CSV:', error);
      setUploadStatus({
        status: 'error',
        message: `Failed to delete ${categoryName} data`
      });
    }
  };

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
        // Refresh data existence check after successful upload
        checkDataExists();
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
      <div className="bg-white rounded border border-themeTealLighter p-4">
        <h3 className="text-lg font-semibold text-themeTeal mb-4">
          Upload Financial Data for {stockName}
        </h3>
        
        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm text-themeTealLight mb-2">
            Financial Statement Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-theme"
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
          <label className="block text-sm text-themeTealLight mb-2">
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
              <p className="text-sm text-themeTealLighter mb-2">
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
                className="inline-flex items-center px-4 py-2 border border-themeTealLighter rounded text-sm text-themeTealLight bg-themeTealLighter transition duration-300 text-themeTealWhite cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Select CSV File
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-themeTealWhite rounded">
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

        {/* Download and Delete Buttons Section - Only show if there's data or checking */}
        {(checkingData || Object.values(dataExists).some(exists => exists)) && (
          <div className="mt-6 pt-6 border-t border-themeTealLighter">
            <h4 className="text-sm font-medium text-themeTeal mb-3">Manage Existing Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div key={category.value} className="flex flex-col gap-2">
                  {/* Only show buttons if data exists for this category or checking */}
                  {(checkingData || dataExists[category.value]) && (
                    <>
                      <button
                        onClick={() => handleDownloadCSV(category.value)}
                        disabled={!dataExists[category.value] || uploadStatus.status === 'uploading' || checkingData}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded text-sm font-medium transition-colors ${
                          dataExists[category.value] && !checkingData
                            ? 'bg-themeTeal text-white hover:bg-themeSkyBlue disabled:opacity-50'
                            : 'bg-themeTealLighter text-themeTealWhite cursor-not-allowed'
                        }`}
                      >
                        {checkingData ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {checkingData ? 'Checking...' : `Download ${category.label}`}
                      </button>
                      <button
                        onClick={() => handleDeleteCSV(category.value)}
                        disabled={!dataExists[category.value] || uploadStatus.status === 'uploading' || checkingData}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded text-sm font-medium transition-colors ${
                          dataExists[category.value] && !checkingData
                            ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete {category.label}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            {!checkingData && Object.values(dataExists).every(exists => !exists) && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                No financial data available
              </p>
            )}
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
