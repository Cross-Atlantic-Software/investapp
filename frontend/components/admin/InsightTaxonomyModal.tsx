"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Building, Building2, FileText, Palette } from 'lucide-react';

interface InsightSector {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InsightSubsector {
  id: number;
  name: string;
  insight_sector_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sector?: { id: number; name: string };
}

interface InsightTopic {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InsightSubtopic {
  id: number;
  name: string;
  insight_topic_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  topic?: { id: number; name: string };
}

interface InsightTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'sectors' | 'topics' | 'themes';
}

const InsightTaxonomyModal: React.FC<InsightTaxonomyModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  const [activeTab, setActiveTab] = useState<'sectors' | 'subsectors' | 'topics' | 'subtopics'>('sectors');
  
  // Data states
  const [sectors, setSectors] = useState<InsightSector[]>([]);
  const [subsectors, setSubsectors] = useState<InsightSubsector[]>([]);
  const [topics, setTopics] = useState<InsightTopic[]>([]);
  const [subtopics, setSubtopics] = useState<InsightSubtopic[]>([]);
  
  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    insight_sector_id: '',
    insight_topic_id: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data based on type
  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      if (type === 'sectors') {
        const [sectorsRes, subsectorsRes] = await Promise.all([
          fetch('/api/admin/insight-sectors', {
            headers: { 'token': token }
          }),
          fetch('/api/admin/insight-subsectors', {
            headers: { 'token': token }
          })
        ]);

        const [sectorsData, subsectorsData] = await Promise.all([
          sectorsRes.json(),
          subsectorsRes.json()
        ]);

        if (sectorsData.success) setSectors(sectorsData.data);
        if (subsectorsData.success) setSubsectors(subsectorsData.data);
      } else if (type === 'topics') {
        const [topicsRes, subtopicsRes] = await Promise.all([
          fetch('/api/admin/insight-topics', {
            headers: { 'token': token }
          }),
          fetch('/api/admin/insight-subtopics', {
            headers: { 'token': token }
          })
        ]);

        const [topicsData, subtopicsData] = await Promise.all([
          topicsRes.json(),
          subtopicsRes.json()
        ]);

        if (topicsData.success) setTopics(topicsData.data);
        if (subtopicsData.success) setSubtopics(subtopicsData.data);
      } else if (type === 'themes') {
        const response = await fetch('/api/admin/insight-themes', {
          headers: { 'token': token }
        });
        const data = await response.json();
        
        if (data.success) {
          setSectors(data.data); // Reuse sectors state for themes
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, type]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      let endpoint = '';
      let payload: any = { name: formData.name.trim(), is_active: formData.is_active };

      if (type === 'sectors') {
        if (activeTab === 'sectors') {
          endpoint = '/api/admin/insight-sectors';
        } else {
          endpoint = '/api/admin/insight-subsectors';
          payload.insight_sector_id = parseInt(formData.insight_sector_id);
        }
      } else if (type === 'topics') {
        if (activeTab === 'topics') {
          endpoint = '/api/admin/insight-topics';
        } else {
          endpoint = '/api/admin/insight-subtopics';
          payload.insight_topic_id = parseInt(formData.insight_topic_id);
        }
      } else if (type === 'themes') {
        endpoint = '/api/admin/insight-themes';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setIsCreating(false);
        resetForm();
        fetchData();
      } else {
        alert(data.message || 'Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      let endpoint = '';
      let payload: any = { name: formData.name.trim(), is_active: formData.is_active };

      if (type === 'sectors') {
        if (activeTab === 'sectors') {
          endpoint = `/api/admin/insight-sectors/${editingItem.id}`;
        } else {
          endpoint = `/api/admin/insight-subsectors/${editingItem.id}`;
          payload.insight_sector_id = parseInt(formData.insight_sector_id);
        }
      } else if (type === 'topics') {
        if (activeTab === 'topics') {
          endpoint = `/api/admin/insight-topics/${editingItem.id}`;
        } else {
          endpoint = `/api/admin/insight-subtopics/${editingItem.id}`;
          payload.insight_topic_id = parseInt(formData.insight_topic_id);
        }
      } else if (type === 'themes') {
        endpoint = `/api/admin/insight-themes/${editingItem.id}`;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setEditingItem(null);
        resetForm();
        fetchData();
      } else {
        alert(data.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      let endpoint = '';
      if (type === 'sectors') {
        if (activeTab === 'sectors') {
          endpoint = `/api/admin/insight-sectors/${id}`;
        } else {
          endpoint = `/api/admin/insight-subsectors/${id}`;
        }
      } else if (type === 'topics') {
        if (activeTab === 'topics') {
          endpoint = `/api/admin/insight-topics/${id}`;
        } else {
          endpoint = `/api/admin/insight-subtopics/${id}`;
        }
      } else if (type === 'themes') {
        endpoint = `/api/admin/insight-themes/${id}`;
      }

      const response = await fetch(endpoint, { 
        method: 'DELETE',
        headers: { 'token': token }
      });
      const data = await response.json();
      
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      insight_sector_id: '',
      insight_topic_id: '',
      is_active: true
    });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      insight_sector_id: item.insight_sector_id?.toString() || '',
      insight_topic_id: item.insight_topic_id?.toString() || '',
      is_active: item.is_active
    });
  };

  const getCurrentData = () => {
    if (type === 'sectors') {
      return activeTab === 'sectors' ? sectors : subsectors;
    } else if (type === 'topics') {
      return activeTab === 'topics' ? topics : subtopics;
    } else {
      return sectors; // For themes, reuse sectors state
    }
  };

  const getFilteredData = () => {
    const data = getCurrentData();
    return data.filter((item: any) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTitle = () => {
    switch (type) {
      case 'sectors': return 'Manage Insight Sectors & Subsectors';
      case 'topics': return 'Manage Insight Topics & Subtopics';
      case 'themes': return 'Manage Insight Themes';
      default: return 'Manage Taxonomies';
    }
  };

  const getTabLabel = () => {
    switch (type) {
      case 'sectors': return activeTab === 'sectors' ? 'Sectors' : 'Subsectors';
      case 'topics': return activeTab === 'topics' ? 'Topics' : 'Subtopics';
      case 'themes': return 'Themes';
      default: return 'Items';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-themeTeal">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-themeTealLighter hover:text-themeTeal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs - Show for sectors and topics */}
        {(type === 'sectors' || type === 'topics') && (
          <div className="flex border-b">
            <button
              onClick={() => {
                setActiveTab(type === 'sectors' ? 'sectors' : 'topics');
                resetForm();
                setEditingItem(null);
                setIsCreating(false);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === (type === 'sectors' ? 'sectors' : 'topics')
                  ? 'border-themeTeal text-themeTeal'
                  : 'border-transparent text-themeTealLighter hover:text-themeTeal'
              }`}
            >
              {type === 'sectors' ? <Building2 className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
              {type === 'sectors' ? 'Sectors' : 'Topics'}
            </button>
            <button
              onClick={() => {
                setActiveTab(type === 'sectors' ? 'subsectors' : 'subtopics');
                resetForm();
                setEditingItem(null);
                setIsCreating(false);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === (type === 'sectors' ? 'subsectors' : 'subtopics')
                  ? 'border-themeTeal text-themeTeal'
                  : 'border-transparent text-themeTealLighter hover:text-themeTeal'
              }`}
            >
              {type === 'sectors' ? <Building className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {type === 'sectors' ? 'Subsectors' : 'Subtopics'}
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Search and Add */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${getTabLabel().toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
              />
            </div>
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingItem(null);
                resetForm();
              }}
              className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add {getTabLabel().slice(0, -1)}
            </button>
          </div>

          {/* Form */}
          {(isCreating || editingItem) && (
            <div className="bg-themeTealWhite p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-themeTeal mb-3">
                {editingItem ? 'Edit' : 'Add'} {getTabLabel().slice(0, -1)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {type === 'sectors' && activeTab === 'subsectors' && (
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
                )}

                {type === 'topics' && activeTab === 'subtopics' && (
                  <div>
                    <label className="block text-sm font-medium text-themeTeal mb-1">Topic *</label>
                    <select
                      value={formData.insight_topic_id}
                      onChange={(e) => setFormData({...formData, insight_topic_id: e.target.value})}
                      className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                    >
                      <option value="">Select Topic</option>
                      {topics.map(topic => (
                        <option key={topic.id} value={topic.id.toString()}>{topic.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-themeTeal mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                    placeholder={`${getTabLabel().slice(0, -1)} name`}
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
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-themeTeal border border-themeTeal rounded-lg hover:bg-themeTealWhite transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem ? handleUpdate : handleCreate}
                  disabled={loading}
                  className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-themeTealWhite">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Name</th>
                    {((type === 'sectors' && activeTab === 'subsectors') || (type === 'topics' && activeTab === 'subtopics')) && (
                      <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">
                        {type === 'sectors' ? 'Sector' : 'Topic'}
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Created</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-themeTealLighter">
                  {getFilteredData().map((item: any) => (
                    <tr key={item.id} className="hover:bg-themeTealWhite/50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-themeTeal">{item.name}</span>
                      </td>
                      {((type === 'sectors' && activeTab === 'subsectors') || (type === 'topics' && activeTab === 'subtopics')) && (
                        <td className="px-4 py-3 text-sm text-themeTeal">
                          {item.sector?.name || item.topic?.name || '-'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {item.is_active ? (
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
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-themeTeal hover:text-themeSkyBlue transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
            
            {getFilteredData().length === 0 && (
              <div className="text-center py-8 text-themeTealLighter">
                No {getTabLabel().toLowerCase()} found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightTaxonomyModal;
