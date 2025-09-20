'use client';

import React, { useState, useEffect } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserModal from '@/components/admin/UserModal';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    getCurrentUserRole();
  }, []);

  const getCurrentUserRole = () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUserRole(user.role);
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch('http://localhost:8888/api/admin/users', {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        console.error('Error fetching users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user can create users (only Admin and SuperAdmin)
  const canCreateUsers = currentUserRole === 10 || currentUserRole === 11;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-themeTeal">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-themeTeal font-serif">User Management</h1>
          <p className="text-themeTealLight">Manage registered users and their accounts</p>
        </div>
        {canCreateUsers && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-themeTeal text-themeTealWhite px-4 py-2 rounded-md hover:bg-themeTealLight transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </button>
        )}
      </div>

      <div className="overflow-hidden">
        <UserTable users={users} onRefresh={fetchUsers} />
      </div>
      
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
