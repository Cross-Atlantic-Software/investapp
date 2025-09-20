'use client';

import React, { useState } from 'react';

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
  createdAt: string;
  updatedAt: string;
}

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onRefresh }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Get current user's role to determine permissions
  const getCurrentUserRole = () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
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
      phone: user.phone,
      country_code: user.country_code,
      role: user.role
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setEditLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`http://localhost:8888/api/admin/users/${editingUser.id}`, {
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
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.error('No token found');
          return;
        }
        const response = await fetch(`http://localhost:8888/api/admin/users/${id}`, {
          method: 'DELETE',
        headers: {
          'token': token,
        },
        });
        
        const data = await response.json();
        if (data.success) {
          onRefresh();
        } else {
          alert(data.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-themeTealLighter">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-500 text-center">← Scroll horizontally to see all columns →</p>
      </div>
      <div className="overflow-x-auto" style={{ maxWidth: '100%', width: '100%', scrollbarWidth: 'thin', scrollbarColor: '#c1c1c1 #f1f1f1' }}>
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
          <thead className="bg-themeTealWhite">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider w-48">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider w-64">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider w-32">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider w-32">
                Auth Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider w-32">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider w-32">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-themeTealLighter">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-themeTealWhite flex items-center justify-center">
                        <span className="text-sm font-medium text-themeTeal">
                          {user.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-themeTeal">
                        {user.first_name} {user.last_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                  {user.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-themeTealWhite text-themeTeal">
                    {user.auth_provider}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 11 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 10 
                      ? 'bg-blue-100 text-blue-800'
                      : user.role === 12
                      ? 'bg-green-100 text-green-800'
                      : user.role === 13
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTealLighter">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {canManageUsers ? (
                    <>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-themeTeal hover:text-themeTealLight mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="text-themeTealLighter text-xs">View Only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-themeTeal mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">First Name</label>
                <input
                  type="text"
                  value={editFormData.first_name || ''}
                  onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Last Name</label>
                <input
                  type="text"
                  value={editFormData.last_name || ''}
                  onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Phone</label>
                <input
                  type="text"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Country Code</label>
                <input
                  type="text"
                  value={editFormData.country_code || ''}
                  onChange={(e) => setEditFormData({...editFormData, country_code: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Role</label>
                <select
                  value={editFormData.role || 12}
                  onChange={(e) => setEditFormData({...editFormData, role: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                >
                  <option value={12}>Blogger</option>
                  <option value={13}>Site Manager</option>
                  <option value={10}>Admin</option>
                  <option value={11}>SuperAdmin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setEditFormData({});
                }}
                className="px-4 py-2 text-themeTealLighter hover:text-themeTeal transition-colors duration-200"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={editLoading}
                className="px-4 py-2 bg-themeTeal text-themeTealWhite rounded-md hover:bg-themeTealLight transition-colors duration-200 disabled:opacity-50"
              >
                {editLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
