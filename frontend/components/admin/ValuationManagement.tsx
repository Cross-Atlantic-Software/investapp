'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

interface Valuation {
  id: number;
  valuation_name: string;
  created_at: string;
  updated_at: string;
}

interface ValuationRange {
  id: number;
  name: string;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ValuationManagementProps {
  onClose: () => void;
}

const ValuationManagement: React.FC<ValuationManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'valuations' | 'ranges'>('valuations');
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [valuationRanges, setValuationRanges] = useState<ValuationRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingValuation, setEditingValuation] = useState<Valuation | null>(null);
  const [editingRange, setEditingRange] = useState<ValuationRange | null>(null);
  const [formData, setFormData] = useState({ 
    valuation_name: '',
    name: '',
    value: '',
    sort_order: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (activeTab === 'valuations') {
      fetchValuations();
    } else {
      fetchValuationRanges();
    }
  }, [currentPage, searchTerm, activeTab]);

  const fetchValuations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/valuations?${params}`, {
        headers: {
          'token': token || '',
        },
      });
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

  const fetchValuationRanges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/valuation-ranges?${params}`, {
        headers: {
          'token': token || '',
        },
      });
      const data = await response.json();

      if (data.success) {
        setValuationRanges(data.data.valuationRanges);
        setTotalPages(data.data.pagination.totalPages);
        setTotalItems(data.data.pagination.totalItems);
      }
    } catch (error) {
      console.error('Error fetching valuation ranges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeTab === 'valuations') {
        const url = editingValuation 
          ? `/api/admin/valuations/${editingValuation.id}`
          : '/api/admin/valuations';
        
        const method = editingValuation ? 'PUT' : 'POST';

        const token = sessionStorage.getItem('adminToken');
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'token': token || '',
          },
          body: JSON.stringify({
            valuation_name: formData.valuation_name
          }),
        });

        const data = await response.json();

        if (data.success) {
          setShowModal(false);
          setFormData({ valuation_name: '', name: '', value: '', sort_order: 0 });
          setEditingValuation(null);
          fetchValuations();
        } else {
          alert(data.message || 'Failed to save valuation');
        }
      } else {
        const url = editingRange 
          ? `/api/admin/valuation-ranges/${editingRange.id}`
          : '/api/admin/valuation-ranges';
        
        const method = editingRange ? 'PUT' : 'POST';

        const token = sessionStorage.getItem('adminToken');
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'token': token || '',
          },
          body: JSON.stringify({
            name: formData.name,
            value: formData.value,
            sort_order: parseInt(formData.sort_order.toString())
          }),
        });

        const data = await response.json();

        if (data.success) {
          setShowModal(false);
          setFormData({ valuation_name: '', name: '', value: '', sort_order: 0 });
          setEditingRange(null);
          fetchValuationRanges();
        } else {
          alert(data.message || 'Failed to save valuation range');
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('An error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (valuation: Valuation) => {
    setEditingValuation(valuation);
    setFormData({ 
      valuation_name: valuation.valuation_name,
      name: '',
      value: '',
      sort_order: 0
    });
    setShowModal(true);
  };

  const handleEditRange = (range: ValuationRange) => {
    setEditingRange(range);
    setFormData({ 
      valuation_name: '',
      name: range.name,
      value: range.value,
      sort_order: range.sort_order
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const url = activeTab === 'valuations' 
        ? `/api/admin/valuations/${id}`
        : `/api/admin/valuation-ranges/${id}`;

      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'token': token || '',
        },
      });

      const data = await response.json();

      if (data.success) {
        if (activeTab === 'valuations') {
          fetchValuations();
        } else {
          fetchValuationRanges();
        }
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('An error occurred while deleting');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ valuation_name: '', name: '', value: '', sort_order: 0 });
    setEditingValuation(null);
    setEditingRange(null);
  };

  const filteredValuations = valuations.filter(valuation =>
    valuation.valuation_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRanges = valuationRanges.filter(range =>
    range.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    range.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-themeTealLighter">
        {/* Header */}
        <div className="bg-themeTeal text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Manage Valuations & Ranges</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition duration-300"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('valuations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'valuations'
                  ? 'border-themeTeal text-themeTeal'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Valuations
            </button>
            <button
              onClick={() => setActiveTab('ranges')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ranges'
                  ? 'border-themeTeal text-themeTeal'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Valuation Ranges
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search and Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
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
              Add {activeTab === 'valuations' ? 'Valuation' : 'Range'}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                  {activeTab === 'valuations' ? (
                    <>
                      <th className="border border-gray-300 px-4 py-2 text-left">Value</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
                    </>
                  ) : (
                    <>
                      <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Value</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Sort Order</th>
                    </>
                  )}
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={activeTab === 'valuations' ? 3 : 4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : (activeTab === 'valuations' ? filteredValuations : filteredRanges).length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'valuations' ? 3 : 4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No {activeTab} found
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'valuations' ? filteredValuations : filteredRanges).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{item.id}</td>
                      {activeTab === 'valuations' ? (
                        <>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {(item as Valuation).valuation_name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {(item as ValuationRange).name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {(item as ValuationRange).value}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {(item as ValuationRange).sort_order}
                          </td>
                        </>
                      )}
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => activeTab === 'valuations' ? handleEdit(item as Valuation) : handleEditRange(item as ValuationRange)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} {activeTab}
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
                  {activeTab === 'valuations' 
                    ? (editingValuation ? 'Edit Valuation' : 'Add New Valuation')
                    : (editingRange ? 'Edit Valuation Range' : 'Add New Valuation Range')
                  }
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-themeTealLight hover:text-themeTeal transition duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {activeTab === 'valuations' ? (
                  <>
                    <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valuation Name
                    </label>
                    <input
                      type="text"
                      value={formData.valuation_name}
                      onChange={(e) => setFormData({ ...formData, valuation_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                      placeholder="e.g., Under ₹100 Cr"
                      required
                    />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Range Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                        placeholder="e.g., Below 1000 Cr"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value (for filtering)
                      </label>
                      <input
                        type="text"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                        placeholder="e.g., below-1000"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
                        placeholder="1"
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-themeTeal text-white rounded-md hover:bg-themeTealLight transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (activeTab === 'valuations' 
                      ? (editingValuation ? 'Update' : 'Create')
                      : (editingRange ? 'Update' : 'Create')
                    )}
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

