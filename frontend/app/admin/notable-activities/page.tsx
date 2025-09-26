'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Search, X } from 'lucide-react';
import Loader from '@/components/admin/shared/Loader';
import { NotificationContainer, NotificationData } from '@/components/admin/shared/Notification';
import GenericSearchableMultiSelect from '@/components/admin/shared/GenericSearchableMultiSelect';

interface NotableActivityItem {
  id: number;
  activity_type_ids: string;
  icon: string;
  description: string;
  created_at: string;
  updated_at: string;
  activity_types?: ActivityTypeItem[];
}

interface ActivityTypeItem {
  id: number;
  name: string;
}

export default function NotableActivitiesPage() {
  const [activities, setActivities] = useState<NotableActivityItem[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityTypeModal, setShowActivityTypeModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NotableActivityItem | null>(null);
  const [newActivity, setNewActivity] = useState({
    description: '',
    icon: null as File | null,
    activity_type_ids: [] as number[]
  });
  const [newActivityType, setNewActivityType] = useState({
    name: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, title: type === 'success' ? 'Success' : 'Error' }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        sort_by: sortBy,
        sort_order: sortOrder
      });

      const response = await fetch(`/api/admin/notable-activities?${params}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.data.activities);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        addNotification('Failed to fetch notable activities', 'error');
      }
    } catch (error) {
      console.error('Error fetching notable activities:', error);
      addNotification('Error fetching notable activities', 'error');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, addNotification]);

  const fetchActivityTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/activity-types/select');
      const data = await response.json();

      if (data.success) {
        setActivityTypes(data.data.activityTypes);
      }
    } catch (error) {
      console.error('Error fetching activity types:', error);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivityTypes();
  }, [fetchActivityTypes]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  const handleCreateActivity = async () => {
    try {
      const formData = new FormData();
      formData.append('description', newActivity.description);
      formData.append('activity_type_ids', JSON.stringify(newActivity.activity_type_ids));
      
      if (newActivity.icon) {
        formData.append('icon', newActivity.icon);
      }

      const response = await fetch('/api/admin/notable-activities', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        addNotification('Notable activity created successfully');
        setShowCreateModal(false);
        setNewActivity({ description: '', icon: null, activity_type_ids: [] });
        fetchActivities();
      } else {
        addNotification(data.message || 'Failed to create notable activity', 'error');
      }
    } catch (error) {
      console.error('Error creating notable activity:', error);
      addNotification('Error creating notable activity', 'error');
    }
  };

  const handleEditActivity = async () => {
    if (!editingItem) return;

    try {
      const formData = new FormData();
      formData.append('description', editingItem.description);
      formData.append('activity_type_ids', JSON.stringify(newActivity.activity_type_ids));
      
      if (newActivity.icon) {
        formData.append('icon', newActivity.icon);
      }

      const response = await fetch(`/api/admin/notable-activities/${editingItem.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        addNotification('Notable activity updated successfully');
        setShowEditModal(false);
        setEditingItem(null);
        setNewActivity({ description: '', icon: null, activity_type_ids: [] });
        fetchActivities();
      } else {
        addNotification(data.message || 'Failed to update notable activity', 'error');
      }
    } catch (error) {
      console.error('Error updating notable activity:', error);
      addNotification('Error updating notable activity', 'error');
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notable activity?')) return;

    try {
      const response = await fetch(`/api/admin/notable-activities/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addNotification('Notable activity deleted successfully');
        fetchActivities();
      } else {
        addNotification(data.message || 'Failed to delete notable activity', 'error');
      }
    } catch (error) {
      console.error('Error deleting notable activity:', error);
      addNotification('Error deleting notable activity', 'error');
    }
  };

  const handleCreateActivityType = async () => {
    try {
      const response = await fetch('/api/admin/activity-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newActivityType),
      });

      const data = await response.json();

      if (data.success) {
        addNotification('Activity type created successfully');
        setShowActivityTypeModal(false);
        setNewActivityType({ name: '' });
        fetchActivityTypes();
      } else {
        addNotification(data.message || 'Failed to create activity type', 'error');
      }
    } catch (error) {
      console.error('Error creating activity type:', error);
      addNotification('Error creating activity type', 'error');
    }
  };

  const handleDeleteActivityType = async (id: number) => {
    if (!confirm('Are you sure you want to delete this activity type?')) return;

    try {
      const response = await fetch(`/api/admin/activity-types/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addNotification('Activity type deleted successfully');
        fetchActivityTypes();
      } else {
        addNotification(data.message || 'Failed to delete activity type', 'error');
      }
    } catch (error) {
      console.error('Error deleting activity type:', error);
      addNotification('Error deleting activity type', 'error');
    }
  };

  const openEditModal = (item: NotableActivityItem) => {
    setEditingItem(item);
    setNewActivity({
      description: item.description,
      icon: null,
      activity_type_ids: item.activity_types?.map(at => at.id) || []
    });
    setShowEditModal(true);
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

  const getActivityTypeNames = (activity: NotableActivityItem) => {
    if (activity.activity_types && activity.activity_types.length > 0) {
      return activity.activity_types.map(at => at.name).join(', ');
    }
    return 'No activity types';
  };

  if (isInitialLoad) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notable Activities</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowActivityTypeModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Activity Types
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Notable Activity
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Activities</h3>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Activity Types</h3>
          <p className="text-2xl font-bold text-gray-900">{activityTypes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Current Page</h3>
          <p className="text-2xl font-bold text-gray-900">{currentPage} of {totalPages}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('description')}
                >
                  Description {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity Types
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <Loader />
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No notable activities found
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.icon ? (
                        <img
                          src={activity.icon}
                          alt="Activity icon"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500">?</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {activity.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {getActivityTypeNames(activity)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Notable Activity</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter activity description..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Types
              </label>
              <GenericSearchableMultiSelect
                options={activityTypes.map(at => ({ value: at.id, label: at.name }))}
                selectedValues={newActivity.activity_type_ids}
                onChange={(values) => setNewActivity({ ...newActivity, activity_type_ids: values })}
                placeholder="Select activity types..."
                forceAbove={true}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setNewActivity({ ...newActivity, icon: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateActivity}
                disabled={!newActivity.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Notable Activity</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter activity description..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Types
              </label>
              <GenericSearchableMultiSelect
                options={activityTypes.map(at => ({ value: at.id, label: at.name }))}
                selectedValues={newActivity.activity_type_ids}
                onChange={(values: number[]) => setNewActivity({ ...newActivity, activity_type_ids: values })}
                placeholder="Select activity types..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setNewActivity({ ...newActivity, icon: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {editingItem.icon && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Current icon:</p>
                  <img src={editingItem.icon} alt="Current icon" className="h-8 w-8 rounded-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditActivity}
                disabled={!editingItem.description}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Type Management Modal */}
      {showActivityTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Activity Types</h2>
              <button
                onClick={() => setShowActivityTypeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Create New Activity Type */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Create New Activity Type</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActivityType.name}
                  onChange={(e) => setNewActivityType({ name: e.target.value })}
                  placeholder="Activity type name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateActivityType}
                  disabled={!newActivityType.name.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Activity Types List */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Existing Activity Types</h3>
              <div className="space-y-2">
                {activityTypes.map((activityType) => (
                  <div key={activityType.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-gray-900">{activityType.name}</span>
                    <button
                      onClick={() => handleDeleteActivityType(activityType.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {activityTypes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No activity types found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationContainer 
        notifications={notifications} 
        onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  );
}
