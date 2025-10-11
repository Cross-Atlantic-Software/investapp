'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, Save, XCircle, HelpCircle, ArrowUpDown } from 'lucide-react';
import { StockFaq, FaqFormData, FaqManagementProps } from './types';
import { NotificationContainer, NotificationData } from '../shared/Notification';
import ConfirmationModal from '../shared/ConfirmationModal';

export default function FaqManagement({ stockId, stockName, onClose }: FaqManagementProps) {
  const [faqs, setFaqs] = useState<StockFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<StockFaq | null>(null);
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
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [formData, setFormData] = useState<FaqFormData>({
    question: '',
    answer: '',
    display_order: 0, // Not used in create, but needed for edit form
    is_active: true
  });

  // Notification helper functions
  const addNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { 
      id, 
      type, 
      title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info',
      message,
      duration: 5000
    }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const loadFaqs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/stocks/${stockId}/faqs`, {
        headers: {
          'token': token || '',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFaqs(result.data.faqs || []);
      } else {
        setError(result.message || 'Failed to load FAQs');
      }
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token || '',
        },
        body: JSON.stringify({
          ...formData,
          stock_id: parseInt(stockId)
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowAddForm(false);
        setFormData({ question: '', answer: '', display_order: 0, is_active: true }); // display_order not used in create
        loadFaqs();
        addNotification('FAQ added successfully', 'success');
      } else {
        addNotification(result.message || 'Failed to add FAQ', 'error');
      }
    } catch (err) {
      console.error('Error adding FAQ:', err);
      addNotification('Failed to add FAQ', 'error');
    }
  };

  const handleEditFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFaq) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token || '',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEditingFaq(null);
        setFormData({ question: '', answer: '', display_order: 0, is_active: true });
        loadFaqs();
        addNotification('FAQ updated successfully', 'success');
      } else {
        addNotification(result.message || 'Failed to update FAQ', 'error');
      }
    } catch (err) {
      console.error('Error updating FAQ:', err);
      addNotification('Failed to update FAQ', 'error');
    }
  };

  const handleDeleteFaq = (id: number) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ? This action cannot be undone.',
      type: 'danger',
      onConfirm: () => deleteFaq(id)
    });
  };

  const deleteFaq = async (id: number) => {
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'token': token || '',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        loadFaqs();
        addNotification('FAQ deleted successfully', 'success');
      } else {
        addNotification(result.message || 'Failed to delete FAQ', 'error');
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      addNotification('Failed to delete FAQ', 'error');
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = faqs.filter(faq => (document.getElementById(`checkbox-${faq.id}`) as HTMLInputElement)?.checked).map(faq => faq.id);
    
    if (selectedIds.length === 0) {
      addNotification('Please select FAQs to delete', 'warning');
      return;
    }
    
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Multiple FAQs',
      message: `Are you sure you want to delete ${selectedIds.length} FAQ(s)? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => bulkDeleteFaqs(selectedIds)
    });
  };

  const bulkDeleteFaqs = async (selectedIds: number[]) => {
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/faqs/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token || '',
        },
        body: JSON.stringify({ ids: selectedIds }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        loadFaqs();
        addNotification(`${result.data.deletedCount} FAQ(s) deleted successfully`, 'success');
      } else {
        addNotification(result.message || 'Failed to delete FAQs', 'error');
      }
    } catch (err) {
      console.error('Error bulk deleting FAQs:', err);
      addNotification('Failed to delete FAQs', 'error');
    }
  };

  const startEdit = (faq: StockFaq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order,
      is_active: faq.is_active
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '', display_order: 0, is_active: true });
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

  const cancelAdd = () => {
    setShowAddForm(false);
    setFormData({ question: '', answer: '', display_order: 0, is_active: true }); // display_order not used in create
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
                <h3 className="text-base font-semibold text-themeTealWhite">FAQ Management</h3>
                <p className="text-xs text-themeTealLighter">Manage FAQs for {stockName}</p>
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
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-themeTeal mx-auto"></div>
              <p className="mt-2 text-xs text-themeTealLight">Loading FAQs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Actions */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition-colors duration-200 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                  </button>
                  
                  {faqs.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-themeTealLight">
                  {faqs.length} FAQ(s) found
                </div>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <div className="mb-6 p-6 border border-themeTealLighter rounded-lg bg-themeTealWhite">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-themeTeal">Add New FAQ</h3>
                      <p className="text-xs text-themeTealLight mt-1">Order will be auto-assigned (comes at the bottom)</p>
                    </div>
                    <button
                      onClick={cancelAdd}
                      className="p-2 text-themeTealLight hover:text-themeTeal hover:bg-themeTealLighter rounded-lg transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddFaq} className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-themeTeal mb-1">
                        Question *
                      </label>
                      <input
                        type="text"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal transition-colors duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-themeTeal mb-1">
                        Answer *
                      </label>
                      <textarea
                        value={formData.answer}
                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal transition-colors duration-200"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-3 w-4 h-4 text-themeTeal border-themeTealLighter rounded focus:ring-themeTeal"
                      />
                      <label htmlFor="is_active" className="text-xs font-medium text-themeTeal">
                        Active
                      </label>
                    </div>
                    
                    <div className="flex gap-3 pt-4 border-t border-themeTealLighter">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition-colors duration-200 font-medium"
                      >
                        <Save className="w-4 h-4" />
                        Save FAQ
                      </button>
                      <button
                        type="button"
                        onClick={cancelAdd}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Form */}
              {editingFaq && (
                <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold text-gray-900">Edit FAQ</h3>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleEditFaq} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question *
                      </label>
                      <input
                        type="text"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer *
                      </label>
                      <textarea
                        value={formData.answer}
                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                        />
                        <p className="text-xs text-gray-500 mt-1">Change order to reorder FAQs (others will shift accordingly)</p>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="edit_is_active" className="text-sm font-medium text-gray-700">
                          Active
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeTeal/90 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Update FAQ
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* FAQs List */}
              {faqs.length === 0 ? (
                <div className="text-center py-6">
                  <HelpCircle className="w-8 h-8 mx-auto mb-3 text-themeTealLight" />
                  <p className="text-xs text-themeTealLight">No FAQs found for this stock</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            id={`checkbox-${faq.id}`}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">Order: {faq.display_order}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${faq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {faq.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                            <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                            <p className="text-xs text-gray-400">
                              Created: {new Date(faq.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(faq)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit FAQ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
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


