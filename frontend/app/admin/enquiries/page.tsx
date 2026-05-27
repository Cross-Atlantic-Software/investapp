'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EnquiryTable, EnquiryModal } from '@/components/admin/enquiries';
import { Loader, NotificationContainer, NotificationData, ConfirmationModal } from '@/components/admin/shared';

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface EnquiryStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<EnquiryStats>({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    closed: 0
  });

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchEnquiries = useCallback(async (status = 'all', showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setIsInitialLoad(true);
      }
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams();
      if (status !== 'all') {
        params.append('status', status);
      }
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder.toUpperCase());
      params.append('page', '1');
      params.append('limit', '50');

      const url = `/api/admin/enquiries?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEnquiries(data.data.enquiries);
      } else {
        console.error('Error fetching enquiries:', data.message);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/enquiries/stats', {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching enquiry stats:', error);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    fetchEnquiries();
    fetchStats();
  }, [fetchEnquiries, fetchStats]);

  // Status filter effect - separate from initial load
  useEffect(() => {
    if (!isInitialLoad) {
      fetchEnquiries(statusFilter, false);
    }
  }, [statusFilter, isInitialLoad]);

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleViewEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowEnquiryModal(true);
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/enquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the enquiry in the list
        setEnquiries(prev => prev.map(enquiry => 
          enquiry.id === id ? { ...enquiry, status: status as 'new' | 'read' | 'replied' | 'closed' } : enquiry
        ));
        // Update stats
        fetchStats();
        addNotification({
          type: 'success',
          title: 'Status Updated',
          message: `Enquiry status updated to ${status}`,
          duration: 3000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: data.message || 'Failed to update enquiry status',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update enquiry status',
        duration: 5000
      });
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    setEnquiryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteEnquiry = async () => {
    if (!enquiryToDelete) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/enquiries/${enquiryToDelete}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove the enquiry from the list
        setEnquiries(prev => prev.filter(enquiry => enquiry.id !== enquiryToDelete));
        // Update stats
        fetchStats();
        addNotification({
          type: 'success',
          title: 'Enquiry Deleted',
          message: 'Enquiry has been deleted successfully',
          duration: 3000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete enquiry',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete enquiry',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setEnquiryToDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {loading && isInitialLoad ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" text="Loading enquiries..." />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-lg font-bold text-themeTeal">Enquiry Management</h1>
            <p className="text-sm text-themeTealLight">Manage customer enquiries and support requests.</p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`pl-3 px-1 py-1 rounded-full transition-colors cursor-pointer duration-500 ${
                statusFilter === 'all' 
                  ? 'bg-themeTeal text-themeTealWhite' 
                  : 'bg-themeTealLight text-themeTealWhite hover:bg-themeTeal hover:text-themeTealWhite'
              }`}
            >
              <span className="text-sm font-medium flex gap-2 items-center">
                <span>Total</span> <span className="bg-white text-themeTeal w-6 flex items-center justify-center h-6 block rounded-full text-xs">{stats.total}</span>
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`pl-3 px-1 py-1 rounded-full transition-colors cursor-pointer duration-500 ${
                statusFilter === 'new' 
                  ? 'bg-themeTeal text-themeTealWhite' 
                  : 'bg-themeTealLight text-themeTealWhite hover:bg-themeTeal hover:text-themeTealWhite'
              }`}
            >
              <span className="text-sm font-medium flex gap-2 items-center">
                <span>New</span> <span className="bg-white text-themeTeal w-6 flex items-center justify-center h-6 block rounded-full text-xs">{stats.new}</span>
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`pl-3 px-1 py-1 rounded-full transition-colors cursor-pointer duration-500 ${
                statusFilter === 'read' 
                  ? 'bg-themeTeal text-themeTealWhite' 
                  : 'bg-themeTealLight text-themeTealWhite hover:bg-themeTeal hover:text-themeTealWhite'
              }`}
            >
              <span className="text-sm font-medium flex gap-2 items-center">
                <span>Read</span> <span className="bg-white text-themeTeal w-6 flex items-center justify-center h-6 block rounded-full text-xs">{stats.read}</span>
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('replied')}
              className={`pl-3 px-1 py-1 rounded-full transition-colors cursor-pointer duration-500 ${
                statusFilter === 'replied' 
                  ? 'bg-themeTeal text-themeTealWhite' 
                  : 'bg-themeTealLight text-themeTealWhite hover:bg-themeTeal hover:text-themeTealWhite'
              }`}
            >
              <span className="text-sm font-medium flex gap-2 items-center">
                <span>Replied</span> <span className="bg-white text-themeTeal w-6 flex items-center justify-center h-6 block rounded-full text-xs">{stats.replied}</span>
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`pl-3 px-1 py-1 rounded-full transition-colors cursor-pointer duration-500 ${
                statusFilter === 'closed' 
                  ? 'bg-themeTeal text-themeTealWhite' 
                  : 'bg-themeTealLight text-themeTealWhite hover:bg-themeTeal hover:text-themeTealWhite'
              }`}
            >
              <span className="text-sm font-medium flex gap-2 items-center">
                <span>Closed</span> <span className="bg-white text-themeTeal w-6 flex items-center justify-center h-6 block rounded-full text-xs">{stats.closed}</span>
              </span>
            </button>
          </div>

          <EnquiryTable 
            enquiries={enquiries} 
            onRefresh={() => fetchEnquiries(statusFilter)}
            onSort={handleSort} 
            sortBy={sortBy} 
            sortOrder={sortOrder}
            onView={handleViewEnquiry}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteEnquiry}
          />
        </>
      )}
      
      {showEnquiryModal && selectedEnquiry && (
        <EnquiryModal
          enquiry={selectedEnquiry}
          onClose={() => {
            setShowEnquiryModal(false);
            setSelectedEnquiry(null);
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEnquiryToDelete(null);
        }}
        onConfirm={confirmDeleteEnquiry}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
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