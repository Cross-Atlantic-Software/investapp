'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Building2, FolderOpen, Clock } from 'lucide-react';

interface Sector {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Subsector {
  id: number;
  sector_id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NewSectorForm {
  name: string;
}

interface NewSubsectorForm {
  sector_id: number;
  name: string;
}

interface SectorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SectorManagementModal: React.FC<SectorManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [subsectors, setSubsectors] = useState<Subsector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [isCreatingSector, setIsCreatingSector] = useState(false);
  const [isCreatingSubsector, setIsCreatingSubsector] = useState(false);
  const [newSector, setNewSector] = useState<NewSectorForm>({ name: '' });
  const [newSubsector, setNewSubsector] = useState<NewSubsectorForm>({ sector_id: 0, name: '' });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editingSubsector, setEditingSubsector] = useState<Subsector | null>(null);
  const [editSectorName, setEditSectorName] = useState('');
  const [editSubsectorName, setEditSubsectorName] = useState('');

  // Fetch sectors
  const fetchSectors = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/sectors', {
        headers: { 'token': token }
      });
      const data = await response.json();
      if (data.success) {
        setSectors(data.data.sectors);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  // Fetch subsectors for selected sector
  const fetchSubsectors = async (sectorId: number) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/sectors/${sectorId}/subsectors`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      if (data.success) {
        setSubsectors(data.data.subsectors);
      }
    } catch (error) {
      console.error('Error fetching subsectors:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen) {
      fetchSectors();
    }
  }, [isOpen]);

  // Fetch subsectors when sector is selected
  useEffect(() => {
    if (selectedSectorId) {
      fetchSubsectors(selectedSectorId);
    } else {
      setSubsectors([]);
    }
  }, [selectedSectorId]);

  // Update newSubsector.sector_id when sector is selected
  useEffect(() => {
    if (selectedSectorId) {
      setNewSubsector(prev => ({ ...prev, sector_id: selectedSectorId }));
    }
  }, [selectedSectorId]);

  const handleCreateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSector.name.trim()) return;

    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/sectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(newSector),
      });

      const data = await response.json();
      if (data.success) {
        setNewSector({ name: '' });
        setIsCreatingSector(false);
        fetchSectors();
      } else {
        alert(data.message || 'Failed to create sector');
      }
    } catch (error) {
      console.error('Error creating sector:', error);
      alert('Error creating sector');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubsector = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newSubsector.name.trim() || !newSubsector.sector_id) {
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/subsectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(newSubsector),
      });

      const data = await response.json();
      if (data.success) {
        // Clear only the name, preserve the sector_id
        setNewSubsector({ sector_id: selectedSectorId || 0, name: '' });
        // Keep form open for creating more subsectors
        // setIsCreatingSubsector(false); // Commented out to allow multiple creations
        if (selectedSectorId) {
          fetchSubsectors(selectedSectorId);
        }
      } else {
        alert(data.message || 'Failed to create subsector');
      }
    } catch (error) {
      console.error('Error creating subsector:', error);
      alert('Error creating subsector');
    } finally {
      setLoading(false);
    }
    
    return false;
  };

  const handleDeleteSector = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sector? This will also delete all its subsectors.')) {
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/sectors/${id}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });

      const data = await response.json();
      if (data.success) {
        fetchSectors();
        if (selectedSectorId === id) {
          setSelectedSectorId(null);
          setSubsectors([]);
        }
      } else {
        alert(data.message || 'Failed to delete sector');
      }
    } catch (error) {
      console.error('Error deleting sector:', error);
      alert('Error deleting sector');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubsector = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subsector?')) {
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/subsectors/${id}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });

      const data = await response.json();
      if (data.success) {
        if (selectedSectorId) {
          fetchSubsectors(selectedSectorId);
        }
      } else {
        alert(data.message || 'Failed to delete subsector');
      }
    } catch (error) {
      console.error('Error deleting subsector:', error);
      alert('Error deleting subsector');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSector || !editSectorName.trim()) return;

    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/sectors/${editingSector.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ name: editSectorName }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingSector(null);
        setEditSectorName('');
        fetchSectors();
      } else {
        alert(data.message || 'Failed to update sector');
      }
    } catch (error) {
      console.error('Error updating sector:', error);
      alert('Error updating sector');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubsector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubsector || !editSubsectorName.trim()) return;

    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/subsectors/${editingSubsector.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ name: editSubsectorName }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingSubsector(null);
        setEditSubsectorName('');
        if (selectedSectorId) {
          fetchSubsectors(selectedSectorId);
        }
      } else {
        alert(data.message || 'Failed to update subsector');
      }
    } catch (error) {
      console.error('Error updating subsector:', error);
      alert('Error updating subsector');
    } finally {
      setLoading(false);
    }
  };

  const startEditSector = (sector: Sector) => {
    setEditingSector(sector);
    setEditSectorName(sector.name);
    setIsCreatingSector(false);
  };

  const startEditSubsector = (subsector: Subsector) => {
    setEditingSubsector(subsector);
    setEditSubsectorName(subsector.name);
    setIsCreatingSubsector(false);
  };

  // Filter sectors and subsectors based on search term
  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubsectors = subsectors.filter(subsector =>
    subsector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === null || dateString === undefined) {
        return 'N/A';
      }
      
      const isoString = dateString.replace(' ', 'T');
      const date = new Date(isoString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'Invalid Date';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-themeTealLighter">
        {/* Modal Header */}
        <div className="bg-themeTeal text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Manage Sectors & Subsectors</h2>
              <p className="text-sm text-themeTealLighter">Organize your investment categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition duration-300"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-themeTealLighter bg-themeTealWhite">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sectors and subsectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sectors Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-themeTeal" />
                  <h3 className="text-lg font-semibold text-themeTeal">Sectors</h3>
                  <span className="bg-themeTeal/10 text-themeTeal px-2 py-1 rounded-full text-xs font-medium">
                    {filteredSectors.length}
                  </span>
                </div>
                <button
                  onClick={() => setIsCreatingSector(!isCreatingSector)}
                  className="flex items-center px-4 py-2 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition duration-200 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreatingSector ? 'Cancel' : 'Add Sector'}
                </button>
              </div>

              {isCreatingSector && (
                <form onSubmit={handleCreateSector} className="bg-themeTealWhite p-4 rounded-lg border border-themeTealLighter mb-4">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Sector Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSector.name}
                      onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                      placeholder="Enter sector name"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingSector(false);
                        setNewSector({ name: '' });
                      }}
                      className="px-4 py-2 text-sm text-themeTeal bg-themeTealWhite border border-themeTealLighter rounded hover:bg-themeTealLighter transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm text-white bg-themeTeal rounded hover:bg-themeTealLight transition duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Sector Form */}
              {editingSector && (
                <form onSubmit={handleEditSector} className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-themeTeal mb-2">
                      Edit Sector Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editSectorName}
                      onChange={(e) => setEditSectorName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-lg focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                      placeholder="Enter sector name"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSector(null);
                        setEditSectorName('');
                      }}
                      className="px-4 py-2 text-sm text-themeTeal bg-white border border-themeTealLighter rounded-lg hover:bg-themeTealWhite transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm text-white bg-themeTeal rounded-lg hover:bg-themeTealLight transition duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              )}

              {/* Sectors List */}
              <div className="bg-white rounded-lg border border-themeTealLighter max-h-96 overflow-y-auto shadow-sm">
                {filteredSectors.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-themeTealLighter">
                      {searchTerm ? 'No sectors match your search' : 'No sectors found'}
                    </p>
                    {!searchTerm && (
                      <p className="text-xs text-gray-400 mt-1">Click &quot;Add Sector&quot; to create your first sector</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-themeTealLighter">
                    {filteredSectors.map((sector) => (
                      <div
                        key={sector.id}
                        className={`p-4 cursor-pointer hover:bg-themeTealWhite transition duration-200 ${
                          selectedSectorId === sector.id ? 'bg-themeTealWhite border-l-4 border-themeTeal' : ''
                        }`}
                        onClick={() => setSelectedSectorId(sector.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedSectorId === sector.id ? 'bg-themeTeal text-white' : 'bg-themeTeal/10 text-themeTeal'
                            }`}>
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-themeTeal">{sector.name}</h4>
                              <div className="flex items-center space-x-2 text-xs text-themeTealLighter">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(sector.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditSector(sector);
                              }}
                              className="p-2 text-themeTeal hover:text-themeTealLight hover:bg-themeTeal/10 rounded transition duration-200"
                              title="Edit Sector"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSector(sector.id);
                              }}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition duration-200"
                              title="Delete Sector"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subsectors Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-themeTeal" />
                  <h3 className="text-lg font-semibold text-themeTeal">
                    Subsectors
                    {selectedSectorId && (
                      <span className="text-sm font-normal text-themeTealLighter ml-2">
                        ({sectors.find(s => s.id === selectedSectorId)?.name})
                      </span>
                    )}
                  </h3>
                  <span className="bg-themeTeal/10 text-themeTeal px-2 py-1 rounded-full text-xs font-medium">
                    {filteredSubsectors.length}
                  </span>
                </div>
                {selectedSectorId && (
                  <button
                    onClick={() => setIsCreatingSubsector(!isCreatingSubsector)}
                    className="flex items-center px-4 py-2 text-sm bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition duration-200 shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isCreatingSubsector ? 'Cancel' : 'Add Subsector'}
                  </button>
                )}
              </div>

              {isCreatingSubsector && selectedSectorId && (
                <form 
                  onSubmit={handleCreateSubsector}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                      e.preventDefault();
                      handleCreateSubsector(e);
                    }
                  }}
                  className="bg-themeTealWhite p-4 rounded-lg border border-themeTealLighter mb-4"
                >
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Subsector Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSubsector.name}
                      onChange={(e) => setNewSubsector({ ...newSubsector, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                      placeholder="Enter subsector name"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCreatingSubsector(false);
                        // Preserve the selected sector_id when canceling
                        setNewSubsector({ sector_id: selectedSectorId || 0, name: '' });
                      }}
                      className="px-4 py-2 text-sm text-themeTeal bg-themeTealWhite border border-themeTealLighter rounded hover:bg-themeTealLighter transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateSubsector(e);
                      }}
                      className="px-4 py-2 text-sm text-white bg-themeTeal rounded hover:bg-themeTealLight transition duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {/* Edit Subsector Form */}
              {editingSubsector && (
                <form onSubmit={handleEditSubsector} className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-themeTeal mb-2">
                      Edit Subsector Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editSubsectorName}
                      onChange={(e) => setEditSubsectorName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-lg focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                      placeholder="Enter subsector name"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubsector(null);
                        setEditSubsectorName('');
                      }}
                      className="px-4 py-2 text-sm text-themeTeal bg-white border border-themeTealLighter rounded-lg hover:bg-themeTealWhite transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm text-white bg-themeTeal rounded-lg hover:bg-themeTealLight transition duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              )}

              {/* Subsectors List */}
              <div className="bg-white rounded-lg border border-themeTealLighter max-h-96 overflow-y-auto shadow-sm">
                {!selectedSectorId ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-themeTealLighter">Select a sector to view subsectors</p>
                    <p className="text-xs text-gray-400 mt-1">Choose a sector from the left panel</p>
                  </div>
                ) : filteredSubsectors.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-themeTealLighter">
                      {searchTerm ? 'No subsectors match your search' : 'No subsectors found for this sector'}
                    </p>
                    {!searchTerm && (
                      <p className="text-xs text-gray-400 mt-1">Click &quot;Add Subsector&quot; to create your first subsector</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-themeTealLighter">
                    {filteredSubsectors.map((subsector) => (
                      <div key={subsector.id} className="p-4 hover:bg-themeTealWhite transition duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-themeTeal/10 text-themeTeal flex items-center justify-center">
                              <FolderOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-themeTeal">{subsector.name}</h4>
                              <div className="flex items-center space-x-2 text-xs text-themeTealLighter">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(subsector.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => startEditSubsector(subsector)}
                              className="p-2 text-themeTeal hover:text-themeTealLight hover:bg-themeTeal/10 rounded transition duration-200"
                              title="Edit Subsector"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubsector(subsector.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition duration-200"
                              title="Delete Subsector"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorManagementModal;
