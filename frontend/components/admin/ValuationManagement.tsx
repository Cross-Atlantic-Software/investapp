'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

interface Valuation {
  id: number;
  valuation_name: string;
  created_at: string;
  updated_at: string;
}

interface ValuationManagementProps {
  onClose: () => void;
}

const ValuationManagement: React.FC<ValuationManagementProps> = ({ onClose }) => {
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingValuation, setEditingValuation] = useState<Valuation | null>(null);
  const [formData, setFormData] = useState({ valuation_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchValuations();
  }, [currentPage, searchTerm]);

  const fetchValuations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/valuations?${params}`);
      const data = await response.json();

      if (data.success) {
        setValuations(data.data.valuations);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.totalItems);
      }
    } catch (error) {
      console.error('Error fetching valuations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingValuation 
        ? `/api/admin/valuations/${editingValuation.id}`
        : '/api/admin/valuations';
      
      const method = editingValuation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setFormData({ valuation_name: '' });
        setEditingValuation(null);
        fetchValuations();
      } else {
        alert(data.message || 'Failed to save valuation');
      }
    } catch (error) {
      console.error('Error saving valuation:', error);
      alert('An error occurred while saving the valuation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (valuation: Valuation) => {
    setEditingValuation(valuation);
    setFormData({ valuation_name: valuation.valuation_name });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this valuation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/valuations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchValuations();
      } else {
        alert(data.message || 'Failed to delete valuation');
      }
    } catch (error) {
      console.error('Error deleting valuation:', error);
      alert('An error occurred while deleting the valuation');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ valuation_name: '' });
    setEditingValuation(null);
  };

  const filteredValuations = valuations.filter(valuation =>
    valuation.valuation_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-themeTealLighter">
        {/* Header */}
        <div className="bg-themeTeal text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Manage Valuations</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition duration-300"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search and Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search valuations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-themeTeal text-white px-4 py-2 rounded-md hover:bg-themeTealLight transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Valuation
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Valuation Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredValuations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No valuations found
                    </td>
                  </tr>
                ) : (
                  filteredValuations.map((valuation) => (
                    <tr key={valuation.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{valuation.id}</td>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {valuation.valuation_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(valuation.created_at).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(valuation)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(valuation.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} valuations
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[80]">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 border border-themeTealLighter">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-themeTeal">
                  {editingValuation ? 'Edit Valuation' : 'Add New Valuation'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-themeTealLight hover:text-themeTeal transition duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valuation Name
                  </label>
                  <input
                    type="text"
                    value={formData.valuation_name}
                    onChange={(e) => setFormData({ valuation_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                    placeholder="e.g., Under ₹100 Cr"
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-themeTeal text-white rounded-md hover:bg-themeTealLight transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingValuation ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationManagement;

