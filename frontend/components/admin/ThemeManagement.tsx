'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import Loader from './shared/Loader';

interface Theme {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default function ThemeManagement() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchThemes();
  }, [searchTerm]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/themes?${params.toString()}`, {
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        setThemes(data.data.themes);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const url = editingTheme 
        ? `/api/admin/themes/${editingTheme.id}`
        : '/api/admin/themes';
      
      const response = await fetch(url, {
        method: editingTheme ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        fetchThemes();
        setShowModal(false);
        setEditingTheme(null);
        setFormData({ name: '' });
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Failed to save theme');
    }
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({ name: theme.name });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/themes/${id}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchThemes();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      alert('Failed to delete theme');
    }
  };

  const openAddModal = () => {
    setEditingTheme(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      {/* Search and Add Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeTealDark transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Theme
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-themeTeal text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Theme Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created At</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {themes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No themes found
                  </td>
                </tr>
              ) : (
                themes.map((theme) => (
                  <tr key={theme.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{theme.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{theme.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {theme.created_at ? new Date(theme.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(theme)}
                          className="inline-flex items-center px-3 py-1.5 bg-themeTeal text-white text-sm rounded hover:bg-themeTealDark transition-colors duration-200"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(theme.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
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
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-2xl border border-themeTealLighter" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-themeTealLight hover:text-themeTeal transition duration-300"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-themeTeal">
              {editingTheme ? 'Edit Theme' : 'Add Theme'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Theme Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal text-themeTeal placeholder:text-themeTealLighter"
                  placeholder="e.g., Technology, Healthcare"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-themeTeal text-white rounded hover:bg-themeSkyBlue transition duration-300"
                >
                  {editingTheme ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

