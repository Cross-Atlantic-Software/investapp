'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2 } from 'lucide-react';

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

  // Fetch sectors
  const fetchSectors = async () => {
    try {
      const response = await fetch('/api/admin/sectors');
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
      const response = await fetch(`/api/admin/sectors/${sectorId}/subsectors`);
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
      const response = await fetch('/api/admin/sectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    if (!newSubsector.name.trim() || !newSubsector.sector_id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/subsectors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubsector),
      });

      const data = await response.json();
      if (data.success) {
        setNewSubsector({ sector_id: 0, name: '' });
        setIsCreatingSubsector(false);
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
  };

  const handleDeleteSector = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sector? This will also delete all its subsectors.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/sectors/${id}`, {
        method: 'DELETE',
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
      const response = await fetch(`/api/admin/subsectors/${id}`, {
        method: 'DELETE',
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 m-0">
      <div className="bg-white rounded shadow w-full max-w-6xl mx-4 mt-8 mb-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-themeTealWhite">Manage Sectors & Subsectors</h3>
            </div>
            <button
              onClick={onClose}
              className="text-themeTealWhite transition duration-300 cursor-pointer"
            >
              <X width={20} height={20}/>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sectors Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-themeTeal">Sectors</h3>
                <button
                  onClick={() => setIsCreatingSector(!isCreatingSector)}
                  className="flex items-center px-3 py-1 text-sm bg-themeTeal text-white rounded hover:bg-themeTealDark transition duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
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

              {/* Sectors List */}
              <div className="bg-white rounded border border-themeTealLighter max-h-96 overflow-y-auto">
                {sectors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-themeTealLighter">No sectors found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-themeTealLighter">
                    {sectors.map((sector) => (
                      <div
                        key={sector.id}
                        className={`p-3 cursor-pointer hover:bg-themeTealWhite transition duration-200 ${
                          selectedSectorId === sector.id ? 'bg-themeTealWhite border-l-4 border-themeTeal' : ''
                        }`}
                        onClick={() => setSelectedSectorId(sector.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-themeTeal">{sector.name}</h4>
                            <p className="text-xs text-themeTealLighter">{formatDate(sector.created_at)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSector(sector.id);
                            }}
                            className="p-1 text-red-600 hover:text-red-800 transition duration-200"
                            title="Delete Sector"
                          >
                            <Trash2 width={14} height={14}/>
                          </button>
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
                <h3 className="text-sm font-medium text-themeTeal">
                  Subsectors {selectedSectorId && `(${sectors.find(s => s.id === selectedSectorId)?.name})`}
                </h3>
                {selectedSectorId && (
                  <button
                    onClick={() => setIsCreatingSubsector(!isCreatingSubsector)}
                    className="flex items-center px-3 py-1 text-sm bg-themeTeal text-white rounded hover:bg-themeTealDark transition duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {isCreatingSubsector ? 'Cancel' : 'Add Subsector'}
                  </button>
                )}
              </div>

              {isCreatingSubsector && selectedSectorId && (
                <form onSubmit={handleCreateSubsector} className="bg-themeTealWhite p-4 rounded-lg border border-themeTealLighter mb-4">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Subsector Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSubsector.name}
                      onChange={(e) => setNewSubsector({ ...newSubsector, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                      placeholder="Enter subsector name"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingSubsector(false);
                        setNewSubsector({ sector_id: 0, name: '' });
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

              {/* Subsectors List */}
              <div className="bg-white rounded border border-themeTealLighter max-h-96 overflow-y-auto">
                {!selectedSectorId ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-themeTealLighter">Select a sector to view subsectors</p>
                  </div>
                ) : subsectors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-themeTealLighter">No subsectors found for this sector</p>
                  </div>
                ) : (
                  <div className="divide-y divide-themeTealLighter">
                    {subsectors.map((subsector) => (
                      <div key={subsector.id} className="p-3 hover:bg-themeTealWhite transition duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-themeTeal">{subsector.name}</h4>
                            <p className="text-xs text-themeTealLighter">{formatDate(subsector.created_at)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteSubsector(subsector.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition duration-200"
                            title="Delete Subsector"
                          >
                            <Trash2 width={14} height={14}/>
                          </button>
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
