'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader, NotificationContainer, NotificationData, ConfirmationModal, SortableHeader, createSortHandler } from '@/components/admin/shared';
import { Search, Trash2 } from 'lucide-react';

interface SiteUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: number;
  auth_provider: string;
  email_verified: number;
  phone_verified: number;
  country_code: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function SiteUsersPage() {
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Refs to store current values to avoid dependency issues
  const searchRef = useRef(search);
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);

  // Update refs when values change
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    sortOrderRef.current = sortOrder;
  }, [sortOrder]);

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Sort handler using the utility function
  const handleSort = createSortHandler(setSortBy, setSortOrder);

  const fetchUsers = useCallback(async (page: number = 1, showLoading: boolean = true) => {
    try {
      // Only show loading on initial load, not when sorting
      if (showLoading && sortByRef.current === 'createdAt' && sortOrderRef.current === 'desc') setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchRef.current,
        sort_by: sortByRef.current,
        sort_order: sortOrderRef.current.toUpperCase()
      });

      const response = await fetch(`/api/admin/site-users?${params.toString()}`, {
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        console.error('Error fetching site users:', data.message);
        // Use a stable notification function
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { 
          id, 
          type: 'error', 
          title: 'Error', 
          message: data.message || 'Failed to fetch site users', 
          duration: 5000 
        }]);
      }
    } catch (error) {
      console.error('Error fetching site users:', error);
      // Use a stable notification function
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { 
        id, 
        type: 'error', 
        title: 'Error', 
        message: 'Failed to fetch site users', 
        duration: 5000 
      }]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []); // No dependencies - completely stable

  // Initial load effect
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array - only run on mount

  // Sorting effect
  useEffect(() => {
    if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
      fetchUsers(1, false); // Don't show loading for sorting
    }
  }, [sortBy, sortOrder]); // Remove fetchUsers from dependencies

  // Debounced search effect
  useEffect(() => {
    if (search) {
      setIsSearching(true);
    }
    
    const timeoutId = setTimeout(() => {
      fetchUsers(1, false); // Don't show loading for search
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [search]); // Remove fetchUsers from dependencies

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };


  const handleDeleteUser = async (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/site-users/${userToDelete}`, {
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
          message: 'User deleted successfully',
          duration: 5000
        });
        fetchUsers(pagination.currentPage);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to delete user',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete user',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        Inactive
      </span>
    );
  };

  const getVerifiedBadge = (verified: number) => {
    return verified === 1 ? (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        Verified
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
        Not Verified
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 overflow-x-hidden relative">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" text="Loading site users..." />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-themeTeal">Site Users</h1>
            <p className="text-sm text-themeTealLight">Manage registered site users and their information.</p>
          </div>

          {/* Search Section */}
          <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-themeTeal">
                  All users <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{pagination.totalCount}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal placeholder:text-themeTealLighter"
                />
                {isSearching ? (
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-themeTeal animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-themeTealLighter"/>
                )}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="w-100 md:w-full overflow-hidden">
            <div className="bg-white rounded border border-themeTealLighter">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-themeTeal border-b border-themeTealLighter">
                    <tr>
                      <SortableHeader
                        field="first_name"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        User Name
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                        Email Verified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                        Auth Provider
                      </th>
                      <SortableHeader
                        field="createdAt"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Date Added
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-themeTealLighter">
                    {users.map((user) => (
                      <tr key={user.id} className="">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-themeTeal flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-themeTealWhite">
                                {user.first_name?.[0] || user.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-themeTeal">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-xs text-themeTealLighter truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-themeTeal">
                            {user.country_code} {user.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getVerifiedBadge(user.email_verified)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {user.auth_provider}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer flex gap-1"
                              title="Delete User"
                            >
                              <Trash2 width={16} height={16}/>
                              <span className="text-xs font-medium">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                          </span>{' '}
                          of <span className="font-medium">{pagination.totalCount}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.currentPage
                                  ? 'z-10 bg-themeTeal border-themeTeal text-white'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}