'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, CheckCircle, XCircle, Trash2, Download, User, FileText, Calendar, Globe, CreditCard, Building, X } from 'lucide-react';
import { NotificationContainer, NotificationData } from '@/components/admin/shared/Notification';
import Loader from '@/components/admin/shared/Loader';
import ConfirmationModal from '@/components/admin/shared/ConfirmationModal';

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
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });
  const [statusConfirmationModal, setStatusConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
    kycName?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info',
    kycName: ''
  });
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

  // Update KYC status with confirmation
  const confirmUpdateKYCStatus = (id: number, status: 'verified' | 'rejected', kycName: string) => {
    const action = status === 'verified' ? 'approve' : 'reject';
    const actionTitle = status === 'verified' ? 'Approve' : 'Reject';
    
    setStatusConfirmationModal({
      isOpen: true,
      title: `${actionTitle} KYC Application`,
      message: `Are you sure you want to ${action} the KYC application for "${kycName}"? This action will ${status === 'verified' ? 'approve' : 'reject'} their application and cannot be undone.`,
      type: status === 'verified' ? 'info' : 'warning',
      kycName: kycName,
      onConfirm: () => performUpdateKYCStatus(id, status)
    });
  };

  // Perform the actual KYC status update
  const performUpdateKYCStatus = async (id: number, status: 'verified' | 'rejected') => {
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
  const deleteKYCApplication = (id: number) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete KYC Application',
      message: 'Are you sure you want to delete this KYC application? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => performDeleteKYC(id)
    });
  };

  const performDeleteKYC = async (id: number) => {

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

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
      type: 'danger'
    });
  };

  const closeStatusConfirmationModal = () => {
    setStatusConfirmationModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
      type: 'info',
      kycName: ''
    });
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
    <div className="space-y-6 relative overflow-hidden">
      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" text="Loading KYC applications..." />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-themeTeal">KYC Management</h1>
            <p className="text-sm text-themeTealLight">Manage KYC applications and verifications here.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-themeTealLighter">
              <div className="flex items-center">
                <div className="p-2 bg-themeTeal/10 rounded-lg">
                  <div className="w-6 h-6 bg-themeTeal rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-themeTeal">Total Applications</p>
                  <p className="text-2xl font-bold text-themeTeal">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-themeTealLighter">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <div className="w-6 h-6 bg-yellow-600 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-themeTeal">Pending</p>
                  <p className="text-2xl font-bold text-themeTeal">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-themeTealLighter">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-themeTeal">Verified</p>
                  <p className="text-2xl font-bold text-themeTeal">{stats.verified}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-themeTealLighter">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <div className="w-6 h-6 bg-red-600 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-themeTeal">Rejected</p>
                  <p className="text-2xl font-bold text-themeTeal">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-themeTeal">
                  All Applications <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{kycApplications.length}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by PAN, Name, Aadhaar, or Account Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal placeholder:text-themeTealLighter"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-themeTealLighter"/>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 h-4 w-4 text-themeTealLight hover:text-themeTealLighter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* KYC Applications Table */}
          <div className="bg-white rounded-lg shadow-sm border border-themeTealLighter overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-themeTealLighter">
                <thead className="bg-themeTealWhite">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider cursor-pointer hover:bg-themeTealLighter transition duration-300"
                      onClick={() => handleSort('user_id')}
                    >
                      User ID
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider cursor-pointer hover:bg-themeTealLighter transition duration-300"
                      onClick={() => handleSort('name_pan')}
                    >
                      Name
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider cursor-pointer hover:bg-themeTealLighter transition duration-300"
                      onClick={() => handleSort('pan_number')}
                    >
                      PAN Number
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider cursor-pointer hover:bg-themeTealLighter transition duration-300"
                      onClick={() => handleSort('residency_status')}
                    >
                      Residency
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider cursor-pointer hover:bg-themeTealLighter transition duration-300"
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider cursor-pointer hover:bg-themeTealLighter transition duration-300"
                      onClick={() => handleSort('createdAt')}
                    >
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-themeTealLighter">
                  {kycApplications.map((kyc, index) => (
                    <tr 
                      key={kyc.id} 
                      className={`hover:bg-themeTealWhite transition duration-300 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-themeTealWhite'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                        {kyc.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                        {kyc.name_pan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                        {kyc.pan_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                        {new Date(kyc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewKYCApplication(kyc)}
                            className="p-2 text-themeTeal bg-themeTealWhite rounded transition duration-300 hover:bg-themeTeal hover:text-white cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {kyc.status === 'pending' && (
                            <>
                              <button
                                onClick={() => confirmUpdateKYCStatus(kyc.id, 'verified', kyc.name_pan)}
                                className="p-2 text-green-600 bg-green-50 rounded transition duration-300 hover:bg-green-100 cursor-pointer"
                                title="Verify"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => confirmUpdateKYCStatus(kyc.id, 'rejected', kyc.name_pan)}
                                className="p-2 text-red-600 bg-red-50 rounded transition duration-300 hover:bg-red-100 cursor-pointer"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteKYCApplication(kyc.id)}
                            className="p-2 text-red-600 bg-red-50 rounded transition duration-300 hover:bg-red-100 cursor-pointer"
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

          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-themeTealLighter rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-themeTealWhite text-themeTeal transition duration-300"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-themeTeal">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-themeTealLighter rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-themeTealWhite text-themeTeal transition duration-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedKYC && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 m-0">
          <div className="bg-white rounded shadow w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-themeTealWhite">
                      {selectedKYC.name_pan.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-themeTealWhite">KYC Application Details</h3>
                    <p className="text-sm text-themeTealLighter">ID: #{selectedKYC.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedKYC.status === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedKYC.status === 'rejected' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedKYC.status.charAt(0).toUpperCase() + selectedKYC.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-themeTeal mb-4">Personal Information</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <User className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Name (as per PAN)</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.name_pan}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FileText className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">PAN Number</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.pan_number}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Calendar className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Date of Birth</div>
                          <div className="text-sm text-themeTealLight">{new Date(selectedKYC.dob).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <User className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Father&apos;s Name</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.father_name}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Globe className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Residency Status</div>
                          <div className="text-sm text-themeTealLight">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              selectedKYC.residency_status === 'Indian' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {selectedKYC.residency_status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CreditCard className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Aadhaar Number</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.aadhar_number}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-themeTeal mb-4">Banking Information</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Building className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Account Number</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.account_number}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FileText className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">IFSC Code</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.ifsc_code}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CreditCard className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Demat Type</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.demat_type}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <FileText className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Demat Account ID</div>
                          <div className="text-sm text-themeTealLight">{selectedKYC.demat_account_id}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CheckCircle className='text-themeTealLight'/>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-themeTeal">Status</div>
                          <div className="text-sm text-themeTealLight">
                            {getStatusBadge(selectedKYC.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-themeTeal mb-6">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-themeTealWhite border border-themeTealLighter rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0">
                        <FileText className='text-themeTeal'/>
                      </div>
                      <h5 className="font-medium text-themeTeal">Bank Proof</h5>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.open(selectedKYC.bank_proof, '_blank')}
                        className="text-themeTeal hover:text-themeTealLight text-sm font-medium transition-colors duration-200"
                      >
                        View Document
                      </button>
                      <button
                        onClick={() => downloadFile(selectedKYC.bank_proof, 'Bank Proof')}
                        className="text-themeTeal hover:text-themeTealLight text-sm font-medium transition-colors duration-200 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="bg-themeTealWhite border border-themeTealLighter rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-shrink-0">
                        <FileText className='text-themeTeal'/>
                      </div>
                      <h5 className="font-medium text-themeTeal">Signature</h5>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.open(selectedKYC.sign, '_blank')}
                        className="text-themeTeal hover:text-themeTealLight text-sm font-medium transition-colors duration-200"
                      >
                        View Document
                      </button>
                      <button
                        onClick={() => downloadFile(selectedKYC.sign, 'Signature')}
                        className="text-themeTeal hover:text-themeTealLight text-sm font-medium transition-colors duration-200 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedKYC.status === 'pending' && (
                <div className="mt-8 pt-6 border-t border-themeTealLighter">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        confirmUpdateKYCStatus(selectedKYC.id, 'verified', selectedKYC.name_pan);
                        setShowViewModal(false);
                      }}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Verify Application
                    </button>
                    <button
                      onClick={() => {
                        confirmUpdateKYCStatus(selectedKYC.id, 'rejected', selectedKYC.name_pan);
                        setShowViewModal(false);
                      }}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Reject Application
                    </button>
                  </div>
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
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={() => {
          confirmationModal.onConfirm();
          closeConfirmationModal();
        }}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Status Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusConfirmationModal.isOpen}
        onClose={closeStatusConfirmationModal}
        onConfirm={() => {
          statusConfirmationModal.onConfirm();
          closeStatusConfirmationModal();
        }}
        title={statusConfirmationModal.title}
        message={statusConfirmationModal.message}
        type={statusConfirmationModal.type}
        confirmText={statusConfirmationModal.type === 'info' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
      />
    </div>
  );
}
