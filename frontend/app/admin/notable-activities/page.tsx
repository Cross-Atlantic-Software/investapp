'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { NotificationContainer, NotificationData, ConfirmationModal, createSortHandler } from '@/components/admin/shared';
import { 
  ActivityFormModal, 
  ActivityTypeModal, 
  NotableActivityTable,
  NotableActivityItem,
  ActivityTypeItem,
  NewActivityForm,
  NewActivityTypeForm
} from '@/components/admin/notable-activities';

export default function NotableActivitiesPage() {
  const [activities, setActivities] = useState<NotableActivityItem[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityTypeModal, setShowActivityTypeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<NotableActivityItem | null>(null);
  const [newActivity, setNewActivity] = useState<NewActivityForm>({
    description: '',
    icon: null,
    activity_type_ids: []
  });
  const [newActivityType, setNewActivityType] = useState<NewActivityTypeForm>({
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
  }, [fetchActivities, fetchActivityTypes]); // Include dependencies

  // Effect for pagination, search, and sorting changes
  useEffect(() => {
    if (currentPage !== 1 || searchTerm !== '' || sortBy !== 'created_at' || sortOrder !== 'desc') {
      fetchActivities();
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, fetchActivities]); // Trigger when these change

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleCreateActivity = async (data: NewActivityForm) => {
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('activity_type_ids', JSON.stringify(data.activity_type_ids));
      
      if (data.icon) {
        formData.append('icon', data.icon);
      }

      const response = await fetch('/api/admin/notable-activities', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Notable activity created successfully!',
          duration: 5000
        });
        setShowCreateModal(false);
        setNewActivity({ description: '', icon: null, activity_type_ids: [] });
        fetchActivities();
      } else {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: result.message || 'Failed to create notable activity',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating notable activity:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Error creating notable activity',
        duration: 5000
      });
    }
  };

  const handleEditActivity = async (data: NewActivityForm) => {
    if (!editingItem) return;

    try {
      const formData = new FormData();
      formData.append('description', editingItem.description);
      formData.append('activity_type_ids', JSON.stringify(data.activity_type_ids));
      
      if (data.icon) {
        formData.append('icon', data.icon);
      }

      const response = await fetch(`/api/admin/notable-activities/${editingItem.id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Notable activity updated successfully!',
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
          message: result.message || 'Failed to update notable activity',
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

  const handleDeleteActivity = (id: number) => {
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
          title: 'Success',
          message: 'Notable activity deleted successfully!',
          duration: 5000
        });
        fetchActivities();
      } else {
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: data.message || 'Failed to delete notable activity',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting notable activity:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Error deleting notable activity',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setActivityToDelete(null);
    }
  };

  const handleCreateActivityType = async (data: NewActivityTypeForm) => {
    try {
      const response = await fetch('/api/admin/activity-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Activity type created successfully!',
          duration: 5000
        });
        setNewActivityType({ name: '' });
        fetchActivityTypes();
      } else {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: result.message || 'Failed to create activity type',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating activity type:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Error creating activity type',
        duration: 5000
      });
    }
  };

  const handleDeleteActivityType = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/activity-types/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Activity type deleted successfully!',
          duration: 5000
        });
        fetchActivityTypes();
      } else {
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: data.message || 'Failed to delete activity type',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting activity type:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
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

  return (
    <div className="min-h-screen bg-themeTealWhite">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded p-6 shadow-sm shadow-themeTeal/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-themeTeal">Notable Activities</h1>
              </div>
              <p className="text-themeTealLighter">Manage notable activities and activity types</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowActivityTypeModal(true)}
                className="bg-themeTealLighter text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeTeal hover:text-white transition duration-300 flex items-center cursor-pointer"
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

        {/* Search and Stats */}
        <div className="bg-white rounded p-6 shadow-sm shadow-themeTeal/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter" width={16} height={16} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-themeTealLighter rounded-md focus:outline-none text-themeTeal placeholder:text-themeTealLighter focus:border-themeTeal"
          />
        </div>
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
            <h2 className="text-lg font-semibold text-themeTeal">Activities ({totalItems})</h2>
        </div>
          
          <NotableActivityTable
            activities={activities}
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDeleteActivity}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

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

      {/* Modals */}
      <ActivityFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateActivity}
        activityTypes={activityTypes}
        title="Create Notable Activity"
        submitLabel="Create"
        initialData={newActivity}
      />

      <ActivityFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleEditActivity}
        activityTypes={activityTypes}
        editingItem={editingItem}
        title="Edit Notable Activity"
        submitLabel="Update"
        initialData={newActivity}
      />

      <ActivityTypeModal
        isOpen={showActivityTypeModal}
        onClose={() => setShowActivityTypeModal(false)}
        activityTypes={activityTypes}
        onCreateActivityType={handleCreateActivityType}
        onDeleteActivityType={handleDeleteActivityType}
        newActivityType={newActivityType}
        setNewActivityType={setNewActivityType}
      />


      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setActivityToDelete(null);
        }}
        onConfirm={confirmDeleteActivity}
        title="Delete Notable Activity"
        message="Are you sure you want to delete this notable activity? This action cannot be undone."
      />

      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
      />
    </div>
  );
}