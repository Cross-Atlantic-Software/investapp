'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface Sector {
  id: number;
  name: string;
  is_active: boolean;
  subsectors?: Subsector[];
}

interface Subsector {
  id: number;
  sector_id: number;
  name: string;
  is_active: boolean;
}

export default function SectorManagement() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSectors, setExpandedSectors] = useState<Set<number>>(new Set());
  
  // Form states
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [showSubsectorForm, setShowSubsectorForm] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingSubsector, setEditingSubsector] = useState<Subsector | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  
  const [sectorForm, setSectorForm] = useState({
    name: ''
  });
  
  const [subsectorForm, setSubsectorForm] = useState({
    sector_id: '',
    name: ''
  });

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sectors');
      const data = await response.json();
      
      if (data.success) {
        setSectors(data.data || []);
      } else {
        console.error('Failed to fetch sectors:', data.message);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSectorExpansion = (sectorId: number) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorId)) {
      newExpanded.delete(sectorId);
    } else {
      newExpanded.add(sectorId);
    }
    setExpandedSectors(newExpanded);
  };

  const handleCreateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/sectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectorForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowSectorForm(false);
        setSectorForm({ name: '' });
        fetchSectors();
      } else {
        alert(data.message || 'Failed to create sector');
      }
    } catch (error) {
      console.error('Error creating sector:', error);
      alert('Failed to create sector');
    }
  };

  const handleUpdateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSector) return;
    
    try {
      const response = await fetch(`/api/admin/sectors/${editingSector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectorForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setEditingSector(null);
        setSectorForm({ name: '' });
        fetchSectors();
      } else {
        alert(data.message || 'Failed to update sector');
      }
    } catch (error) {
      console.error('Error updating sector:', error);
      alert('Failed to update sector');
    }
  };

  const handleDeleteSector = async (sectorId: number) => {
    if (!confirm('Are you sure you want to delete this sector? This will also delete all its subsectors.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/sectors/${sectorId}`, {
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

  const handleCreateSubsector = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/subsectors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subsectorForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowSubsectorForm(false);
        setSubsectorForm({ sector_id: '', name: '' });
        fetchSectors();
      } else {
        alert(data.message || 'Failed to create subsector');
      }
    } catch (error) {
      console.error('Error creating subsector:', error);
      alert('Failed to create subsector');
    }
  };

  const handleUpdateSubsector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubsector) return;
    
    try {
      const response = await fetch(`/api/admin/subsectors/${editingSubsector.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subsectorForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setEditingSubsector(null);
        setSubsectorForm({ sector_id: '', name: '' });
        fetchSectors();
      } else {
        alert(data.message || 'Failed to update subsector');
      }
    } catch (error) {
      console.error('Error updating subsector:', error);
      alert('Failed to update subsector');
    }
  };

  const handleDeleteSubsector = async (subsectorId: number) => {
    if (!confirm('Are you sure you want to delete this subsector?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/subsectors/${subsectorId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSectors();
      } else {
        alert(data.message || 'Failed to delete subsector');
      }
    } catch (error) {
      console.error('Error deleting subsector:', error);
      alert('Failed to delete subsector');
    }
  };

  const startEditSector = (sector: Sector) => {
    setEditingSector(sector);
    setSectorForm({
      name: sector.name
    });
  };

  const startEditSubsector = (subsector: Subsector) => {
    setEditingSubsector(subsector);
    setSubsectorForm({
      sector_id: subsector.sector_id.toString(),
      name: subsector.name
    });
  };

  const cancelEdit = () => {
    setEditingSector(null);
    setEditingSubsector(null);
    setSectorForm({ name: '' });
    setSubsectorForm({ sector_id: '', name: '' });
  };

  const startAddSubsector = (sectorId: number) => {
    setSelectedSectorId(sectorId);
    setSubsectorForm({
      sector_id: sectorId.toString(),
      name: ''
    });
    setShowSubsectorForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Sectors</h2>
        <button
          onClick={() => setShowSectorForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sector
        </button>
      </div>

      {/* Create Sector Form */}
      {showSectorForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Add New Sector</h3>
          <form onSubmit={handleCreateSector} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector Name *
              </label>
              <input
                type="text"
                value={sectorForm.name}
                onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Sector
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSectorForm(false);
                  setSectorForm({ name: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Sector Form */}
      {editingSector && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Edit Sector</h3>
          <form onSubmit={handleUpdateSector} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector Name *
              </label>
              <input
                type="text"
                value={sectorForm.name}
                onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Update Sector
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Subsector Form */}
      {showSubsectorForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Add New Subsector</h3>
          <form onSubmit={handleCreateSubsector} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subsector Name *
              </label>
              <input
                type="text"
                value={subsectorForm.name}
                onChange={(e) => setSubsectorForm({ ...subsectorForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Subsector
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubsectorForm(false);
                  setSubsectorForm({ sector_id: '', name: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Subsector Form */}
      {editingSubsector && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Edit Subsector</h3>
          <form onSubmit={handleUpdateSubsector} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subsector Name *
              </label>
              <input
                type="text"
                value={subsectorForm.name}
                onChange={(e) => setSubsectorForm({ ...subsectorForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Update Subsector
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sectors List */}
      <div className="space-y-4">
        {sectors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sectors found. Create your first sector to get started.
          </div>
        ) : (
          sectors.map((sector) => (
            <div key={sector.id} className="bg-white rounded-lg shadow-md border">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSectorExpansion(sector.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedSectors.has(sector.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-lg">{sector.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startAddSubsector(sector.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Add Subsector"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditSector(sector)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit Sector"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSector(sector.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Sector"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Subsectors */}
              {expandedSectors.has(sector.id) && (
                <div className="border-t bg-gray-50">
                  {sector.subsectors && sector.subsectors.length > 0 ? (
                    <div className="p-4 space-y-2">
                      {sector.subsectors.map((subsector) => (
                        <div key={subsector.id} className="flex items-center justify-between bg-white p-3 rounded border">
                          <div>
                            <h4 className="font-medium">{subsector.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditSubsector(subsector)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit Subsector"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubsector(subsector.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Subsector"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-gray-500 text-center">
                      No subsectors found. Click the + button to add one.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
