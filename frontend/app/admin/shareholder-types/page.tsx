'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, XCircle, Eye, EyeOff } from 'lucide-react';

interface ShareholderType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ShareholderTypeFormData {
  name: string;
}

export default function ShareholderTypeManagement() {
  const [shareholderTypes, setShareholderTypes] = useState<ShareholderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ShareholderTypeFormData>({
    name: ''
  });

  const loadShareholderTypes = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch('/api/admin/shareholder-types', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
      });

      const result = await response.json();
      if (result.success) {
        setShareholderTypes(result.data || []);
      } else {
        console.error('Failed to load shareholder types:', result.message);
        setShareholderTypes([]);
      }
    } catch (error) {
      console.error('Error loading shareholder types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShareholderTypes();
  }, []);

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a shareholder type name');
      return;
    }

    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch('/api/admin/shareholder-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
        body: JSON.stringify({
          name: formData.name.trim()
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholderTypes();
        setShowAddForm(false);
        setFormData({ name: '' });
      } else {
        alert(result.message || 'Failed to add shareholder type');
      }
    } catch (error) {
      console.error('Error adding shareholder type:', error);
      alert('Failed to add shareholder type');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) {
      alert('Please enter a shareholder type name');
      return;
    }

    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/shareholder-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
        body: JSON.stringify({
          name: formData.name.trim()
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholderTypes();
        setEditingId(null);
        setFormData({ name: '' });
      } else {
        alert(result.message || 'Failed to update shareholder type');
      }
    } catch (error) {
      console.error('Error updating shareholder type:', error);
      alert('Failed to update shareholder type');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shareholder type?')) {
      return;
    }

    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/shareholder-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholderTypes();
      } else {
        alert(result.message || 'Failed to delete shareholder type');
      }
    } catch (error) {
      console.error('Error deleting shareholder type:', error);
      alert('Failed to delete shareholder type');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/shareholder-types/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholderTypes();
      } else {
        alert(result.message || 'Failed to toggle shareholder type status');
      }
    } catch (error) {
      console.error('Error toggling shareholder type status:', error);
      alert('Failed to toggle shareholder type status');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: ShareholderType) => {
    setEditingId(item.id);
    setFormData({
      name: item.name
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '' });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shareholder Type Management</h1>
        <p className="text-gray-600">Manage shareholder types for stock shareholding data</p>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Shareholder Type
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-base font-semibold mb-4">Add New Shareholder Type</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                placeholder="e.g., Promoters, Institutional Investors"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Adding...' : 'Add Type'}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shareholder Types List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading shareholder types...</p>
        </div>
      ) : shareholderTypes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No shareholder types found. Add your first type above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shareholderTypes.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {editingId === item.id ? (
                    // Edit Form
                    <td colSpan={3} className="p-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-base font-semibold mb-4">Edit Shareholder Type</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleUpdate(item.id)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    // Display Mode
                    <>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item.id)}
                            disabled={saving}
                            className={`p-2 rounded-lg transition-colors ${
                              item.is_active 
                                ? 'text-orange-600 hover:bg-orange-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={item.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
