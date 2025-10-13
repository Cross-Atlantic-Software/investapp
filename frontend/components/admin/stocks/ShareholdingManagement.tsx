'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { StockShareholding, ShareholdingFormData, ShareholdingManagementProps, ShareholderType } from './types';
import { NotificationContainer, NotificationData } from '../shared/Notification';
import ConfirmationModal from '../shared/ConfirmationModal';

export default function ShareholdingManagement({ stockId, stockName, onClose }: ShareholdingManagementProps) {
  const [shareholdingData, setShareholdingData] = useState<StockShareholding[]>([]);
  const [shareholderTypes, setShareholderTypes] = useState<ShareholderType[]>([]);
  const [activeShareholderTypes, setActiveShareholderTypes] = useState<ShareholderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShareholderTypeManagement, setShowShareholderTypeManagement] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });
  const [formData, setFormData] = useState<ShareholdingFormData>({
    holder_name: '',
    percentage: 0,
    shareholder_type_id: undefined
  });

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const loadShareholderTypes = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        console.warn('No admin token found. User needs to be logged in as admin.');
        setShareholderTypes([]);
        return;
      }
      
      const response = await fetch('/api/admin/shareholder-types', {
        headers: {
          'Content-Type': 'application/json',
          'token': token,
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
      setShareholderTypes([]);
    }
  }, []);

  const loadActiveShareholderTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/shareholder-types', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setActiveShareholderTypes(result.data || []);
      } else {
        console.error('Failed to load active shareholder types:', result.message);
        setActiveShareholderTypes([]);
      }
    } catch (error) {
      console.error('Error loading active shareholder types:', error);
    }
  }, []);

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
    loadShareholderTypes();
    loadActiveShareholderTypes();
  }, [loadShareholdingData, loadShareholderTypes, loadActiveShareholderTypes]);

  const handleAdd = async () => {
    if (!formData.holder_name.trim() || formData.percentage <= 0) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please fill in all required fields'
      });
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
          percentage: formData.percentage,
          shareholder_type_id: formData.shareholder_type_id
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholdingData();
        setShowAddForm(false);
        setFormData({ holder_name: '', percentage: 0, shareholder_type_id: undefined });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to add shareholding entry'
        });
      }
    } catch (error) {
      console.error('Error adding shareholding:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add shareholding entry'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.holder_name.trim() || formData.percentage <= 0) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please fill in all required fields'
      });
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
          percentage: formData.percentage,
          shareholder_type_id: formData.shareholder_type_id
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholdingData();
        setEditingId(null);
        setFormData({ holder_name: '', percentage: 0, shareholder_type_id: undefined });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to update shareholding entry'
        });
      }
    } catch (error) {
      console.error('Error updating shareholding:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update shareholding entry'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Shareholding Entry',
      message: 'Are you sure you want to delete this shareholding entry? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => deleteShareholding(id)
    });
  };

  const deleteShareholding = async (id: number) => {

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
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to delete shareholding entry'
        });
      }
    } catch (error) {
      console.error('Error deleting shareholding:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete shareholding entry'
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: StockShareholding) => {
    setEditingId(item.id);
    setFormData({
      holder_name: item.holder_name,
      percentage: item.percentage,
      holder_type: item.holder_type,
      shareholder_type_id: item.shareholder_type_id
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
      type: 'danger'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ holder_name: '', percentage: 0, shareholder_type_id: undefined });
  };

  // ShareholderType management functions
  const [shareholderTypeFormData, setShareholderTypeFormData] = useState({ name: '' });
  const [editingShareholderTypeId, setEditingShareholderTypeId] = useState<number | null>(null);

  const handleAddShareholderType = async () => {
    if (!shareholderTypeFormData.name.trim()) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please enter a shareholder type name'
      });
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
          name: shareholderTypeFormData.name.trim()
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholderTypes();
        await loadActiveShareholderTypes();
        setShareholderTypeFormData({ name: '' });
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Shareholder type added successfully'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to add shareholder type'
        });
      }
    } catch (error) {
      console.error('Error adding shareholder type:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add shareholder type'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShareholderType = async (id: number) => {
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
        await loadActiveShareholderTypes();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to delete shareholder type'
        });
      }
    } catch (error) {
      console.error('Error deleting shareholder type:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete shareholder type'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleShareholderTypeStatus = async (id: number) => {
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
        await loadActiveShareholderTypes();
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Shareholder type status updated successfully'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to toggle shareholder type status'
        });
      }
    } catch (error) {
      console.error('Error toggling shareholder type status:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to toggle shareholder type status'
      });
    } finally {
      setSaving(false);
    }
  };

  const startEditShareholderType = (type: ShareholderType) => {
    setEditingShareholderTypeId(type.id);
    setShareholderTypeFormData({ name: type.name });
  };

  const handleUpdateShareholderType = async (id: number) => {
    if (!shareholderTypeFormData.name.trim()) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please enter a shareholder type name'
      });
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
          name: shareholderTypeFormData.name.trim()
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadShareholderTypes();
        await loadActiveShareholderTypes();
        setEditingShareholderTypeId(null);
        setShareholderTypeFormData({ name: '' });
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Shareholder type updated successfully'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to update shareholder type'
        });
      }
    } catch (error) {
      console.error('Error updating shareholder type:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update shareholder type'
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelEditShareholderType = () => {
    setEditingShareholderTypeId(null);
    setShareholderTypeFormData({ name: '' });
  };

  const totalPercentage = shareholdingData.reduce((sum, item) => {
    const percentage = typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0;
    return sum + percentage;
  }, 0);

  // Ensure totalPercentage is always a number
  const safeTotalPercentage = typeof totalPercentage === 'number' ? totalPercentage : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 m-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-themeTeal p-6 text-themeTealWhite">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Manage Shareholding</h2>
              <p className="text-sm text-themeTealLighter">{stockName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Total Percentage Display */}
          <div className="mb-6 p-4 bg-themeTealWhite rounded">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-themeTeal">Total Shareholding:</span>
              <span className={`text-2xl font-bold ${safeTotalPercentage > 100 ? 'text-rose-700' : safeTotalPercentage === 100 ? 'text-green-700' : 'text-orange-700'}`}>
                {safeTotalPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Add Buttons */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => {
                setShowAddForm(true);
                setShowShareholderTypeManagement(false);
              }}
              className="buttonStyle flex gap-2 items-center"
            >
              <Plus className="w-4 h-4" />
              Add Shareholding Entry
            </button>
            <button
              onClick={() => {
                setShowShareholderTypeManagement(!showShareholderTypeManagement);
                setShowAddForm(false);
              }}
              className="buttonStyleLight flex gap-2 items-center"
            >
              <Settings className="w-4 h-4" />
              Manage Shareholder Types
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-themeTealLighter rounded bg-themeTealWhite">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-themeTeal">Add New Shareholding Entry</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-themeTeal hover:text-themeSkyBlue transition duration-300"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-themeTealLight mb-1">
                    Holder Name<span className='text-rose-600'>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.holder_name}
                    onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                    className="input-theme"
                    placeholder="e.g., Promoters, Mutual Funds"
                  />
                </div>
                <div>
                  <label className="block text-sm text-themeTealLight mb-1">
                    Percentage<span className='text-rose-600'>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                    className="input-theme"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-themeTealLight mb-1">
                    Shareholder Type
                  </label>
                  <select
                    value={formData.shareholder_type_id || ''}
                    onChange={(e) => setFormData({ ...formData, shareholder_type_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="input-theme"
                  >
                    <option value="">Select Type</option>
                    {activeShareholderTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="buttonStyleSkyBlue flex gap-2 items-center"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Adding...' : 'Add Entry'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="buttonStyleLight flex gap-2 items-center"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Shareholder Type Management */}
          {showShareholderTypeManagement && (
            <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-themeTeal">Manage Shareholder Types</h3>
                <button
                  onClick={() => setShowShareholderTypeManagement(false)}
                  className="text-themeTealLight hover:text-themeTeal"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Add New Type Form */}
              <div className="mb-4 p-3 bg-white rounded border border-themeTealLighter">
                <h4 className="text-sm mb-2 text-themeTealLight">Add New Type</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareholderTypeFormData.name}
                    onChange={(e) => setShareholderTypeFormData({ name: e.target.value })}
                    className="input-theme"
                    placeholder="Enter shareholder type name"
                  />
                  <button
                    onClick={handleAddShareholderType}
                    disabled={saving}
                    className="buttonStyleSkyBlue flex gap-2 items-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Types List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-themeTeal">Existing Types</h4>
                {shareholderTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">No shareholder types found. Please log in as admin to manage types.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {shareholderTypes.map((type) => (
                      <div key={type.id} className="flex items-center justify-between p-2 bg-white rounded border border-themeTealLighter">
                        {editingShareholderTypeId === type.id ? (
                          // Edit Mode
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={shareholderTypeFormData.name}
                              onChange={(e) => setShareholderTypeFormData({ name: e.target.value })}
                              className="flex-1 px-2 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300"
                            />
                            <button
                              onClick={() => handleUpdateShareholderType(type.id)}
                              disabled={saving}
                              className="px-2 py-2 text-sm bg-themeSkyBlue text-white rounded hover:bg-themeTeal disabled:opacity-50 transition duration-300"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditShareholderType}
                              className="px-2 py-2 text-sm bg-themeTealLight text-white rounded hover:bg-themeTealLighter transition duration-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // Display Mode
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-themeTeal font-medium">{type.name}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                type.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {type.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEditShareholderType(type)}
                                className="p-2 text-blue-600 bg-themeSkyBlue/20 rounded text-themeTeal"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleToggleShareholderTypeStatus(type.id)}
                                disabled={saving}
                                className={`p-2 rounded bg-themeTealLighter/20 ${
                                  type.is_active 
                                    ? 'text-orange-600' 
                                    : 'text-green-600'
                                }`}
                                title={type.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {type.is_active ? (
                                  <ToggleRight className="w-3 h-3" />
                                ) : (
                                  <ToggleLeft className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteShareholderType(type.id)}
                                className="p-2 text-red-700 bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                <div key={item.id} className="p-4 border border-themeTealWhite rounded bg-white">
                  {editingId === item.id ? (
                    // Edit Form
                    <div>
                      <h3 className="text-base font-semibold mb-4 text-themeTeal">Edit Shareholding Entry</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-themeTealLight mb-1">
                            Holder Name<span className='text-rose-600'>*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.holder_name}
                            onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                            className="input-theme"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-themeTealLight mb-1">
                            Percentage<span className='text-rose-600'>*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formData.percentage}
                            onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                            className="input-theme"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-themeTealLight mb-1">
                            Shareholder Type
                          </label>
                          <select
                            value={formData.shareholder_type_id || ''}
                            onChange={(e) => setFormData({ ...formData, shareholder_type_id: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="input-theme"
                          >
                            <option value="">Select Type</option>
                            {activeShareholderTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleUpdate(item.id)}
                          disabled={saving}
                          className="buttonStyleSkyBlue flex gap-2 items-center"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="buttonStyleLight flex gap-2 items-center"
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
                        <h3 className="text-sm font-medium text-themeTeal">{item.holder_name}</h3>
                        {item.shareholder_type_id && (
                          <p className="text-xs text-themeTealLighter mt-1">
                            {shareholderTypes.find(type => type.id === item.shareholder_type_id)?.name || 'Unknown Type'}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-themeTeal">{(typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0).toFixed(2)}%</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-themeSkyBlue bg-themeSkyBlue/10 hover:bg-themeSkyBlue/20 transition duration-300 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 transition duration-300 rounded"
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
      
      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={() => {
          confirmationModal.onConfirm();
          closeConfirmationModal();
        }}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
