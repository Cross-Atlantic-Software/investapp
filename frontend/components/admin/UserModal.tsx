'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  country_code: string;
  role: number;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    country_code: '+1',
    role: 12 // Default to Blogger role (will be adjusted based on available roles)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current user's role to determine available options
  const getCurrentUserRole = () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.role; // Returns 10 for Admin, 11 for SuperAdmin, 12 for Blogger, 13 for SiteManager
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
    return 10; // Default to Admin if can't determine
  };

  const currentUserRole = getCurrentUserRole();

  // Define available roles based on current user's permissions
  const availableRoles = useMemo(() => {
    const roles = [];

    // Only Admin and SuperAdmin can create users
    if (currentUserRole === 10) {
      // Admin can create: Blogger, Site Manager, and Admin users
      roles.push(
        { value: 12, label: 'Blogger' },
        { value: 13, label: 'Site Manager' },
        { value: 10, label: 'Admin' }
      );
    } else if (currentUserRole === 11) {
      // SuperAdmin can create: Blogger, Site Manager, Admin, and SuperAdmin users
      roles.push(
        { value: 12, label: 'Blogger' },
        { value: 13, label: 'Site Manager' },
        { value: 10, label: 'Admin' },
        { value: 11, label: 'SuperAdmin' }
      );
    }
    // If user is not Admin or SuperAdmin, they cannot create any users
    // (This should not happen as the modal should not be accessible to them)

    return roles;
  }, [currentUserRole]);

  // Note: User creation is controlled by the parent component (users page)
  // which only shows the Create User button for Admin and SuperAdmin users

  // Set default role when modal opens
  const hasSetDefaultRole = useRef(false);
  useEffect(() => {
    if (isOpen && availableRoles.length > 0 && !hasSetDefaultRole.current) {
      setFormData(prev => ({
        ...prev,
        role: availableRoles[0].value
      }));
      hasSetDefaultRole.current = true;
    }
    if (!isOpen) {
      hasSetDefaultRole.current = false;
    }
  }, [isOpen, availableRoles]);

  // Note: The modal should only be accessible to Admin and SuperAdmin users
  // This is controlled by the parent component (users page) which hides the button

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // auth_provider is set automatically by backend based on current user's role
      
      const response = await fetch('http://localhost:8888/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          phone: '',
          country_code: '+1',
          role: 10
        });
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-themeTeal font-serif">Create New User</h2>
          <button
            onClick={onClose}
            className="text-themeTealLighter hover:text-themeTeal transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-themeTeal mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-themeTeal mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-themeTeal mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-themeTeal mb-1">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="country_code" className="block text-sm font-medium text-themeTeal mb-1">
                Country Code
              </label>
              <select
                id="country_code"
                name="country_code"
                value={formData.country_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
              >
                <option value="+1">+1 (US)</option>
                <option value="+91">+91 (India)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+86">+86 (China)</option>
                <option value="+81">+81 (Japan)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-themeTeal mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-themeTeal mb-1">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
            >
              {availableRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-themeTealLighter mt-1">
              {currentUserRole === 10 
                ? "You can create: Blogger, Site Manager, and Admin users"
                : currentUserRole === 11
                ? "You can create: Blogger, Site Manager, Admin, and SuperAdmin users"
                : "Select a role for the new user"
              }
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-themeTealLighter hover:text-themeTeal transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-themeTeal text-themeTealWhite rounded-md hover:bg-themeTealLight transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
