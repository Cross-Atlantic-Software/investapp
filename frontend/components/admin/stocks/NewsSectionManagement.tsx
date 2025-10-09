'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { StockNewsSection, NewsSectionFormData, NewsSectionManagementProps } from './types';

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
      alert('Please fill in all required fields');
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
        alert('News section added successfully');
      } else {
        alert(result.message || 'Failed to add news section');
      }
    } catch (error) {
      console.error('Error adding news section:', error);
      alert('Failed to add news section');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.title.trim() || !formData.url.trim()) {
      alert('Please fill in all required fields');
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
        alert('News section updated successfully');
      } else {
        alert(result.message || 'Failed to update news section');
      }
    } catch (error) {
      console.error('Error updating news section:', error);
      alert('Failed to update news section');
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
        alert(result.message || 'Failed to delete news section');
      }
    } catch (error) {
      console.error('Error deleting news section:', error);
      alert('Failed to delete news section');
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
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
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
        alert('Banner uploaded successfully');
      } else {
        alert(result.message || 'Failed to upload banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">News Section Management</h2>
            <p className="text-sm text-gray-600">{stockName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add News Section
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Add New News Section</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                    placeholder="Enter news title"
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
                    placeholder="https://example.com/news"
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
                      id="banner-upload"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
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
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Add News Section
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

          {/* News Sections List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading news sections...</p>
            </div>
          ) : newsSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No news sections found. Add your first news section above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newsSections.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-white">
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{item.url}</p>
                        {item.banner && (
                          <div className="mb-2">
                            <div className="flex items-center gap-2">
                              <div className="h-32 w-32 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                <Image
                                  src={item.banner}
                                  alt={item.title}
                                  width={64}
                                  height={64}
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <ImageIcon className="w-3 h-3" />
                                Banner image
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Created: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
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
    </div>
  );
}

