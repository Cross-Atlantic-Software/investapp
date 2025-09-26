'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { Loader, NotificationContainer, NotificationData, ConfirmationModal, createSortHandler } from '@/components/admin/shared';
import { 
  NewsFormModal, 
  TaxonomyModal, 
  NewsTable,
  PrivateMarketNewsItem,
  TaxonomyItem,
  NewNewsForm,
  NewTaxonomyForm
} from '@/components/admin/private-market-news';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<PrivateMarketNewsItem | null>(null);
  const [newNews, setNewNews] = useState<NewNewsForm>({
    title: '',
    url: '',
    icon: null,
    taxonomy_ids: []
  });
  const [newTaxonomy, setNewTaxonomy] = useState<NewTaxonomyForm>({
    name: '',
    color: '#3B82F6'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Refs to store current values to avoid circular dependencies
  const currentPageRef = useRef(currentPage);
  const searchTermRef = useRef(searchTerm);
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  
  // Update refs when values change
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { searchTermRef.current = searchTerm; }, [searchTerm]);
  useEffect(() => { sortByRef.current = sortBy; }, [sortBy]);
  useEffect(() => { sortOrderRef.current = sortOrder; }, [sortOrder]);
  
  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Sort handler using the utility function
  const handleSort = createSortHandler(setSortBy, setSortOrder);

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseTaxonomyIds = (taxonomyIds: string): number[] => {
    if (!taxonomyIds) return [];
    try {
      const parsed = JSON.parse(taxonomyIds);
      if (Array.isArray(parsed)) {
        return parsed.map(id => typeof id === 'string' ? parseInt(id) : id).filter(id => !isNaN(id));
      }
      return [];
    } catch {
      return [];
    }
  };

  const fetchNews = useCallback(async (searchQuery = '', isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: currentPageRef.current.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        sort_by: sortByRef.current,
        sort_order: sortOrderRef.current
      });

      const response = await fetch(`/api/admin/private-market-news?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setNews(data.data.news);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.total);
      } else {
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          type: 'error',
          title: 'Fetch Failed',
          message: 'Failed to fetch private market news',
          duration: 5000
        }]);
      }
    } catch (error) {
      console.error('Error fetching private market news:', error);
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        title: 'Fetch Failed',
        message: 'Error fetching private market news',
        duration: 5000
      }]);
    } finally {
        setLoading(false);
      setIsSearching(false);
        setIsInitialLoad(false);
    }
  }, []);

  const fetchTaxonomies = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/taxonomies/active');
      const data = await response.json();

      if (data.success) {
        setTaxonomies(data.data.taxonomies);
      }
    } catch (error) {
      console.error('Error fetching taxonomies:', error);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    fetchNews();
    fetchTaxonomies();
  }, []); // Only run once on mount

  // Effect for pagination, search, and sorting changes
  useEffect(() => {
    if (currentPage !== 1 || searchTerm !== '' || sortBy !== 'created_at' || sortOrder !== 'desc') {
      fetchNews(searchTerm, false);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder, fetchNews]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const createNews = async (data: NewNewsForm) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('url', data.url);
      formData.append('taxonomy_ids', JSON.stringify(data.taxonomy_ids));
      
      if (data.icon) {
        formData.append('icon', data.icon);
      }

      const response = await fetch('/api/admin/private-market-news', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Private market news created successfully!',
          duration: 5000
        });
        setShowCreateModal(false);
        setNewNews({ title: '', url: '', icon: null, taxonomy_ids: [] });
        fetchNews(searchTerm, false);
      } else {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: result.message || 'Failed to create private market news',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating private market news:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Error creating private market news',
        duration: 5000
      });
    }
  };

  const updateNews = async (data: NewNewsForm) => {
    if (!editingItem) return;

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('url', data.url);
      formData.append('taxonomy_ids', JSON.stringify(data.taxonomy_ids));
      
      if (data.icon) {
        formData.append('icon', data.icon);
      }

      const response = await fetch(`/api/admin/private-market-news/${editingItem.id}`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Private market news updated successfully!',
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
          message: result.message || 'Failed to update private market news',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating private market news:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Error updating private market news',
        duration: 5000
      });
    }
  };

  const handleDelete = (id: number) => {
    setNewsToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteNews = async () => {
    if (!newsToDelete) return;

    try {
      const response = await fetch(`/api/admin/private-market-news/${newsToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Private market news deleted successfully!',
          duration: 5000
        });
        fetchNews(searchTerm, false);
      } else {
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: data.message || 'Failed to delete private market news',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting private market news:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Error deleting private market news',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setNewsToDelete(null);
    }
  };

  const createTaxonomy = async (data: NewTaxonomyForm) => {
    try {
      const response = await fetch('/api/admin/taxonomies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Taxonomy created successfully!',
          duration: 5000
        });
        setNewTaxonomy({ name: '', color: '#3B82F6' });
        fetchTaxonomies();
      } else {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: result.message || 'Failed to create taxonomy',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating taxonomy:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Error creating taxonomy',
        duration: 5000
      });
    }
  };

  const deleteTaxonomy = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/taxonomies/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Taxonomy deleted successfully!',
          duration: 5000
        });
        fetchTaxonomies();
      } else {
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: data.message || 'Failed to delete taxonomy',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting taxonomy:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Error deleting taxonomy',
        duration: 5000
      });
    }
  };

  const handleEdit = (item: PrivateMarketNewsItem) => {
    setEditingItem(item);
    setNewNews({
      title: item.title,
      url: item.url,
      icon: null,
      taxonomy_ids: parseTaxonomyIds(item.taxonomy_ids)
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-themeTealWhite">
          {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded p-6 shadow-sm shadow-themeTeal/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-themeTeal">Private Market News</h1>
              </div>
              <p className="text-themeTealLighter">Manage private market news and taxonomies</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                  <button
                onClick={() => setShowTaxonomyModal(true)}
                className="bg-themeTealLighter text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeTeal hover:text-white transition duration-300 flex items-center cursor-pointer"
                  >
                <Plus width={16} height={16} className='mr-1'/>
                Manage Taxonomies
                  </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-themeTeal text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeSkyBlue transition duration-300 flex items-center cursor-pointer"
              >
                <Plus width={16} height={16} className='mr-1'/>
                Add News
              </button>
            </div>
            </div>
          </div>

        {/* Search and Stats */}
        <div className="bg-white rounded p-6 shadow-sm shadow-themeTeal/10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter" width={16} height={16} />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-themeTealLighter rounded-md focus:outline-none text-themeTeal placeholder:text-themeTealLighter focus:border-themeTeal"
                />
              </div>
              {isSearching && <Loader />}
              </div>
              
            <div className="flex items-center gap-4">
              <div className="bg-themeTeal text-themeTealWhite px-4 py-2 rounded-md text-sm font-medium">
                Total: {totalItems}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow-sm shadow-themeTeal/10 mb-6">
          <div className="px-6 py-4 border-b border-themeTealLighter">
            <h2 className="text-lg font-semibold text-themeTeal">News ({totalItems})</h2>
          </div>
              
          <NewsTable
            news={news}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            formatDate={formatDate}
            parseTaxonomyIds={parseTaxonomyIds}
            taxonomies={taxonomies}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-themeTealLighter">
              <div className="flex items-center justify-between">
                <div className="text-sm text-themeTealLighter">
                  Page {currentPage} of {totalPages}
              </div>
                <div className="flex gap-2">
                      <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-themeTealLighter rounded-md hover:bg-themeTealWhite disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                      </button>
                    <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-themeTealLighter rounded-md hover:bg-themeTealWhite disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Next
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
                </div>
                
      {/* Modals */}
      <NewsFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createNews}
        taxonomies={taxonomies}
        title="Create New News"
        submitLabel="Create News"
        onTaxonomyModalOpen={() => setShowTaxonomyModal(true)}
      />

      <NewsFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onSubmit={updateNews}
        taxonomies={taxonomies}
        editingItem={editingItem}
        title="Edit News"
        submitLabel="Update News"
        onTaxonomyModalOpen={() => setShowTaxonomyModal(true)}
      />

      <TaxonomyModal
        isOpen={showTaxonomyModal}
        onClose={() => setShowTaxonomyModal(false)}
        taxonomies={taxonomies}
        onCreateTaxonomy={createTaxonomy}
        onDeleteTaxonomy={deleteTaxonomy}
        newTaxonomy={newTaxonomy}
        setNewTaxonomy={setNewTaxonomy}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setNewsToDelete(null);
        }}
        onConfirm={confirmDeleteNews}
        title="Delete News"
        message="Are you sure you want to delete this news item? This action cannot be undone."
      />

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}