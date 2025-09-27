'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { Loader, NotificationContainer, NotificationData, ConfirmationModal, createSortHandler } from '@/components/admin/shared';
import { 
  StockMasterFormModal, 
  StockMasterTable,
  StockMasterItem,
  NewStockMasterForm
} from '@/components/admin/stock-master';

export default function StockMasterPage() {
  const [stockMasters, setStockMasters] = useState<StockMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stockMasterToDelete, setStockMasterToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<StockMasterItem | null>(null);
  const [newStockMaster, setNewStockMaster] = useState<NewStockMasterForm>({
    name: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Refs to store current values to avoid circular dependencies
  const currentPageRef = useRef(currentPage);
  const searchTermRef = useRef(searchTerm);
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  
  // Update refs when state changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);
  
  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);
  
  useEffect(() => {
    sortOrderRef.current = sortOrder;
  }, [sortOrder]);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const fetchStockMasters = useCallback(async () => {
    try {
      setLoading(true);
      setIsSearching(searchTermRef.current.length > 0);
      
      const params = new URLSearchParams({
        page: currentPageRef.current.toString(),
        limit: itemsPerPage.toString(),
        sort_by: sortByRef.current,
        sort_order: sortOrderRef.current.toUpperCase()
      });
      
      if (searchTermRef.current) {
        params.append('search', searchTermRef.current);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/stock-masters?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock masters');
      }

      const data = await response.json();
      
      if (data.success) {
        setStockMasters(data.data.stockMasters || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalItems(data.data.pagination?.total || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch stock masters');
      }
    } catch (error) {
      console.error('Error fetching stock masters:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch stock masters. Please try again.'
      });
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
      setIsSearching(false);
    }
  }, [addNotification]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchStockMasters();
    }
  }, [isInitialLoad, fetchStockMasters]);

  // Search debouncing
  useEffect(() => {
    if (!isInitialLoad) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        fetchStockMasters();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, fetchStockMasters, isInitialLoad]);

  // Pagination
  useEffect(() => {
    if (!isInitialLoad) {
      fetchStockMasters();
    }
  }, [currentPage, fetchStockMasters, isInitialLoad]);

  // Sorting
  useEffect(() => {
    if (!isInitialLoad) {
      setCurrentPage(1);
      fetchStockMasters();
    }
  }, [sortBy, sortOrder, fetchStockMasters, isInitialLoad]);

  const handleCreateStockMaster = async (data: NewStockMasterForm) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stock-masters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create stock master');
      }

      const result = await response.json();
      
      if (result.status === true || result.success === true) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock master created successfully'
        });
        setShowCreateModal(false);
        setNewStockMaster({ name: '' });
        fetchStockMasters();
      } else {
        // Handle both old and new error formats
        const errorMessage = result.error?.message || result.message || 'Failed to create stock master';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating stock master:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create stock master. Please try again.'
      });
    }
  };

  const handleEditStockMaster = async (data: NewStockMasterForm) => {
    if (!editingItem) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/stock-masters/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update stock master');
      }

      const result = await response.json();
      
      if (result.status === true || result.success === true) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock master updated successfully'
        });
        setShowEditModal(false);
        setEditingItem(null);
        fetchStockMasters();
      } else {
        // Handle both old and new error formats
        const errorMessage = result.error?.message || result.message || 'Failed to update stock master';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating stock master:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update stock master. Please try again.'
      });
    }
  };

  const handleDeleteStockMaster = async () => {
    if (!stockMasterToDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/stock-masters/${stockMasterToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete stock master');
      }

      const result = await response.json();
      
      if (result.status === true || result.success === true) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock master deleted successfully'
        });
        setShowDeleteModal(false);
        setStockMasterToDelete(null);
        fetchStockMasters();
      } else {
        // Handle both old and new error formats
        const errorMessage = result.error?.message || result.message || 'Failed to delete stock master';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting stock master:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete stock master. Please try again.'
      });
    }
  };

  const handleEdit = (stockMaster: StockMasterItem) => {
    setEditingItem(stockMaster);
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    setStockMasterToDelete(id);
    setShowDeleteModal(true);
  };

  const handleSort = createSortHandler(setSortBy, setSortOrder);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Master Management</h1>
          <p className="mt-2 text-gray-600">Manage stock master categories and classifications</p>
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search stock masters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Total Stock Masters: <span className="font-semibold text-themeTeal">{totalItems}</span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-themeTeal text-white text-sm font-medium rounded-md hover:bg-themeTealDark transition duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stock Master
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <StockMasterTable
            stockMasters={stockMasters}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StockMasterFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateStockMaster}
        title="Create Stock Master"
        submitLabel="Create"
        initialData={newStockMaster}
      />

      <StockMasterFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditStockMaster}
        editingItem={editingItem}
        title="Edit Stock Master"
        submitLabel="Update"
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStockMasterToDelete(null);
        }}
        onConfirm={handleDeleteStockMaster}
        title="Delete Stock Master"
        message="Are you sure you want to delete this stock master? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
