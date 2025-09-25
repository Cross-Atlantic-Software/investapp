'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EnquiryTable, EnquiryModal } from '@/components/admin/enquiries';
import { Loader, NotificationContainer, NotificationData } from '@/components/admin/shared';

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

  // Status filter effect
  useEffect(() => {
    fetchEnquiries(statusFilter, false);
  }, [statusFilter, fetchEnquiries]);

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
    if (!confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove the enquiry from the list
        setEnquiries(prev => prev.filter(enquiry => enquiry.id !== id));
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
          <div className="mb-6">
            <h1 className="text-lg font-bold text-themeTeal">Enquiry Management</h1>
            <p className="text-sm text-themeTealLight">Manage customer enquiries and support requests.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-themeTeal">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Enquiries</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-gray-600">New</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.read}</div>
              <div className="text-sm text-gray-600">Read</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
              <div className="text-sm text-gray-600">Replied</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
              <div className="text-sm text-gray-600">Closed</div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-themeTeal">
                  All enquiries <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{enquiries.length}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
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

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}