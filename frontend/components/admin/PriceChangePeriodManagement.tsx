'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface PriceChangePeriod {
  id: number;
  period: string;
  created_at?: string;
  updated_at?: string;
}

export default function PriceChangePeriodManagement() {
  const [periods, setPeriods] = useState<PriceChangePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PriceChangePeriod | null>(null);
  const [formData, setFormData] = useState({
    period: '',
  });

  // Fetch periods
  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/price-change-periods');
      const data = await response.json();
      
      if (data.success) {
        setPeriods(data.data.periods || []);
      }
    } catch (error) {
      console.error('Error fetching price change periods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  // Filter periods based on search term
  const filteredPeriods = periods.filter(period =>
    period.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.period.trim()) {
      alert('Please enter a period');
      return;
    }

    try {
      const url = editingPeriod 
        ? `/api/admin/price-change-periods/${editingPeriod.id}`
        : '/api/admin/price-change-periods';
      
      const method = editingPeriod ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPeriods();
        setShowModal(false);
        setFormData({ period: '' });
        setEditingPeriod(null);
      } else {
        alert(data.message || 'Failed to save period');
      }
    } catch (error) {
      console.error('Error saving period:', error);
      alert('Failed to save period');
    }
  };

  // Handle edit
  const handleEdit = (period: PriceChangePeriod) => {
    setEditingPeriod(period);
    setFormData({ period: period.period });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this period?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/price-change-periods/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchPeriods();
      } else {
        alert(data.message || 'Failed to delete period');
      }
    } catch (error) {
      console.error('Error deleting period:', error);
      alert('Failed to delete period');
    }
  };

  // Handle create
  const handleCreate = () => {
    setEditingPeriod(null);
    setFormData({ period: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-themeTeal"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-themeTeal">Price Change Period Management</h1>
        <button
          onClick={handleCreate}
          className="bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeTealDark transition duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Period
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search periods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPeriods.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'No periods found matching your search' : 'No periods found'}
                </td>
              </tr>
            ) : (
              filteredPeriods.map((period) => (
                <tr key={period.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {period.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {period.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {period.created_at ? new Date(period.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(period)}
                        className="text-themeTeal hover:text-themeTealDark"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(period.id)}
                        className="text-red-600 hover:text-red-800"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingPeriod ? 'Edit Period' : 'Add Period'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  placeholder="e.g., 1 Month, 3 Months, 12 Months"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeTealDark"
                >
                  {editingPeriod ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
