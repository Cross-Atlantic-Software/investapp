'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { StockNewsSection, NewsSectionFormData, NewsSectionManagementProps } from './types';
import { NotificationContainer, NotificationData } from '../shared/Notification';

export default function NewsSectionManagement({ stockId, stockName, onClose }: NewsSectionManagementProps) {
  const [newsSections, setNewsSections] = useState<StockNewsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<NewsSectionFormData>({
    title: '',
    url: '',
    banner: ''
  });
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const loadNewsSections = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/stocks/${stockId}/news-sections`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
      });

      const result = await response.json();
      if (result.success) {
        setNewsSections(result.data.newsSections || []);
      } else {
        console.error('Failed to load news sections:', result.message);
        setNewsSections([]);
      }
    } catch (error) {
      console.error('Error loading news sections:', error);
      setNewsSections([]);
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    loadNewsSections();
  }, [loadNewsSections]);

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
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
      const response = await fetch(`/api/admin/stocks/${stockId}/news-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        await loadNewsSections();
        setFormData({ title: '', url: '', banner: '' });
        setShowAddForm(false);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'News section added successfully'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to add news section'
        });
      }
    } catch (error) {
      console.error('Error adding news section:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add news section'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.title.trim() || !formData.url.trim()) {
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
      const response = await fetch(`/api/admin/news-sections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        await loadNewsSections();
        setEditingId(null);
        setFormData({ title: '', url: '', banner: '' });
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'News section updated successfully'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to update news section'
        });
      }
    } catch (error) {
      console.error('Error updating news section:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update news section'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/news-sections/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
      });

      const result = await response.json();
      if (result.success) {
        await loadNewsSections();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to delete news section'
        });
      }
    } catch (error) {
      console.error('Error deleting news section:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete news section'
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: StockNewsSection) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      url: item.url,
      banner: item.banner
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ title: '', url: '', banner: '' });
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please select an image file'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'File size must be less than 5MB'
      });
      return;
    }

    try {
      setUploadingBanner(true);
      const token = sessionStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('banner', file);

      const response = await fetch('/api/admin/news-sections/upload-banner', {
        method: 'POST',
        headers: {
          ...(token && { 'token': token }),
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, banner: result.data.url }));
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Banner uploaded successfully'
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to upload banner'
        });
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload banner'
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded shadow w-full max-w-4xl mx-4 my-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl font-bold text-themeTealWhite">
                  {stockName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-themeTealWhite">News Section Management</h3>
                <p className="text-sm text-themeTealLighter">{stockName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add News Section
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-6 border border-themeTealLighter rounded-lg bg-themeTealWhite">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-themeTeal">Add New News Section</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-themeTealLight hover:text-themeTeal hover:bg-themeTealLighter rounded-lg transition-colors duration-200"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-themeTealLighter rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-themeTeal transition-colors duration-200"
                    placeholder="Enter news title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-3 text-sm border border-themeTealLighter rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-themeTeal transition-colors duration-200"
                    placeholder="https://example.com/news"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-themeTeal mb-2">
                    Banner Image
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="flex items-center gap-2 px-4 py-3 text-sm border border-themeTealLighter rounded-lg hover:bg-themeTealWhite cursor-pointer transition-colors duration-200"
                    >
                      <ImageIcon className="w-5 h-5 text-themeTeal" />
                      {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                    </label>
                    {formData.banner && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="h-16 w-16 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                            <Image
                              src={formData.banner}
                              alt="Banner preview"
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-md object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <ImageIcon className="w-4 h-4" />
                            Banner uploaded
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-themeTealLighter">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 font-medium"
                >
                  <Save className="w-5 h-5" />
                  Add News Section
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-6 py-3 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* News Sections List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto"></div>
              <p className="mt-2 text-sm text-themeTealLight">Loading news sections...</p>
            </div>
          ) : newsSections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-themeTealLight">No news sections found. Add your first news section above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {newsSections.map((item) => (
                <div key={item.id} className="p-6 border border-themeTealLighter rounded-lg bg-themeTealWhite shadow-sm">
                  {editingId === item.id ? (
                    // Edit Form
                    <div>
                      <h3 className="text-base font-semibold mb-4">Edit News Section</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL *
                          </label>
                          <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Banner Image
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerUpload}
                              className="hidden"
                              id={`banner-upload-${item.id}`}
                            />
                            <label
                              htmlFor={`banner-upload-${item.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <ImageIcon className="w-4 h-4" />
                              {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                            </label>
                            {formData.banner && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-32 w-32 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                    <Image
                                      src={formData.banner}
                                      alt="Banner preview"
                                      width={64}
                                      height={64}
                                      className="h-16 w-16 rounded-md object-cover"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-green-600">
                                    <ImageIcon className="w-4 h-4" />
                                    Banner uploaded
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleUpdate(item.id)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          Update
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
                    <div className="flex items-start gap-4">
                      {/* Image Section */}
                      <div className="flex-shrink-0">
                        {item.banner ? (
                          <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.banner}
                              alt={item.title}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-themeTeal truncate">{item.title}</h3>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-themeTeal hover:text-themeTealLight transition-colors duration-200"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-xs text-themeTealLight mb-2 truncate">{item.url}</p>
                        {item.banner && (
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-3 h-3 text-themeTealLight" />
                            <span className="text-xs text-themeTealLight">Banner image</span>
                          </div>
                        )}
                        <p className="text-xs text-themeTealLight">
                          Created: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 text-themeTeal hover:bg-themeTealWhite rounded-lg transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
    </div>
  );
}

