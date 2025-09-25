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
    country_code: '+91',
    role: 12 // Default to Blogger role (will be adjusted based on available roles)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Get current user's role to determine available options
  const getCurrentUserRole = () => {
    try {
      const storedUser = sessionStorage.getItem('adminUser');
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
    
    // Clear phone error when user starts typing
    if (name === 'phone') {
      setPhoneError('');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone number - must be exactly 10 digits
    const phoneDigits = formData.phone.replace(/\D/g, ''); // Remove all non-digits
    if (phoneDigits.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';

      // auth_provider is set automatically by backend based on current user's role
      
      // Prepare form data with cleaned phone number
      const submitData = {
        ...formData,
        phone: phoneDigits // Use the cleaned 10-digit phone number
      };
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        },
        body: JSON.stringify(submitData),
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-themeTeal to-themeTealLight px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Create New User</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">

          <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-xs font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                placeholder="Enter email address"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                placeholder="Enter password (min 6 characters)"
              />
            </div>

            {/* Phone Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="country_code" className="block text-xs font-medium text-gray-700 mb-1">
                  Country Code
                </label>
                <select
                  id="country_code"
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                >
                  <option value="+91">+91 (India)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+86">+86 (China)</option>
                  <option value="+81">+81 (Japan)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const phoneDigits = e.target.value.replace(/\D/g, '');
                    if (e.target.value && phoneDigits.length !== 10) {
                      setPhoneError('Phone number must be exactly 10 digits');
                    } else {
                      setPhoneError('');
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200 ${
                    phoneError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
              >
                {availableRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-xs">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end flex-shrink-0 rounded-b-2xl">
          <button
            type="submit"
            form="user-form"
            disabled={loading}
            className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTealLight transition-colors duration-200 disabled:opacity-50 font-medium flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating User...
              </>
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
