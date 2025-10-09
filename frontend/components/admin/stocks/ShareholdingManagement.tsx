'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle } from 'lucide-react';
import { StockShareholding, ShareholdingFormData, ShareholdingManagementProps } from './types';

export default function ShareholdingManagement({ stockId, stockName, onClose }: ShareholdingManagementProps) {
  const [shareholdingData, setShareholdingData] = useState<StockShareholding[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ShareholdingFormData>({
    holder_name: '',
    percentage: 0
  });

  const loadShareholdingData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/stocks/${stockId}/shareholding`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
      });

      const result = await response.json();
      if (result.success) {
        console.log('Shareholding data received:', result.data);
        setShareholdingData(result.data || []);
      } else {
        console.error('Failed to load shareholding data:', result.message);
        setShareholdingData([]);
      }
    } catch (error) {
      console.error('Error loading shareholding data:', error);
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    loadShareholdingData();
  }, [loadShareholdingData]);

  const handleAdd = async () => {
    if (!formData.holder_name.trim() || formData.percentage <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/stocks/${stockId}/shareholding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
        body: JSON.stringify({
          holder_name: formData.holder_name,
          percentage: formData.percentage
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholdingData();
        setShowAddForm(false);
        setFormData({ holder_name: '', percentage: 0 });
      } else {
        alert(result.message || 'Failed to add shareholding entry');
      }
    } catch (error) {
      console.error('Error adding shareholding:', error);
      alert('Failed to add shareholding entry');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.holder_name.trim() || formData.percentage <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/shareholding/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
        body: JSON.stringify({
          holder_name: formData.holder_name,
          percentage: formData.percentage
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholdingData();
        setEditingId(null);
        setFormData({ holder_name: '', percentage: 0 });
      } else {
        alert(result.message || 'Failed to update shareholding entry');
      }
    } catch (error) {
      console.error('Error updating shareholding:', error);
      alert('Failed to update shareholding entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shareholding entry?')) {
      return;
    }

    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/shareholding/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholdingData();
      } else {
        alert(result.message || 'Failed to delete shareholding entry');
      }
    } catch (error) {
      console.error('Error deleting shareholding:', error);
      alert('Failed to delete shareholding entry');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: StockShareholding) => {
    setEditingId(item.id);
    setFormData({
      holder_name: item.holder_name,
      percentage: item.percentage,
      holder_type: item.holder_type
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ holder_name: '', percentage: 0 });
  };

  const totalPercentage = shareholdingData.reduce((sum, item) => {
    const percentage = typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0;
    return sum + percentage;
  }, 0);

  // Ensure totalPercentage is always a number
  const safeTotalPercentage = typeof totalPercentage === 'number' ? totalPercentage : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-themeTeal to-themeTealLight p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manage Shareholding</h2>
              <p className="text-white/80">{stockName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Total Percentage Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">Total Shareholding:</span>
              <span className={`text-2xl font-bold ${safeTotalPercentage > 100 ? 'text-red-600' : safeTotalPercentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {safeTotalPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Shareholding Entry
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-base font-semibold mb-4">Add New Shareholding Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.holder_name}
                    onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                    placeholder="e.g., Promoters, Mutual Funds"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                    placeholder="0.00"
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
                  {saving ? 'Adding...' : 'Add Entry'}
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

          {/* Shareholding List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading shareholding data...</p>
            </div>
          ) : shareholdingData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No shareholding data found. Add your first entry above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareholdingData.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                  {editingId === item.id ? (
                    // Edit Form
                    <div>
                      <h3 className="text-base font-semibold mb-4">Edit Shareholding Entry</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Holder Name *
                          </label>
                          <input
                            type="text"
                            value={formData.holder_name}
                            onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Percentage *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.percentage}
                            onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
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
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.holder_name}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-themeTeal">{(typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0).toFixed(2)}%</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
