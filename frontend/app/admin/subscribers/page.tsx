'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader, NotificationContainer, NotificationData, ConfirmationModal } from '@/components/admin/shared';
import { Trash2 } from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriberStats {
  totalSubscribers: number;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState<SubscriberStats>({
    totalSubscribers: 0,
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<number | null>(null);

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Sort handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      // Default to descending for date, ascending for email
      setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    // Fetch data without loading spinner for sorting
    fetchSubscribers(false);
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-themeTealWhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const fetchSubscribers = useCallback(async (showLoading: boolean = true) => {
    try {
      // Only show loading on initial load, not when sorting
      if (showLoading && sortBy === 'createdAt' && sortOrder === 'desc') {
        setLoading(true);
        setIsInitialLoad(true);
      }
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams({
        sort_by: sortBy,
        sort_order: sortOrder.toUpperCase()
      });
      
      const response = await fetch(`/api/admin/subscribers?${params.toString()}`, {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.data.subscribers);
      } else {
        console.error('Error fetching subscribers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
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
      const response = await fetch('/api/admin/subscribers/stats', {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Error fetching subscriber stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching subscriber stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [fetchSubscribers, fetchStats]);

  const handleDeleteSubscriber = async (id: number) => {
    setSubscriberToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/subscribers/${subscriberToDelete}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove the subscriber from the list
        setSubscribers(prev => prev.filter(subscriber => subscriber.id !== subscriberToDelete));
        // Update stats
        fetchStats();
        addNotification({
          type: 'success',
          title: 'Subscriber Deleted',
          message: 'Subscriber has been deleted successfully',
          duration: 3000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete subscriber',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete subscriber',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setSubscriberToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      {loading && isInitialLoad ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" text="Loading subscribers..." />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-themeTeal">Subscriber management</h1>
            <p className="text-sm text-themeTealLight">Manage your newsletter subscribers here.</p>
          </div>

          {/* Search Section */}
          <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-themeTealLight pl-3 px-1 py-1 rounded-full">
                <span className="text-sm font-medium flex gap-2 items-center text-themeTealWhite">
                  <span>All Subscribers</span> <span className="bg-white text-themeTeal w-6 flex items-center justify-center h-6 block rounded-full text-sm">{subscribers.length}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="w-100 md:w-full overflow-hidden">
            <div className="bg-white rounded border border-themeTealLighter">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-themeTeal border-b border-themeTealLighter">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Email</span>
                          <SortIcon field="email" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Subscribed Date</span>
                          <SortIcon field="createdAt" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-themeTealWhite uppercase tracking-wider w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-themeTealLighter">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center text-themeTealLight">
                          No subscribers found
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((subscriber, index) => (
                        <tr 
                          key={subscriber.id} 
                          className={`hover:bg-themeTealWhite transition duration-300 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-themeTealWhite'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-themeTeal">{subscriber.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-themeTealLight">{formatDate(subscriber.createdAt)}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <button
                              onClick={() => handleDeleteSubscriber(subscriber.id)}
                              className="p-2 text-themeTealWhite bg-rose-600 rounded transition duration-300 hover:bg-red-600 cursor-pointer"
                              title="Delete Subscriber"
                            >
                              <Trash2 width={20}/>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSubscriberToDelete(null);
        }}
        onConfirm={confirmDeleteSubscriber}
        title="Delete Subscriber"
        message="Are you sure you want to delete this subscriber? This action cannot be undone."
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
