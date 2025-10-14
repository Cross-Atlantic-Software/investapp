'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { NotificationContainer, NotificationData } from '@/components/admin/shared/Notification';

interface ContactFaq {
  id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ContactFaqsPage() {
  const [faqs, setFaqs] = useState<ContactFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ContactFaq | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true,
  });
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchFaqs = async (page = 1, search = '', showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setIsInitialLoad(true);
      }
      const token = sessionStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
      });

      const response = await fetch(`/api/admin/contact-faqs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setFaqs(data.data.faqs);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch FAQs',
        duration: 5000
      });
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchFaqs(1, value, false);
      setIsSearching(false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchFaqs(1, '', false);
  };

  const handlePageChange = (page: number) => {
    fetchFaqs(page, searchTerm);
  };

  const handleCreate = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      display_order: 0, // Will be auto-assigned by backend
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (faq: ContactFaq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('adminToken');
      const url = editingFaq 
        ? `/api/admin/contact-faqs/${editingFaq.id}`
        : '/api/admin/contact-faqs';
      
      const method = editingFaq ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        addNotification({
          type: 'success',
          title: 'Success',
          message: editingFaq ? 'FAQ updated successfully!' : 'FAQ created successfully!',
          duration: 5000
        });
        fetchFaqs(pagination.currentPage, searchTerm, false);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to save FAQ',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save FAQ',
        duration: 5000
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/contact-faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'FAQ deleted successfully!',
          duration: 5000
        });
        fetchFaqs(pagination.currentPage, searchTerm, false);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to delete FAQ',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete FAQ',
        duration: 5000
      });
    }
  };

  const handleToggleStatus = async (faq: ContactFaq) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/contact-faqs/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...faq,
          is_active: !faq.is_active,
        }),
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: `FAQ ${!faq.is_active ? 'activated' : 'deactivated'} successfully!`,
          duration: 5000
        });
        fetchFaqs(pagination.currentPage, searchTerm, false);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to update FAQ status',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating FAQ status:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update FAQ status',
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

      {loading && isInitialLoad ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4"></div>
            <p className="text-themeTeal">Loading FAQs...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold text-themeTeal">Contact FAQs</h1>
            <p className="text-sm text-themeTealLight">Manage frequently asked questions and answers here.</p>
          </div>

          {/* Search Section */}
          <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-themeTeal">
                  All FAQs <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{faqs.length}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search FAQs..."
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
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleCreate}
                className="bg-themeTeal text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeSkyBlue transition duration-300 flex items-center cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add FAQ
              </button>
            </div>
          </div>

          {/* FAQs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-themeTealLighter overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-themeTealLighter">
                <thead className="bg-themeTealWhite">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                      Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-themeTealLighter">
                  {faqs.map((faq, index) => (
                    <tr 
                      key={faq.id}
                      className={`hover:bg-themeTealWhite transition duration-300 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-themeTealWhite'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                        {faq.display_order}
                      </td>
                      <td className="px-6 py-4 text-sm text-themeTeal max-w-xs truncate">
                        {faq.question}
                      </td>
                      <td className="px-6 py-4 text-sm text-themeTeal max-w-xs truncate">
                        {faq.answer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            faq.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {faq.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="p-2 text-themeTeal bg-themeTealWhite rounded transition duration-300 hover:bg-themeTeal hover:text-white cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(faq)}
                            className={`p-2 rounded transition duration-300 cursor-pointer ${
                              faq.is_active 
                                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                            }`}
                            title={faq.is_active ? 'Deactivate FAQ' : 'Activate FAQ'}
                          >
                            {faq.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="p-2 text-red-600 bg-red-50 rounded transition duration-300 hover:bg-red-100 cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 border border-themeTealLighter rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-themeTealWhite text-themeTeal transition duration-300"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-themeTeal">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 border border-themeTealLighter rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-themeTealWhite text-themeTeal transition duration-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-themeTeal">
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-themeTealLight hover:text-themeTeal transition duration-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Question<span className='text-rose-600'>*</span>
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  rows={3}
                  className="input-theme"
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Answer<span className='text-rose-600'>*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows={5}
                  className="input-theme"
                  placeholder="Enter the answer..."
                />
              </div>
              {editingFaq && (
                <div>
                  <label className="block text-xs font-medium text-themeTeal mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="input-theme"
                  />
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-themeTeal focus:ring-themeTeal border-themeTealLighter rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-themeTeal">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="buttonStyle"
                >
                  {editingFaq ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="buttonStyleLight"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
