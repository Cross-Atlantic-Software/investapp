'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Loader, NotificationContainer, NotificationData, ConfirmationModal } from '@/components/admin/shared';
import { BulkDealFormModal } from '@/components/admin/bulk-deals';

// Types
interface BulkDeal {
  id: number;
  icon: string;
  value: string;
  label: string;
  created_at: string;
  updated_at: string;
}

interface NewBulkDealForm {
  value: string;
  label: string;
  icon: File | null;
}

interface BulkDealsResponse {
  success: boolean;
  message: string;
  data: {
    bulkDeals: BulkDeal[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBulkDeals: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export default function BulkDealsPage() {
  const [bulkDeals, setBulkDeals] = useState<BulkDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<number | null>(null);
  const [editingDeal, setEditingDeal] = useState<BulkDeal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Refs to store current values
  const currentPageRef = useRef(currentPage);
  const searchTermRef = useRef(searchTerm);
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  
  // Update refs when values change
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { searchTermRef.current = searchTerm; }, [searchTerm]);
  useEffect(() => { sortByRef.current = sortBy; }, [sortBy]);
  useEffect(() => { sortOrderRef.current = sortOrder; }, [sortOrder]);

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchBulkDeals = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPageRef.current.toString(),
        limit: itemsPerPage.toString(),
        search: searchTermRef.current,
        sort_by: sortByRef.current,
        sort_order: sortOrderRef.current
      });

      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/bulk-deals?${params}`, {
        headers: {
          'token': token,
        },
      });
      const data: BulkDealsResponse = await response.json();

      if (data.success) {
        setBulkDeals(data.data.bulkDeals);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.totalBulkDeals);
      } else {
        addNotification({
          type: 'error',
          title: 'Fetch Failed',
          message: 'Failed to fetch bulk deals',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching bulk deals:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch bulk deals',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/bulk-deals/${id}`, {
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
          message: 'Bulk deal deleted successfully',
          duration: 3000
        });
        fetchBulkDeals();
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete bulk deal',
          duration: 5000
        });
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete bulk deal',
        duration: 5000
      });
    }
    setShowDeleteModal(false);
    setDealToDelete(null);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (searchTerm !== searchTermRef.current) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        fetchBulkDeals().finally(() => setIsSearching(false));
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, fetchBulkDeals]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchBulkDeals();
  }, [currentPage, sortBy, sortOrder, fetchBulkDeals]);

  const openEditModal = (deal: BulkDeal) => {
    setEditingDeal(deal);
    setShowEditModal(true);
  };

  const handleCreateBulkDeal = async (data: NewBulkDealForm) => {
    try {
      const formData = new FormData();
      formData.append('value', data.value);
      formData.append('label', data.label);
      
      if (data.icon) {
        formData.append('icon', data.icon);
      }

      const token = sessionStorage.getItem('adminToken') || '';

      const response = await fetch('/api/admin/bulk-deals', {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Bulk deal created successfully!',
          duration: 5000
        });
        setShowCreateModal(false);
        fetchBulkDeals();
      } else {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: result.message || 'Failed to create bulk deal',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating bulk deal:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Error creating bulk deal',
        duration: 5000
      });
    }
  };

  const handleEditBulkDeal = async (data: NewBulkDealForm) => {
    if (!editingDeal) return;

    try {
      const formData = new FormData();
      formData.append('value', data.value);
      formData.append('label', data.label);
      
      if (data.icon) {
        formData.append('icon', data.icon);
      }

      const token = sessionStorage.getItem('adminToken') || '';

      const response = await fetch(`/api/admin/bulk-deals/${editingDeal.id}`, {
        method: 'PUT',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Bulk deal updated successfully!',
          duration: 5000
        });
        setShowEditModal(false);
        setEditingDeal(null);
        fetchBulkDeals();
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: result.message || 'Failed to update bulk deal',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating bulk deal:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Error updating bulk deal',
        duration: 5000
      });
    }
  };

  return (
    <div className="min-h-screen bg-themeTealWhite">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded p-6 shadow-sm shadow-themeTeal/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-themeTeal">Bulk Deals Management</h1>
              </div>
              <p className="text-themeTealLighter">Manage bulk deals displayed on the home page</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
                className="bg-themeTeal text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeSkyBlue transition duration-300 flex items-center cursor-pointer"
          >
                <Plus width={16} height={16} className='mr-1'/>
            Add Bulk Deal
          </button>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded p-6 shadow-sm shadow-themeTeal/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter" width={16} height={16} />
          <input
            type="text"
            placeholder="Search bulk deals..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-themeTealLighter rounded-md focus:outline-none text-themeTeal placeholder:text-themeTealLighter focus:border-themeTeal"
          />
        </div>
              {isSearching && <Loader />}
      </div>

            <div className="flex items-center gap-4">
              <div className="bg-themeTeal text-themeTealWhite px-4 py-2 rounded-md text-sm font-medium">
                Total: {totalItems}
        </div>
        </div>
        </div>
      </div>

        {/* Table */}
        <div className="bg-white rounded shadow-sm shadow-themeTeal/10 mb-6">
          <div className="px-6 py-4 border-b border-themeTealLighter">
            <h2 className="text-lg font-semibold text-themeTeal">Bulk Deals ({totalItems})</h2>
          </div>
        {loading ? (
          <div className="px-4 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
            <p className="mt-2 text-sm text-gray-500">Loading bulk deals...</p>
          </div>
        ) : bulkDeals.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bulk deals</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new bulk deal.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-themeTeal hover:bg-themeTeal/90"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Bulk Deal
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-themeTealLighter">
              <thead className="bg-themeTeal">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                    Icon
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer hover:bg-themeTeal/80"
                    onClick={() => handleSort('value')}
                  >
                    Value
                    {sortBy === 'value' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer hover:bg-themeTeal/80"
                    onClick={() => handleSort('label')}
                  >
                    Label
                    {sortBy === 'label' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer hover:bg-themeTeal/80"
                    onClick={() => handleSort('created_at')}
                  >
                    Created
                    {sortBy === 'created_at' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-themeTealLighter">
                {bulkDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-themeTealWhite">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {deal.icon ? (
                            <Image
                              src={deal.icon}
                              alt={deal.label}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-themeTeal">{deal.value}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-themeTeal">{deal.label}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTealLight">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => openEditModal(deal)}
                          className="p-2 bg-themeTeal text-themeTealWhite hover:bg-themeTealWhite hover:text-themeTeal rounded transition duration-300 cursor-pointer flex gap-1"
                          title="Edit Bulk Deal"
                        >
                          <Edit width={16} height={16}/>
                          <span className="text-xs font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setDealToDelete(deal.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer flex gap-1"
                          title="Delete Bulk Deal"
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
        )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-themeTealLighter">
              <div className="flex items-center justify-between">
                <div className="text-sm text-themeTealLighter">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-themeTealLighter rounded-md hover:bg-themeTealWhite disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-themeTealLighter rounded-md hover:bg-themeTealWhite disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
      />

      {/* Modals */}
      <BulkDealFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBulkDeal}
        title="Create Bulk Deal"
        submitLabel="Create"
      />

      <BulkDealFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingDeal(null);
        }}
        onSubmit={handleEditBulkDeal}
        editingItem={editingDeal}
        title="Edit Bulk Deal"
        submitLabel="Update"
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDealToDelete(null);
        }}
        onConfirm={() => dealToDelete && handleDelete(dealToDelete)}
        title="Delete Bulk Deal"
        message="Are you sure you want to delete this bulk deal? This action cannot be undone."
      />
    </div>
  );
}
