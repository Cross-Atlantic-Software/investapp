"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react";

interface InsightSector {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subsectors?: Array<{ id: number; name: string; is_active: boolean }>;
}

export default function InsightSectorsPage() {
  const [sectors, setSectors] = useState<InsightSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSector, setEditingSector] = useState<InsightSector | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    is_active: true
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await fetch('/api/admin/insight-sectors');
      const data = await response.json();
      if (data.success) {
        setSectors(data.data);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSector = async () => {
    try {
      const response = await fetch('/api/admin/insight-sectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchSectors();
      } else {
        alert(data.message || 'Failed to create sector');
      }
    } catch (error) {
      console.error('Error creating sector:', error);
      alert('Failed to create sector');
    }
  };

  const handleUpdateSector = async () => {
    if (!editingSector) return;
    
    try {
      const response = await fetch(`/api/admin/insight-sectors/${editingSector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingSector(null);
        resetForm();
        fetchSectors();
      } else {
        alert(data.message || 'Failed to update sector');
      }
    } catch (error) {
      console.error('Error updating sector:', error);
      alert('Failed to update sector');
    }
  };

  const handleDeleteSector = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sector? This will also delete all associated subsectors.')) return;
    
    try {
      const response = await fetch(`/api/admin/insight-sectors/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSectors();
      } else {
        alert(data.message || 'Failed to delete sector');
      }
    } catch (error) {
      console.error('Error deleting sector:', error);
      alert('Failed to delete sector');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      is_active: true
    });
  };

  const handleEdit = (sector: InsightSector) => {
    setEditingSector(sector);
    setFormData({
      name: sector.name,
      is_active: sector.is_active
    });
    setShowModal(true);
  };

  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-themeTeal">Insight Sectors</h1>
          <p className="text-themeTealLighter">Manage market insight sectors</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSector(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Sector
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter w-4 h-4" />
          <input
            type="text"
            placeholder="Search sectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          />
        </div>
      </div>

      {/* Sectors Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-themeTealWhite">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Subsectors</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-themeTealLighter">
              {filteredSectors.map((sector) => (
                <tr key={sector.id} className="hover:bg-themeTealWhite/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-themeTeal" />
                      <span className="text-sm font-medium text-themeTeal">{sector.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {sector.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {sector.subsectors?.length || 0} subsectors
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTealLighter">
                    {formatDate(sector.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(sector)}
                        className="p-1 text-themeTeal hover:text-themeSkyBlue transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSector(sector.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSectors.length === 0 && (
          <div className="text-center py-8 text-themeTealLighter">
            No sectors found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-themeTeal mb-4">
              {editingSector ? 'Edit Sector' : 'Add Sector'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  placeholder="Sector name"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-themeTealLighter"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-themeTeal">Active</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSector(null);
                  resetForm();
                }}
                className="px-4 py-2 text-themeTeal border border-themeTeal rounded-lg hover:bg-themeTealWhite transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingSector ? handleUpdateSector : handleCreateSector}
                className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition-colors"
              >
                {editingSector ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

