"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react";

interface InsightTopic {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subtopics?: Array<{ id: number; name: string; is_active: boolean }>;
}

export default function InsightTopicsPage() {
  const [topics, setTopics] = useState<InsightTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<InsightTopic | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    is_active: true
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/admin/insight-topics');
      const data = await response.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    try {
      const response = await fetch('/api/admin/insight-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchTopics();
      } else {
        alert(data.message || 'Failed to create topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic');
    }
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;
    
    try {
      const response = await fetch(`/api/admin/insight-topics/${editingTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingTopic(null);
        resetForm();
        fetchTopics();
      } else {
        alert(data.message || 'Failed to update topic');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      alert('Failed to update topic');
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all associated subtopics.')) return;
    
    try {
      const response = await fetch(`/api/admin/insight-topics/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchTopics();
      } else {
        alert(data.message || 'Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      is_active: true
    });
  };

  const handleEdit = (topic: InsightTopic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      is_active: topic.is_active
    });
    setShowModal(true);
  };

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-themeTeal">Insight Topics</h1>
          <p className="text-themeTealLighter">Manage market insight topics</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingTopic(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter w-4 h-4" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          />
        </div>
      </div>

      {/* Topics Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-themeTealWhite">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Subtopics</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-themeTealLighter">
              {filteredTopics.map((topic) => (
                <tr key={topic.id} className="hover:bg-themeTealWhite/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-themeTeal" />
                      <span className="text-sm font-medium text-themeTeal">{topic.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {topic.is_active ? (
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
                    {topic.subtopics?.length || 0} subtopics
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTealLighter">
                    {formatDate(topic.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="p-1 text-themeTeal hover:text-themeSkyBlue transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
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
        
        {filteredTopics.length === 0 && (
          <div className="text-center py-8 text-themeTealLighter">
            No topics found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-themeTeal mb-4">
              {editingTopic ? 'Edit Topic' : 'Add Topic'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  placeholder="Topic name"
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
                  setEditingTopic(null);
                  resetForm();
                }}
                className="px-4 py-2 text-themeTeal border border-themeTeal rounded-lg hover:bg-themeTealWhite transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTopic ? handleUpdateTopic : handleCreateTopic}
                className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition-colors"
              >
                {editingTopic ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

