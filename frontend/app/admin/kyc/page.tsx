'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, CheckCircle, XCircle, Trash2, Download } from 'lucide-react';
import { NotificationContainer, NotificationData } from '@/components/admin/shared/Notification';
import Loader from '@/components/admin/shared/Loader';

interface KYCApplication {
  id: number;
  user_id: number;
  pan_number: string;
  name_pan: string;
  dob: string;
  father_name: string;
  residency_status: 'Indian' | 'NRI';
  aadhar_number: string;
  account_number: string;
  ifsc_code: string;
  bank_proof: string;
  demat_type: string;
  demat_account_id: string;
  sign: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

interface KYCStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export default function KYCPage() {
  const [kycApplications, setKycApplications] = useState<KYCApplication[]>([]);
  const [stats, setStats] = useState<KYCStats>({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [selectedKYC, setSelectedKYC] = useState<KYCApplication | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Refs to store current values to avoid circular dependencies
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  const statusFilterRef = useRef(statusFilter);

  // Update refs when values change
  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    sortOrderRef.current = sortOrder;
  }, [sortOrder]);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Fetch KYC applications
  const fetchKYCApplications = useCallback(async (page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (statusFilterRef.current) {
        params.append('status', statusFilterRef.current);
      }
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      params.append('sort_by', sortByRef.current);
      params.append('sort_order', sortOrderRef.current.toUpperCase());

      const response = await fetch(`/api/admin/kyc?${params.toString()}`, {
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setKycApplications(data.data.kycApplications);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to fetch KYC applications'
        });
      }
    } catch (error) {
      console.error('Error fetching KYC applications:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch KYC applications'
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [searchTerm, itemsPerPage]);

  // Fetch KYC stats
  const fetchKYCStats = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch('/api/admin/kyc/stats', {
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching KYC stats:', error);
    }
  }, []);

  // Update KYC status
  const updateKYCStatus = async (id: number, status: 'verified' | 'rejected') => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/kyc/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: `KYC application ${status} successfully`
        });
        fetchKYCApplications(currentPage, false);
        fetchKYCStats();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to update KYC status'
        });
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update KYC status'
      });
    }
  };

  // Delete KYC application
  const deleteKYCApplication = async (id: number) => {
    if (!confirm('Are you sure you want to delete this KYC application?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/kyc/${id}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'KYC application deleted successfully'
        });
        fetchKYCApplications(currentPage, false);
        fetchKYCStats();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to delete KYC application'
        });
      }
    } catch (error) {
      console.error('Error deleting KYC application:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete KYC application'
      });
    }
  };

  // View KYC application
  const viewKYCApplication = (kyc: KYCApplication) => {
    setSelectedKYC(kyc);
    setShowViewModal(true);
  };

  // Download file
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      // Extract file extension from the S3 URL
      const urlParts = filePath.split('/');
      const originalFileName = urlParts[urlParts.length - 1];
      const fileExtension = originalFileName.split('.').pop()?.toLowerCase();
      
      // Create proper filename with extension
      const downloadFileName = fileName.includes('.') ? fileName : `${fileName}.${fileExtension}`;
      
      console.log('Downloading file:', {
        filePath,
        originalFileName,
        fileExtension,
        downloadFileName
      });
      
      // For S3 files, we need to fetch and create a blob
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log('ArrayBuffer size:', arrayBuffer.byteLength);
      
      // Force correct MIME type based on file extension
      let correctMimeType = 'application/octet-stream';
      if (fileExtension) {
        switch (fileExtension) {
          case 'pdf':
            correctMimeType = 'application/pdf';
            break;
          case 'jpg':
          case 'jpeg':
            correctMimeType = 'image/jpeg';
            break;
          case 'png':
            correctMimeType = 'image/png';
            break;
          default:
            correctMimeType = 'application/octet-stream';
        }
      }
      
      console.log('Forcing MIME type:', correctMimeType);
      
      // Create blob with forced MIME type
      const blob = new Blob([arrayBuffer], { type: correctMimeType });
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: try direct link
      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Initial load
  useEffect(() => {
    fetchKYCApplications();
    fetchKYCStats();
  }, [fetchKYCApplications, fetchKYCStats]);

  // Handle search
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    fetchKYCApplications(1);
  }, [fetchKYCApplications]);

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setTimeout(() => {
      fetchKYCApplications(1);
    }, 0);
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setTimeout(() => {
      fetchKYCApplications(currentPage);
    }, 0);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchKYCApplications(page);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KYC Management</h1>
        <p className="text-gray-600">Manage KYC applications and verifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by PAN, Name, Aadhaar, or Account Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* KYC Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('user_id')}
                    >
                      User ID
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name_pan')}
                    >
                      Name
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('pan_number')}
                    >
                      PAN Number
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('residency_status')}
                    >
                      Residency
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kycApplications.map((kyc) => (
                    <tr key={kyc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kyc.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kyc.name_pan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kyc.pan_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          kyc.residency_status === 'Indian' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {kyc.residency_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(kyc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(kyc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewKYCApplication(kyc)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {kyc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateKYCStatus(kyc.id, 'verified')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Verify"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateKYCStatus(kyc.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteKYCApplication(kyc.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">KYC Application Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name (as per PAN)</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.name_pan}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.pan_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedKYC.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.father_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Residency Status</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedKYC.residency_status === 'Indian' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedKYC.residency_status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.aadhar_number}</p>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Banking Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.account_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.ifsc_code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Demat Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.demat_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Demat Account ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedKYC.demat_account_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedKYC.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Bank Proof</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(selectedKYC.bank_proof, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Document
                      </button>
                      <button
                        onClick={() => downloadFile(selectedKYC.bank_proof, 'Bank Proof')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Signature</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(selectedKYC.sign, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Document
                      </button>
                      <button
                        onClick={() => downloadFile(selectedKYC.sign, 'Signature')}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedKYC.status === 'pending' && (
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => {
                      updateKYCStatus(selectedKYC.id, 'verified');
                      setShowViewModal(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Verify Application
                  </button>
                  <button
                    onClick={() => {
                      updateKYCStatus(selectedKYC.id, 'rejected');
                      setShowViewModal(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
