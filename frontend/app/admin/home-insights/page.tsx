"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Edit, Trash2, Eye, X } from "lucide-react";
import { NotificationContainer, NotificationData, ConfirmationModal } from "@/components/admin/shared";

interface HomeInsight {
  id: number;
  title: string;
  file: string;
  created_at: string;
  updated_at: string;
}

export default function HomeInsightsPage() {
  const [homeInsights, setHomeInsights] = useState<HomeInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInsight, setViewingInsight] = useState<HomeInsight | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [insightToDelete, setInsightToDelete] = useState<number | null>(null);
  const [editingInsight, setEditingInsight] = useState<HomeInsight | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
    existing_file: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchHomeInsights = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        sort_by: 'updated_at',
        sort_order: 'DESC'
      });

      const response = await fetch(`/api/admin/home-insights?${params}`, {
        headers: {
          'token': token
        }
      });
      const data = await response.json();

      if (data.success) {
        setHomeInsights(data.data.homeInsights);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        addNotification({
          type: 'error',
          title: 'Fetch Failed',
          message: data.message || 'Failed to fetch home insights',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching home insights:', error);
      addNotification({
        type: 'error',
        title: 'Fetch Failed',
        message: 'Error fetching home insights',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchHomeInsights();
  }, [fetchHomeInsights]);

  const handleCreate = () => {
    setEditingInsight(null);
    setFormData({ title: "", file: null, existing_file: "" });
    setShowModal(true);
  };

  const handleView = (insight: HomeInsight) => {
    setViewingInsight(insight);
    setShowViewModal(true);
  };

  const handleEdit = (insight: HomeInsight) => {
    setEditingInsight(insight);
    setFormData({ 
      title: insight.title, 
      file: null, 
      existing_file: insight.file 
    });
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Title is required',
        duration: 5000
      });
      return;
    }

    if (!editingInsight && !formData.file) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'File is required',
        duration: 5000
      });
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      
      if (formData.file) {
        submitFormData.append('file', formData.file);
      }
      
      if (editingInsight && !formData.file) {
        submitFormData.append('existing_file', formData.existing_file);
      }

      const url = editingInsight 
        ? `/api/admin/home-insights/${editingInsight.id}`
        : '/api/admin/home-insights';
      const method = editingInsight ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'token': token
        },
        body: submitFormData,
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: editingInsight 
            ? 'Home insight updated successfully!' 
            : 'Home insight created successfully!',
          duration: 5000
        });
        setShowModal(false);
        setEditingInsight(null);
        setFormData({ title: "", file: null, existing_file: "" });
        fetchHomeInsights();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Operation failed',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error submitting home insight:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error submitting home insight',
        duration: 5000
      });
    }
  };

  const handleDelete = (id: number) => {
    setInsightToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!insightToDelete) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/home-insights/${insightToDelete}`, {
        method: 'DELETE',
        headers: {
          'token': token
        }
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Home insight deleted successfully!',
          duration: 5000
        });
        fetchHomeInsights();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to delete home insight',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting home insight:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error deleting home insight',
        duration: 5000
      });
    } finally {
      setShowDeleteModal(false);
      setInsightToDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Home Insights</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded bg-themeTeal px-4 py-2 text-white hover:bg-themeTeal/90"
        >
          <Plus className="h-5 w-5" />
          Add Home Insight
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-10 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : homeInsights.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No home insights found
                  </td>
                </tr>
              ) : (
                homeInsights.map((insight) => (
                  <tr key={insight.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {insight.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <a
                        href={insight.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-themeTeal hover:underline"
                      >
                        View File
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(insight)}
                          className="text-themeTeal hover:text-themeTeal/80"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(insight)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(insight.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingInsight ? 'Edit Home Insight' : 'Create Home Insight'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingInsight(null);
                  setFormData({ title: "", file: null, existing_file: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  File {!editingInsight && '*'}
                </label>
                {formData.existing_file && !formData.file && (
                  <div className="mb-2 text-sm text-gray-600">
                    <p>Current file: <a href={formData.existing_file} target="_blank" rel="noopener noreferrer" className="text-themeTeal hover:underline">View</a></p>
                    <p className="text-xs text-gray-500">Upload a new file to replace it</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                  required={!editingInsight}
                />
                {formData.file && (
                  <p className="mt-1 text-sm text-gray-600">Selected: {formData.file.name}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInsight(null);
                    setFormData({ title: "", file: null, existing_file: "" });
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-themeTeal px-4 py-2 text-white hover:bg-themeTeal/90"
                >
                  {editingInsight ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">View Home Insight</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingInsight(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{viewingInsight.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">File</label>
                <div className="mt-1">
                  <a
                    href={viewingInsight.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-themeTeal hover:underline"
                  >
                    {viewingInsight.file}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(viewingInsight.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Updated At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(viewingInsight.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingInsight(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setInsightToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Home Insight"
        message="Are you sure you want to delete this home insight? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

