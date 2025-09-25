'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader, NotificationContainer, NotificationData } from '@/components/admin/shared';

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

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchSubscribers = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setIsInitialLoad(true);
      }
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch('/api/admin/subscribers', {
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
  }, []);

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
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Remove the subscriber from the list
        setSubscribers(prev => prev.filter(subscriber => subscriber.id !== id));
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
              <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-themeTeal">
                  All subscribers <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{subscribers.length}</span>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                        Subscribed Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider w-32">
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
                            <div className="text-xs font-medium text-themeTeal">{subscriber.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-themeTealLight">{formatDate(subscriber.createdAt)}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <button
                              onClick={() => handleDeleteSubscriber(subscriber.id)}
                              className="p-2 text-themeTealWhite bg-red-500 rounded transition duration-300 hover:bg-red-600 cursor-pointer"
                              title="Delete Subscriber"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
      
      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
