'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserModal from '@/components/admin/UserModal';
import Loader from '@/components/admin/Loader';
import { NotificationContainer, NotificationData } from '@/components/admin/Notification';

interface SearchFilters {
  search: string;
  role: string;
  auth_provider: string;
  status: string;
  email_verified: string;
  phone_verified: string;
  date_from: string;
  date_to: string;
  last_active_from: string;
  last_active_to: string;
}


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    role: '',
    auth_provider: '',
    status: '',
    email_verified: '',
    phone_verified: '',
    date_from: '',
    date_to: '',
    last_active_from: '',
    last_active_to: '',
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const getCurrentUserRole = () => {
    try {
      const storedUser = sessionStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUserRole(user.role);
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
  };


  const buildQueryString = useCallback((filters: SearchFilters, page: number = 1) => {

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.append(key, value);
      }
    });
    
    params.append('page', page.toString());
    params.append('limit', '10');
    params.append('sort_by', 'createdAt');
    params.append('sort_order', 'DESC');
    
    return params.toString();
  }, []);

  const fetchUsers = useCallback(async (page: number = 1, showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setIsInitialLoad(true);
      }
      const token = sessionStorage.getItem('adminToken') || '';


      const queryString = buildQueryString(searchFilters, page);
      const response = await fetch(`/api/admin/users?${queryString}`, {

        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        console.error('Error fetching users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }

  }, [searchFilters, buildQueryString]);

  useEffect(() => {
    fetchUsers();
    getCurrentUserRole();
  }, [fetchUsers]);


  const handleSearchChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Debounced search effect - faster and more responsive, no loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, false); // No loading state for dynamic search
    }, 300); // Reduced to 300ms for faster response

    return () => clearTimeout(timeoutId);
  }, [searchFilters.search, fetchUsers]);


  // Check if current user can create users (only Admin and SuperAdmin)
  const canCreateUsers = currentUserRole === 10 || currentUserRole === 11;


  return (
    <div className="space-y-6 overflow-x-hidden relative">
      {loading && isInitialLoad && <Loader fullScreen text="Loading users..." />}
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-themeTeal">Admin User management</h1>
        <p className="text-sm text-themeTealLight">Manage your team members and their account permissions here.</p>
      </div>

      {/* Search Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-themeTeal">
              All users <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{pagination.totalUsers}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              value={searchFilters.search}
              onChange={(e) => handleSearchChange('search', e.target.value)}
              placeholder="Search by name or email"
              className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {canCreateUsers && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-themeTeal text-white px-4 py-2 text-sm rounded-lg hover:bg-themeTealLight transition-colors duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add user
            </button>
          )}
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-hidden">
        <UserTable 
          users={users} 
          onRefresh={() => fetchUsers(pagination.currentPage)} 
          onNotification={(type, title, message) => addNotification({ type, title, message, duration: 5000 })}
        />
      </div>

      
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchUsers(pagination.currentPage);
          setIsModalOpen(false);
          addNotification({
            type: 'success',
            title: 'User Created',
            message: 'User has been created successfully!',
            duration: 5000
          });
        }}
      />

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
