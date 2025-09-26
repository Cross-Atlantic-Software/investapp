'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Search, X, Trash2, Edit } from 'lucide-react';
import { Loader, NotificationContainer, NotificationData, ConfirmationModal, SortableHeader, createSortHandler } from '@/components/admin/shared';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
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
  
  // Refs to store current values to avoid circular dependencies
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

  // Sort handler using the utility function
  const handleSort = createSortHandler(setSortBy, setSortOrder);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPageRef.current.toString(),
        limit: itemsPerPage.toString(),
        search: searchTermRef.current,
        sort_by: sortByRef.current,
        sort_order: sortOrderRef.current
      });

      const response = await fetch(`/api/admin/notable-activities?${params}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.data.activities);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          type: 'error',
          title: 'Fetch Failed',
          message: 'Failed to fetch notable activities',
          duration: 5000
        }]);
      }
    } catch (error) {
      console.error('Error fetching notable activities:', error);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        title: 'Fetch Failed',
        message: 'Error fetching notable activities',
        duration: 5000
      }]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []); // No dependencies - completely stable

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

  // Initial load effect
  useEffect(() => {
    fetchActivities();
    fetchActivityTypes();
  }, []); // Only run once on mount

  // Effect for pagination, search, and sorting changes
  useEffect(() => {
    if (currentPage !== 1 || searchTerm !== '' || sortBy !== 'created_at' || sortOrder !== 'desc') {
      fetchActivities();
    }
  }, [currentPage, searchTerm, sortBy, sortOrder]); // Trigger when these change

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);


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
        addNotification({
          type: 'success',
          title: 'Activity Created',
          message: 'Notable activity created successfully',
          duration: 5000
        });
        setShowCreateModal(false);
        setNewActivity({ description: '', icon: null, activity_type_ids: [] });
        fetchActivities();
      } else {
        addNotification({
          type: 'error',
          title: 'Create Failed',
          message: data.message || 'Failed to create notable activity',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating notable activity:', error);
      addNotification({
        type: 'error',
        title: 'Create Failed',
        message: 'Error creating notable activity',
        duration: 5000
      });
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
        addNotification({
          type: 'success',
          title: 'Activity Updated',
          message: 'Notable activity updated successfully',
          duration: 5000
        });
        setShowEditModal(false);
        setEditingItem(null);
        setNewActivity({ description: '', icon: null, activity_type_ids: [] });
        fetchActivities();
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: data.message || 'Failed to update notable activity',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating notable activity:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Error updating notable activity',
        duration: 5000
      });
    }
  };

  const handleDeleteActivity = async (id: number) => {
    setActivityToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;

    try {
      const response = await fetch(`/api/admin/notable-activities/${activityToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Activity Deleted',
          message: 'Notable activity deleted successfully',
          duration: 5000
        });
        fetchActivities();
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete notable activity',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting notable activity:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Error deleting notable activity',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setActivityToDelete(null);
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
        addNotification({
          type: 'success',
          title: 'Activity Type Created',
          message: 'Activity type created successfully',
          duration: 5000
        });
        setShowActivityTypeModal(false);
        setNewActivityType({ name: '' });
        fetchActivityTypes();
      } else {
        addNotification({
          type: 'error',
          title: 'Create Failed',
          message: data.message || 'Failed to create activity type',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating activity type:', error);
      addNotification({
        type: 'error',
        title: 'Create Failed',
        message: 'Error creating activity type',
        duration: 5000
      });
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
        addNotification({
          type: 'success',
          title: 'Activity Type Deleted',
          message: 'Activity type deleted successfully',
          duration: 5000
        });
        fetchActivityTypes();
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete activity type',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting activity type:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Error deleting activity type',
        duration: 5000
      });
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
    <div className="space-y-6 relative overflow-hidden max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-themeTeal">Notable Activities Management</h1>
            <p className="text-sm text-themeTealLight mt-1">Manage notable activities and activity types here.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowActivityTypeModal(true)}
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 transition duration-300 flex items-center cursor-pointer"
            >
              <Plus width={16} height={16} className='mr-1'/>
              Manage Activity Types
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-themeTeal text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeSkyBlue transition duration-300 flex items-center cursor-pointer"
            >
              <Plus width={16} height={16} className='mr-1'/>
              Add Notable Activity
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-themeTeal">
              All activities <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{totalItems}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search activities..."
              className="w-64 pl-10 pr-4 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal placeholder:text-themeTealLighter"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-themeTealLighter"/>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-themeTealLighter">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-themeTeal border-b border-themeTealLighter">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                  Icon
                </th>
                <SortableHeader
                  field="description"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Description
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                  Activity Types
                </th>
                <SortableHeader
                  field="created_at"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Created
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-themeTealLighter">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <Loader />
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-themeTeal">
                    No notable activities found
                  </td>
                </tr>
              ) : (
                activities.map((activity, index) => (
                  <tr key={activity.id} className={index % 2 === 0 ? 'bg-white' : 'bg-themeTealWhite'}>
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
                      <div className="text-sm text-themeTeal max-w-xs truncate">
                        {activity.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-themeTeal">
                        {getActivityTypeNames(activity)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                      {formatDate(activity.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition duration-300 cursor-pointer flex gap-1"
                          title="Edit Activity"
                        >
                          <Edit width={16} height={16}/>
                          <span className="text-xs font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer flex gap-1"
                          title="Delete Activity"
                        >
                          <Trash2 width={16} height={16}/>
                          <span className="text-xs font-medium">Delete</span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Create Notable Activity</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X width={20} height={20}/>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
            
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    Description
                  </label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                    rows={3}
                    placeholder="Enter activity description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-themeTeal mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    Icon
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewActivity({ ...newActivity, icon: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-themeTealLighter">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-themeTeal border border-themeTealLighter rounded-md hover:bg-themeTealWhite transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateActivity}
                  disabled={!newActivity.description}
                  className="px-4 py-2 bg-themeTeal text-white rounded-md hover:bg-themeSkyBlue disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit Notable Activity</h2>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setNewActivity({ description: '', activity_type_ids: [], icon: null });
                  }}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X width={20} height={20}/>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
            
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                    rows={3}
                    placeholder="Enter activity description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    Activity Types
                  </label>
                  <GenericSearchableMultiSelect
                    options={activityTypes.map(at => ({ value: at.id, label: at.name }))}
                    selectedValues={newActivity.activity_type_ids}
                    onChange={(values: number[]) => setNewActivity({ ...newActivity, activity_type_ids: values })}
                    placeholder="Select activity types..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    Icon
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewActivity({ ...newActivity, icon: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                  />
                  {editingItem.icon && (
                    <div className="mt-2">
                      <p className="text-sm text-themeTeal">Current icon:</p>
                      <img src={editingItem.icon} alt="Current icon" className="h-8 w-8 rounded-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-themeTealLighter">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-themeTeal border border-themeTealLighter rounded-md hover:bg-themeTealWhite transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditActivity}
                  disabled={!editingItem.description}
                  className="px-4 py-2 bg-themeTeal text-white rounded-md hover:bg-themeSkyBlue disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Type Management Modal */}
      {showActivityTypeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded w-full max-w-2xl mx-4 overflow-hidden max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Manage Activity Types</h2>
                </div>
                <button
                  onClick={() => setShowActivityTypeModal(false)}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X width={20} height={20}/>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">

              {/* Create New Activity Type */}
              <div className="mb-6 p-4 border border-themeTealLighter rounded-lg">
                <h3 className="text-lg font-semibold text-themeTeal mb-3">Create New Activity Type</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivityType.name}
                    onChange={(e) => setNewActivityType({ name: e.target.value })}
                    placeholder="Activity type name..."
                    className="flex-1 px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal"
                  />
                  <button
                    onClick={handleCreateActivityType}
                    disabled={!newActivityType.name.trim()}
                    className="px-4 py-2 bg-themeTeal text-white rounded-md hover:bg-themeSkyBlue disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Activity Types List */}
              <div>
                <h3 className="text-lg font-semibold text-themeTeal mb-3">Existing Activity Types</h3>
                <div className="space-y-2">
                  {activityTypes.map((activityType) => (
                    <div key={activityType.id} className="flex items-center justify-between p-3 border border-themeTealLighter rounded-lg">
                      <span className="text-themeTeal">{activityType.name}</span>
                      <button
                        onClick={() => handleDeleteActivityType(activityType.id)}
                        className="text-red-600 hover:text-red-800 text-sm transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {activityTypes.length === 0 && (
                    <p className="text-themeTeal text-center py-4">No activity types found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setActivityToDelete(null);
        }}
        onConfirm={confirmDeleteActivity}
        title="Delete Notable Activity"
        message="Are you sure you want to delete this notable activity? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
      />
    </div>
  );
}
