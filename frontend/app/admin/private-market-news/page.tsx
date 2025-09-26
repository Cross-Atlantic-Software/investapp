'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Search, X } from 'lucide-react';
import Loader from '@/components/admin/shared/Loader';
import { NotificationContainer, NotificationData } from '@/components/admin/shared/Notification';
import SearchableMultiSelect from '@/components/admin/shared/SearchableMultiSelect';

interface PrivateMarketNewsItem {
  id: number;
  title: string;
  url: string;
  icon: string;
  taxonomy_ids: string;
  created_at: string;
  updated_at: string;
}

interface TaxonomyItem {
  id: number;
  name: string;
  color: string;
}

export default function PrivateMarketNewsPage() {
  const [news, setNews] = useState<PrivateMarketNewsItem[]>([]);
  const [taxonomies, setTaxonomies] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaxonomyModal, setShowTaxonomyModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PrivateMarketNewsItem | null>(null);
  const [newNews, setNewNews] = useState({
    title: '',
    url: '',
    icon: null as File | null,
    taxonomy_ids: [] as number[]
  });
  const [newTaxonomy, setNewTaxonomy] = useState({
    name: '',
    color: '#3B82F6'
  });
  
  // Refs to store current values to avoid circular dependencies
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  
  // Update refs when values change
  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);
  
  useEffect(() => {
    sortOrderRef.current = sortOrder;
  }, [sortOrder]);
  
  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchNews = useCallback(async (searchQuery = '', showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setIsInitialLoad(true);
      }
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort_by', sortByRef.current);
      params.append('sort_order', sortOrderRef.current.toUpperCase());
      
      const url = `/api/admin/private-market-news?${params.toString()}`;

      const headers: Record<string, string> = {};
      if (token) {
        headers['token'] = token;
      }

      const response = await fetch(url, {
        headers,
      });
      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Admin API Response:', data); // Debug log
      console.log('Data success:', data.success); // Debug log
      console.log('Data message:', data.message); // Debug log
      console.log('Data data:', data.data); // Debug log
      
      if (data.success && data.data && data.data.news) {
        setNews(data.data.news);
      } else {
        console.error('Error fetching private market news:', data.message || 'Unknown error');
        console.error('Full response:', data);
        setNews([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching private market news:', error);
      setNews([]); // Set empty array on error
    } finally {
      if (showLoading) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, []);

  // Separate search function that never touches loading states
  const searchNews = useCallback(async (searchQuery: string) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort_by', sortByRef.current);
      params.append('sort_order', sortOrderRef.current.toUpperCase());
      
      const url = `/api/admin/private-market-news?${params.toString()}`;

      const headers: Record<string, string> = {};
      if (token) {
        headers['token'] = token;
      }

      const response = await fetch(url, {
        headers,
      });
      const data = await response.json();
      console.log('Admin Search Response:', data); // Debug log
      if (data.success && data.data && data.data.news) {
        setNews(data.data.news);
      } else {
        console.error('Error searching private market news:', data.message || 'Unknown error');
        console.error('Full search response:', data);
        setNews([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error searching private market news:', error);
    }
  }, []);

  // Fetch taxonomies
  const fetchTaxonomies = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/taxonomies/active', {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        console.log('Fetched taxonomies:', data.data.taxonomies);
        setTaxonomies(data.data.taxonomies || []);
      }
    } catch (error) {
      console.error('Error fetching taxonomies:', error);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    fetchNews();
    fetchTaxonomies();
  }, [fetchNews, fetchTaxonomies]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchNews();
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
    }
    
    const timeoutId = setTimeout(() => {
      searchNews(searchTerm);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchTerm, searchNews]);

  // Separate effect for sorting changes
  useEffect(() => {
    if (searchTerm) {
      searchNews(searchTerm);
    } else {
      fetchNews('', false);
    }
  }, [sortBy, sortOrder, searchTerm, searchNews, fetchNews]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news item?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/private-market-news/${id}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchNews(searchTerm, false);
        addNotification({
          type: 'success',
          title: 'News Deleted',
          message: 'Private market news has been deleted successfully!',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete news item',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Error deleting news item',
        duration: 5000
      });
    }
  };

  const handleEdit = (item: PrivateMarketNewsItem) => {
    setEditingItem(item);
    setNewNews({
      title: item.title,
      url: item.url,
      icon: null, // Reset file input, keep existing icon URL in item.icon
      taxonomy_ids: parseTaxonomyIds(item.taxonomy_ids)
    });
    setShowEditModal(true);
  };

  const updateNews = async () => {
    if (!editingItem) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const formData = new FormData();
      formData.append('title', newNews.title);
      formData.append('url', newNews.url);
      formData.append('taxonomy_ids', JSON.stringify(newNews.taxonomy_ids));
      
      if (newNews.icon) {
        formData.append('icon', newNews.icon);
      }

      const response = await fetch(`/api/admin/private-market-news/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'News Updated',
          message: 'Private market news has been updated successfully!',
          duration: 5000
        });
        setShowEditModal(false);
        setEditingItem(null);
        setNewNews({ title: '', url: '', icon: null, taxonomy_ids: [] });
        fetchNews(searchTerm, false);
      } else {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: data.message || 'Failed to update news item',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating news item:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update news item',
        duration: 5000
      });
    }
  };

  const parseTaxonomyIds = (idsString: string) => {
    try {
      return JSON.parse(idsString);
    } catch {
      return [];
    }
  };

  const removeIcon = () => {
    setNewNews({...newNews, icon: null});
  };

  const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'No date';
    
    // Handle different date formats
    let date: Date;
    
    if (typeof dateValue === 'string') {
      // Check if it's only a time format (HH:mm:ss)
      if (dateValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
        // If it's only time, assume it's today
        const today = new Date();
        const [hours, minutes, seconds] = dateValue.split(':').map(Number);
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
      } else {
        // Try parsing as ISO string first
        date = new Date(dateValue);
        
        // If that fails, try parsing as MySQL datetime format
        if (isNaN(date.getTime())) {
          // Handle MySQL datetime format: YYYY-MM-DD HH:mm:ss
          const mysqlDate = dateValue.replace(' ', 'T');
          date = new Date(mysqlDate);
        }
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return 'Invalid format';
    }
    
    if (isNaN(date.getTime())) {
      console.log('Invalid date value:', dateValue, 'Type:', typeof dateValue);
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createNews = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const formData = new FormData();
      formData.append('title', newNews.title);
      formData.append('url', newNews.url);
      formData.append('taxonomy_ids', JSON.stringify(newNews.taxonomy_ids));
      
      if (newNews.icon) {
        formData.append('icon', newNews.icon);
      }

      const response = await fetch('/api/admin/private-market-news', {
        method: 'POST',
        headers: {
          ...(token && { 'token': token }),
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewNews({ title: '', url: '', icon: null, taxonomy_ids: [] });
        fetchNews();
        addNotification({
          type: 'success',
          title: 'News Created',
          message: 'Private market news has been created successfully!',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Create Failed',
          message: data.message || 'Failed to create news item',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating news:', error);
      addNotification({
        type: 'error',
        title: 'Create Failed',
        message: 'Error creating news item',
        duration: 5000
      });
    }
  };

  const createTaxonomy = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch('/api/admin/taxonomies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token }),
        },
        body: JSON.stringify({
          name: newTaxonomy.name,
          color: newTaxonomy.color,
        }),
      });

      const data = await response.json();
      console.log('Create taxonomy response:', data);
      if (data.success) {
        setShowTaxonomyModal(false);
        setNewTaxonomy({ name: '', color: '#3B82F6' });
        console.log('Refreshing taxonomies after creation...');
        await fetchTaxonomies();
        addNotification({
          type: 'success',
          title: 'Taxonomy Created',
          message: 'Taxonomy has been created successfully!',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Create Failed',
          message: data.message || 'Failed to create taxonomy',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating taxonomy:', error);
      addNotification({
        type: 'error',
        title: 'Create Failed',
        message: 'Error creating taxonomy',
        duration: 5000
      });
    }
  };

  const deleteTaxonomy = async (id: number) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const response = await fetch(`/api/admin/taxonomies/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'token': token }),
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchTaxonomies();
        addNotification({
          type: 'success',
          title: 'Taxonomy Deleted',
          message: 'Taxonomy has been deleted successfully!',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete taxonomy',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting taxonomy:', error);
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Error deleting taxonomy',
        duration: 5000
      });
    }
  };


  return (
    <div className="space-y-6 relative overflow-hidden max-h-screen overflow-y-auto">
      {loading && isInitialLoad ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" text="Loading private market news..." />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-themeTeal">Private Market News Management</h1>
            <p className="text-sm text-themeTealLight">Manage private market news and updates here.</p>
          </div>

          {/* Search Section */}
          <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-themeTeal">
                  All news <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{news.length}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by title or URL"
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal placeholder:text-themeTealLighter"
                />
                {isSearching ? (
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-themeTeal animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-themeTealLighter"/>
                )}
                
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 h-4 w-4 text-themeTealLight hover:text-themeTealLighter"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-themeTeal text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeSkyBlue transition duration-300 flex items-center cursor-pointer"
              >
                <Plus width={16} height={16} className='mr-1'/>
                Add News
              </button>
            </div>
          </div>
          
          {/* News Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxonomy
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {news.map((item) => {
                    const taxonomyIds = parseTaxonomyIds(item.taxonomy_ids);
                    const selectedTaxonomies = taxonomies.filter(t => taxonomyIds.includes(t.id));
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={item.title}>
                            {item.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate block max-w-xs">
                              {item.url}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                            {item.icon && item.icon.startsWith('http') ? (
                              <Image 
                                src={item.icon} 
                                alt="News icon" 
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextElement) nextElement.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span className="text-blue-600 font-semibold text-sm" style={{display: item.icon && item.icon.startsWith('http') ? 'none' : 'flex'}}>
                              {item.icon && item.icon.startsWith('http') ? 'N' : (item.icon || 'N')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {selectedTaxonomies.slice(0, 2).map((taxonomy) => (
                              <span 
                                key={taxonomy.id} 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white truncate"
                                style={{ backgroundColor: taxonomy.color }}
                                title={taxonomy.name}
                              >
                                {taxonomy.name}
                              </span>
                            ))}
                            {selectedTaxonomies.length > 2 && (
                              <span className="text-xs text-gray-500">+{selectedTaxonomies.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Create News Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New News</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNews.title}
                  onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter news title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newNews.url}
                  onChange={(e) => setNewNews({...newNews, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/news-article"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewNews({...newNews, icon: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newNews.icon && (
                  <div className="mt-2">
                    <div className="relative inline-block">
                      <img 
                        src={URL.createObjectURL(newNews.icon)} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={removeIcon}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taxonomy</label>
                <div className="space-y-2">
                  <SearchableMultiSelect
                    key={`taxonomy-dropdown-${taxonomies.map(t => t.id).join('-')}`}
                    options={taxonomies}
                    selectedValues={newNews.taxonomy_ids}
                    onChange={(selectedIds) => setNewNews({...newNews, taxonomy_ids: selectedIds})}
                    placeholder="Select taxonomies..."
                    className="w-full"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setShowTaxonomyModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus width={14} height={14} className="mr-1"/>
                      Add Taxonomy
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNews}
                disabled={!newNews.title || !newNews.url || !newNews.icon}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create News
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit News Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit News</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNews.title}
                  onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter news title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newNews.url}
                  onChange={(e) => setNewNews({...newNews, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter news URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewNews({...newNews, icon: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newNews.icon && (
                  <div className="mt-2">
                    <div className="relative inline-block">
                      <img 
                        src={URL.createObjectURL(newNews.icon)} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={removeIcon}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taxonomy</label>
                <div className="space-y-2">
                  <SearchableMultiSelect
                    key={`taxonomy-dropdown-${taxonomies.map(t => t.id).join('-')}`}
                    options={taxonomies}
                    selectedValues={newNews.taxonomy_ids}
                    onChange={(selectedIds) => setNewNews({...newNews, taxonomy_ids: selectedIds})}
                    placeholder="Select taxonomies..."
                    className="w-full"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setShowTaxonomyModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus width={14} height={14} className="mr-1"/>
                      Add Taxonomy
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setNewNews({ title: '', url: '', icon: null, taxonomy_ids: [] });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={updateNews}
                disabled={!newNews.title || !newNews.url || (!newNews.icon && !editingItem?.icon)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update News
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Taxonomy Management Modal */}
      {showTaxonomyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Manage Taxonomies</h3>
            
            {/* Create New Taxonomy */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-3">Create New Taxonomy</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newTaxonomy.name}
                    onChange={(e) => setNewTaxonomy({...newTaxonomy, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter taxonomy name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={newTaxonomy.color}
                      onChange={(e) => setNewTaxonomy({...newTaxonomy, color: e.target.value})}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newTaxonomy.color}
                      onChange={(e) => setNewTaxonomy({...newTaxonomy, color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <button
                  onClick={createTaxonomy}
                  disabled={!newTaxonomy.name}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Taxonomy
                </button>
              </div>
            </div>
            
            {/* Existing Taxonomies */}
            <div>
              <h4 className="text-md font-medium mb-3">Existing Taxonomies</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {taxonomies.map((taxonomy) => (
                  <div key={taxonomy.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: taxonomy.color }}
                      ></div>
                      <span className="text-sm">{taxonomy.name}</span>
                    </div>
                    <button
                      onClick={() => deleteTaxonomy(taxonomy.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTaxonomyModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
