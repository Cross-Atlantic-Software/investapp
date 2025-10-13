'use client';

import React, { useState } from 'react';
import { ConfirmationModal, Loader, SortableHeader } from '@/components/admin/shared';
import { ChevronDown, LucideSquarePen, Trash2, X } from 'lucide-react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  auth_provider: string;
  role: number;
  email_verified: number;
  phone_verified: number;
  last_active: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onNotification?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onRefresh, onSort, sortBy, sortOrder, onNotification }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get current user's role to determine permissions
  const getCurrentUserRole = () => {
    try {
      const storedUser = sessionStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.role;
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
    return null;
  };

  const currentUserRole = getCurrentUserRole();
  const canManageUsers = currentUserRole === 10 || currentUserRole === 11; // Admin or SuperAdmin

  // Helper function to convert role number to readable name
  const getRoleName = (role: number): string => {
    switch (role) {
      case 10:
        return 'Admin';
      case 11:
        return 'SuperAdmin';
      case 12:
        return 'Blogger';
      case 13:
        return 'Site Manager';
      default:
        return 'Unknown';
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setEditLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();
      if (data.success) {
        onRefresh();
        setEditingUser(null);
        setEditFormData({});
        onNotification?.('success', 'User Updated', 'User has been updated successfully!');
      } else {
        onNotification?.('error', 'Update Failed', data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      onNotification?.('error', 'Update Failed', 'Error updating user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal.user) return;
    
    setDeleteLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/users/${deleteModal.user.id}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        onRefresh();
        setDeleteModal({ isOpen: false, user: null });
        onNotification?.('success', 'User Deleted', 'User has been deleted successfully!');
      } else {
        onNotification?.('error', 'Delete Failed', data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      onNotification?.('error', 'Delete Failed', 'Error deleting user');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Table */}
      <div className="bg-white rounded border border-themeTealLighter">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-themeTeal border-b border-themeTealLighter">
              <tr>
                <SortableHeader
                  field="first_name"
                  sortBy={sortBy || ''}
                  sortOrder={sortOrder || 'desc'}
                  onSort={onSort || (() => {})}
                  className="w-1/3 px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer hover:bg-themeTeal/80 transition-colors"
                >
                  User name
                </SortableHeader>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                  Access
                </th>
                <SortableHeader
                  field="last_active"
                  sortBy={sortBy || ''}
                  sortOrder={sortOrder || 'desc'}
                  onSort={onSort || (() => {})}
                  className="w-1/6 px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer hover:bg-themeTeal/80 transition-colors"
                >
                  Last active
                </SortableHeader>
                <SortableHeader
                  field="createdAt"
                  sortBy={sortBy || ''}
                  sortOrder={sortOrder || 'desc'}
                  onSort={onSort || (() => {})}
                  className="w-1/6 px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer hover:bg-themeTeal/80 transition-colors"
                >
                  Date added
                </SortableHeader>
                <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-themeTealLighter">
              {users.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-gray-50 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  {/* User Column with Name, Email and Phone */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-themeTeal flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-themeTealWhite">
                          {user.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-themeTeal">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-themeTealLighter truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Access Column (Role) */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 11 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 10 
                          ? 'bg-green-100 text-green-800'
                          : user.role === 12
                          ? 'bg-blue-100 text-blue-800'
                          : user.role === 13
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                  </td>

                  {/* Last Active Column */}
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    <div className="truncate">
                      {user.last_active ? (
                        <span className="text-xs">
                          {new Date(user.last_active).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-themeTeal">
                          Never
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date Added Column */}
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    <div className="truncate">
                      <span className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-sm font-medium">
                    {canManageUsers ? (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="flex items-center space-x-1 px-2 py-1 bg-themeTeal rounded text-themeTealWhite hover:bg-themeTealWhite hover:text-themeTeal transition duration-300 cursor-pointer"
                        >
                          <LucideSquarePen width={16} height={16}/>
                          <span className="text-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="flex items-center space-x-1 bg-red-700 px-2 py-1 rounded text-themeTealWhite transition duration-300 cursor-pointer hover:bg-themeTealWhite hover:text-red-700"
                        >
                          <Trash2 width={16} height={16}/>
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-themeTealLighter text-xs">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Edit User</h3>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setEditFormData({});
                  }}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-themeTeal mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFormData.first_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition-all duration-200 text-themeTeal"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-themeTeal mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.last_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition-all duration-200 text-themeTeal"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition-all duration-200 text-themeTeal"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">User Role</label>
                <select
                  value={editFormData.role || 12}
                  onChange={(e) => setEditFormData({...editFormData, role: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition-all duration-200 text-themeTeal"
                >
                  <option value={12}>Blogger</option>
                  <option value={13}>Site Manager</option>
                  <option value={10}>Admin</option>
                  <option value={11}>SuperAdmin</option>
                </select>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-4 py-3 bg-themeTealWhite flex justify-end flex-shrink-0 rounded-b-2xl">
              <button
                onClick={handleUpdateUser}
                disabled={editLoading}
                className="px-6 py-3 text-sm bg-themeTeal text-white rounded hover:bg-themeTealLight transition-colors duration-200 disabled:opacity-50 font-medium flex items-center"
              >
                {editLoading ? (
                  <Loader size="sm" text="Updating..." />
                ) : (
                  'Update User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.user?.first_name} ${deleteModal.user?.last_name}? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default UserTable;
