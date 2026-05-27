"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Tag, Building } from "lucide-react";

interface InsightSubtopic {
  id: number;
  name: string;
  insight_topic_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  topic?: { id: number; name: string };
}

interface InsightTopic {
  id: number;
  name: string;
  is_active: boolean;
}

export default function InsightSubtopicsPage() {
  const [subtopics, setSubtopics] = useState<InsightSubtopic[]>([]);
  const [topics, setTopics] = useState<InsightTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState<InsightSubtopic | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    insight_topic_id: "",
    is_active: true
  });

  useEffect(() => {
    fetchSubtopics();
    fetchTopics();
  }, []);

  const fetchSubtopics = async () => {
    try {
      const response = await fetch('/api/admin/insight-subtopics');
      const data = await response.json();
      if (data.success) {
        setSubtopics(data.data);
      }
    } catch (error) {
      console.error('Error fetching subtopics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/insight-topics');
      const data = await response.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleCreateSubtopic = async () => {
    try {
      const response = await fetch('/api/admin/insight-subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchSubtopics();
      } else {
        alert(data.message || 'Failed to create subtopic');
      }
    } catch (error) {
      console.error('Error creating subtopic:', error);
      alert('Failed to create subtopic');
    }
  };

  const handleUpdateSubtopic = async () => {
    if (!editingSubtopic) return;
    
    try {
      const response = await fetch(`/api/admin/insight-subtopics/${editingSubtopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingSubtopic(null);
        resetForm();
        fetchSubtopics();
      } else {
        alert(data.message || 'Failed to update subtopic');
      }
    } catch (error) {
      console.error('Error updating subtopic:', error);
      alert('Failed to update subtopic');
    }
  };

  const handleDeleteSubtopic = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subtopic?')) return;
    
    try {
      const response = await fetch(`/api/admin/insight-subtopics/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchSubtopics();
      } else {
        alert(data.message || 'Failed to delete subtopic');
      }
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      alert('Failed to delete subtopic');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      insight_topic_id: "",
      is_active: true
    });
  };

  const handleEdit = (subtopic: InsightSubtopic) => {
    setEditingSubtopic(subtopic);
    setFormData({
      name: subtopic.name,
      insight_topic_id: subtopic.insight_topic_id.toString(),
      is_active: subtopic.is_active
    });
    setShowModal(true);
  };

  const filteredSubtopics = subtopics.filter(subtopic => {
    const matchesSearch = subtopic.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || subtopic.insight_topic_id.toString() === selectedTopic;
    return matchesSearch && matchesTopic;
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
          <h1 className="text-2xl font-bold text-themeTeal">Insight Subtopics</h1>
          <p className="text-themeTealLighter">Manage market insight subtopics</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSubtopic(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subtopic
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter w-4 h-4" />
            <input
              type="text"
              placeholder="Search subtopics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
            />
          </div>
          
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id.toString()}>{topic.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subtopics Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-themeTealWhite">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Topic</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-themeTealLighter">
              {filteredSubtopics.map((subtopic) => (
                <tr key={subtopic.id} className="hover:bg-themeTealWhite/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-themeTeal" />
                      <span className="text-sm font-medium text-themeTeal">{subtopic.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {subtopic.topic?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {subtopic.is_active ? (
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
                    {formatDate(subtopic.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(subtopic)}
                        className="p-1 text-themeTeal hover:text-themeSkyBlue transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubtopic(subtopic.id)}
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
        
        {filteredSubtopics.length === 0 && (
          <div className="text-center py-8 text-themeTealLighter">
            No subtopics found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-themeTeal mb-4">
              {editingSubtopic ? 'Edit Subtopic' : 'Add Subtopic'}
            </h2>
            
            <div className="space-y-4">
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
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  placeholder="Subtopic name"
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
                  setEditingSubtopic(null);
                  resetForm();
                }}
                className="px-4 py-2 text-themeTeal border border-themeTeal rounded-lg hover:bg-themeTealWhite transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingSubtopic ? handleUpdateSubtopic : handleCreateSubtopic}
                className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition-colors"
              >
                {editingSubtopic ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

