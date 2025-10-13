'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { Loader } from '@/components/admin/shared';

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
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search and Add Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search periods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={handleCreate}
          className="bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeTealDark transition duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Period
        </button>
      </div>

      {/* Table */}
      <div className="w-100 md:w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-themeTealLighter">
            <thead className="bg-themeTeal">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-themeTealLighter">
            {filteredPeriods.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-themeTeal">
                  {searchTerm ? 'No periods found matching your search' : 'No periods found'}
                </td>
              </tr>
            ) : (
              filteredPeriods.map((period, index) => (
                <tr key={period.id} className={index % 2 === 0 ? "bg-white" : "bg-themeTealWhite"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {period.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {period.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {period.created_at ? new Date(period.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(period)}
                        className="p-2 bg-themeTeal text-themeTealWhite hover:bg-themeTealWhite hover:text-themeTeal rounded transition duration-300 cursor-pointer flex gap-1"
                        title="Edit Period"
                      >
                        <Edit width={16} height={16}/>
                        <span className="text-xs font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(period.id)}
                        className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer flex gap-1"
                        title="Delete Period"
                      >
                        <Trash2 width={16} height={16}/>
                        <span className="text-xs font-medium">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[60]" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-2xl border border-themeTealLighter" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-themeTealLight hover:text-themeTeal transition duration-300"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-themeTeal">
              {editingPeriod ? 'Edit Period' : 'Add Period'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Period
                </label>
                <input
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-themeTeal text-themeTeal placeholder:text-themeTealLighter"
                  placeholder="e.g., 1M, 3M, 12M, 2Y"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-themeTeal text-white rounded hover:bg-themeSkyBlue transition duration-300"
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
