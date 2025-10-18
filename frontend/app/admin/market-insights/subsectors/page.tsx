"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Tag, Building } from "lucide-react";

interface InsightSubsector {
  id: number;
  name: string;
  insight_sector_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sector?: { id: number; name: string };
}

interface InsightSector {
  id: number;
  name: string;
  is_active: boolean;
}

export default function InsightSubsectorsPage() {
  const [subsectors, setSubsectors] = useState<InsightSubsector[]>([]);
  const [sectors, setSectors] = useState<InsightSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSubsector, setEditingSubsector] = useState<InsightSubsector | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    insight_sector_id: "",
    is_active: true
  });

  useEffect(() => {
    fetchSubsectors();
    fetchSectors();
  }, []);

  const fetchSubsectors = async () => {
    try {
      const response = await fetch('/api/admin/insight-subsectors');
      const data = await response.json();
      if (data.success) {
        setSubsectors(data.data);
      }
    } catch (error) {
      console.error('Error fetching subsectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await fetch('/api/admin/insight-sectors');
      const data = await response.json();
      if (data.success) {
        setSectors(data.data);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  const handleCreateSubsector = async () => {
    try {
      const response = await fetch('/api/admin/insight-subsectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchSubsectors();
      } else {
        alert(data.message || 'Failed to create subsector');
      }
    } catch (error) {
      console.error('Error creating subsector:', error);
      alert('Failed to create subsector');
    }
  };

  const handleUpdateSubsector = async () => {
    if (!editingSubsector) return;
    
    try {
      const response = await fetch(`/api/admin/insight-subsectors/${editingSubsector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingSubsector(null);
        resetForm();
        fetchSubsectors();
      } else {
        alert(data.message || 'Failed to update subsector');
      }
    } catch (error) {
      console.error('Error updating subsector:', error);
      alert('Failed to update subsector');
    }
  };

  const handleDeleteSubsector = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subsector?')) return;
    
    try {
      const response = await fetch(`/api/admin/insight-subsectors/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSubsectors();
      } else {
        alert(data.message || 'Failed to delete subsector');
      }
    } catch (error) {
      console.error('Error deleting subsector:', error);
      alert('Failed to delete subsector');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      insight_sector_id: "",
      is_active: true
    });
  };

  const handleEdit = (subsector: InsightSubsector) => {
    setEditingSubsector(subsector);
    setFormData({
      name: subsector.name,
      insight_sector_id: subsector.insight_sector_id.toString(),
      is_active: subsector.is_active
    });
    setShowModal(true);
  };

  const filteredSubsectors = subsectors.filter(subsector => {
    const matchesSearch = subsector.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || subsector.insight_sector_id.toString() === selectedSector;
    return matchesSearch && matchesSector;
  });

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
          <h1 className="text-2xl font-bold text-themeTeal">Insight Subsectors</h1>
          <p className="text-themeTealLighter">Manage market insight subsectors</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSubsector(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subsector
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter w-4 h-4" />
            <input
              type="text"
              placeholder="Search subsectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
            />
          </div>
          
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          >
            <option value="">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.id.toString()}>{sector.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subsectors Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-themeTealWhite">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Sector</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-themeTealLighter">
              {filteredSubsectors.map((subsector) => (
                <tr key={subsector.id} className="hover:bg-themeTealWhite/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-themeTeal" />
                      <span className="text-sm font-medium text-themeTeal">{subsector.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {subsector.sector?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {subsector.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTealLighter">
                    {formatDate(subsector.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(subsector)}
                        className="p-1 text-themeTeal hover:text-themeSkyBlue transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubsector(subsector.id)}
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
        
        {filteredSubsectors.length === 0 && (
          <div className="text-center py-8 text-themeTealLighter">
            No subsectors found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-themeTeal mb-4">
              {editingSubsector ? 'Edit Subsector' : 'Add Subsector'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Sector *</label>
                <select
                  value={formData.insight_sector_id}
                  onChange={(e) => setFormData({...formData, insight_sector_id: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                >
                  <option value="">Select Sector</option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id.toString()}>{sector.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  placeholder="Subsector name"
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
                  setEditingSubsector(null);
                  resetForm();
                }}
                className="px-4 py-2 text-themeTeal border border-themeTeal rounded-lg hover:bg-themeTealWhite transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingSubsector ? handleUpdateSubsector : handleCreateSubsector}
                className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition-colors"
              >
                {editingSubsector ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

