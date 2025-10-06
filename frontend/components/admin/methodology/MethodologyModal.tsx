'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, Eye, EyeOff } from 'lucide-react';

interface MethodologyNote {
  id: number;
  section_key: string;
  section_name: string;
  methodology_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [methodologyNotes, setMethodologyNotes] = useState<MethodologyNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({
    section_key: '',
    section_name: '',
    methodology_text: '',
    is_active: true
  });

  const sectionOptions = [
    { key: 'price', name: 'Price Chart' },
    { key: 'score', name: 'Scorecard' },
    { key: 'rationale', name: 'Investment Rationale' },
    { key: 'bench', name: 'Performance Benchmark' },
    { key: 'outlook', name: 'Sector Outlook' },
    { key: 'financials', name: 'Financial Performance' },
    { key: 'holders', name: 'Shareholding' },
    { key: 'news', name: 'News Related to Company' },
    { key: 'faq', name: 'Frequently Asked Questions' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchMethodologyNotes();
    }
  }, [isOpen]);

  const fetchMethodologyNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/methodology-notes');
      const data = await response.json();
      
      if (data.success) {
        setMethodologyNotes(data.data.methodologyNotes || []);
      }
    } catch (error) {
      console.error('Error fetching methodology notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.section_key || !newNote.section_name || !newNote.methodology_text.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/admin/methodology-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      const data = await response.json();
      if (data.success) {
        fetchMethodologyNotes();
        setNewNote({
          section_key: '',
          section_name: '',
          methodology_text: '',
          is_active: true
        });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating methodology note:', error);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingText.trim()) return;

    try {
      const response = await fetch(`/api/admin/methodology-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ methodology_text: editingText }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        setEditingText('');
        fetchMethodologyNotes();
      }
    } catch (error) {
      console.error('Error updating methodology note:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this methodology note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/methodology-notes/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchMethodologyNotes();
      }
    } catch (error) {
      console.error('Error deleting methodology note:', error);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/methodology-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      const data = await response.json();
      if (data.success) {
        fetchMethodologyNotes();
      }
    } catch (error) {
      console.error('Error toggling methodology note status:', error);
    }
  };

  const startEditing = (note: MethodologyNote) => {
    setEditingId(note.id);
    setEditingText(note.methodology_text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
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
              <h3 className="text-base font-semibold text-themeTealWhite">Manage Methodology Notes</h3>
              <p className="text-sm text-themeTealLighter mt-1">Manage methodology notes for different sections</p>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-themeTeal">Loading methodology notes...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Create New Note */}
              {isCreating ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Create New Methodology Note</h4>
                  <form onSubmit={handleCreate} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Section</label>
                        <select
                          value={newNote.section_key}
                          onChange={(e) => {
                            const selected = sectionOptions.find(opt => opt.key === e.target.value);
                            setNewNote({
                              ...newNote,
                              section_key: e.target.value,
                              section_name: selected?.name || ''
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-themeTeal"
                          required
                        >
                          <option value="">Select Section</option>
                          {sectionOptions.map(option => (
                            <option key={option.key} value={option.key}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Section Name</label>
                        <input
                          type="text"
                          value={newNote.section_name}
                          onChange={(e) => setNewNote({ ...newNote, section_name: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-themeTeal"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Methodology Text</label>
                      <textarea
                        value={newNote.methodology_text}
                        onChange={(e) => setNewNote({ ...newNote, methodology_text: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-themeTeal"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="submit"
                        className="bg-themeTeal text-white px-4 py-2 text-sm rounded hover:bg-themeTealDark transition duration-300 flex items-center"
                      >
                        <Save width={16} height={16} className="mr-1"/>
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false);
                          setNewNote({
                            section_key: '',
                            section_name: '',
                            methodology_text: '',
                            is_active: true
                          });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 text-sm rounded hover:bg-gray-600 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-themeTeal text-white px-4 py-2 text-sm rounded hover:bg-themeTealDark transition duration-300 flex items-center"
                >
                  <Plus width={16} height={16} className="mr-1"/>
                  Add New Methodology Note
                </button>
              )}

              {/* Methodology Notes List */}
              <div className="space-y-3">
                {methodologyNotes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No methodology notes found. Create one to get started.
                  </div>
                ) : (
                  methodologyNotes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{note.section_name}</h4>
                            <span className="text-xs text-gray-500">({note.section_key})</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              note.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {note.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Created: {formatDate(note.created_at)} | Updated: {formatDate(note.updated_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleActive(note.id, note.is_active)}
                            className={`p-1 rounded transition duration-300 ${
                              note.is_active 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={note.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {note.is_active ? <EyeOff width={16} height={16}/> : <Eye width={16} height={16}/>}
                          </button>
                          <button
                            onClick={() => startEditing(note)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition duration-300"
                            title="Edit"
                          >
                            <Edit width={16} height={16}/>
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition duration-300"
                            title="Delete"
                          >
                            <Trash2 width={16} height={16}/>
                          </button>
                        </div>
                      </div>
                      
                      {editingId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-themeTeal"
                            rows={3}
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdate(note.id)}
                              className="bg-themeTeal text-white px-3 py-1 text-sm rounded hover:bg-themeTealDark transition duration-300 flex items-center"
                            >
                              <Save width={14} height={14} className="mr-1"/>
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600 transition duration-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {note.methodology_text}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;
