import React, { useState, useEffect } from 'react';
import { X, Upload, Download, Eye, Trash2, FileText } from 'lucide-react';

interface UserReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

interface ReportData {
  hasReport: boolean;
  filename?: string;
  s3Url?: string;
}

export default function UserReportModal({ isOpen, onClose, userId, userName }: UserReportModalProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReportData();
    }
  }, [isOpen, userId]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      console.log('📄 Frontend: Fetching report data for user:', userId);
      
      const response = await fetch(`/api/admin/user-report?userId=${userId}`, {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      
      console.log('📄 Frontend: Fetch response:', data);
      
      if (data.success) {
        console.log('📄 Frontend: Setting report data:', data.data);
        setReportData(data.data);
      } else {
        console.log('❌ Frontend: Fetch failed:', data.message);
      }
    } catch (error) {
      console.error('❌ Frontend: Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      const formData = new FormData();
      formData.append('report', selectedFile);

      const response = await fetch(`/api/admin/user-report?userId=${userId}`, {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchReportData(); // Refresh data
        setSelectedFile(null);
        alert('Report uploaded successfully');
      } else {
        alert(data.message || 'Failed to upload report');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      console.log('🗑️ Frontend: Starting delete request for user:', userId);
      
      const response = await fetch(`/api/admin/user-report?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      console.log('🗑️ Frontend: Delete response:', data);
      
      if (data.success) {
        console.log('✅ Frontend: Delete successful, refreshing data...');
        await fetchReportData(); // Refresh data
        console.log('✅ Frontend: Data refreshed, showing success message');
        alert('Report deleted successfully');
      } else {
        console.log('❌ Frontend: Delete failed:', data.message);
        alert(data.message || 'Failed to delete report');
      }
    } catch (error) {
      console.error('❌ Frontend: Error deleting report:', error);
      alert('Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (reportData?.s3Url) {
      try {
        // Fetch the PDF file
        const response = await fetch(reportData.s3Url);
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Extract filename from URL or use a default name
        const filename = reportData.filename || `user-${userId}-report.pdf`;
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading report:', error);
        alert('Failed to download report');
      }
    }
  };

  const handleView = () => {
    if (reportData?.s3Url) {
      window.open(reportData.s3Url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-themeTeal">
            Report Management - {userName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Report Status */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-themeTeal mb-3">Current Report</h3>
              
              {reportData?.hasReport ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-themeTeal" />
                    <span className="font-medium">{reportData.filename}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleView}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No report uploaded yet</p>
              )}
            </div>

            {/* Upload New Report */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-themeTeal mb-3">Upload New Report</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-themeTeal bg-themeTealWhite' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-themeTeal font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop a PDF file here, or click to select
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-themeTeal text-white rounded hover:bg-themeSkyBlue transition-colors cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
              
              {selectedFile && (
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-themeTeal text-white rounded hover:bg-themeSkyBlue transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Report'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
