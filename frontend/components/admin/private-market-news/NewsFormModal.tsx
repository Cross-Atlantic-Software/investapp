'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import SearchableMultiSelect from '@/components/admin/shared/SearchableMultiSelect';
import { NewsFormModalProps, NewNewsForm } from './types';

const NewsFormModal: React.FC<NewsFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taxonomies,
  editingItem,
  initialData,
  title,
  submitLabel,
  loading = false,
  onTaxonomyModalOpen
}) => {
  const [formData, setFormData] = useState<NewNewsForm>(
    initialData || {
      title: '',
      url: '',
      icon: null,
      taxonomy_ids: []
    }
  );

  useEffect(() => {
    if (editingItem) {
      const parseTaxonomyIds = (taxonomyIds: string): number[] => {
        if (!taxonomyIds) return [];
        try {
          const parsed = JSON.parse(taxonomyIds);
          if (Array.isArray(parsed)) {
            return parsed.map(id => typeof id === 'string' ? parseInt(id) : id).filter(id => !isNaN(id));
          }
          return [];
        } catch {
          return [];
        }
      };

      setFormData({
        title: editingItem.title,
        url: editingItem.url,
        icon: null,
        taxonomy_ids: parseTaxonomyIds(editingItem.taxonomy_ids)
      });
    } else if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        url: '',
        icon: null,
        taxonomy_ids: []
      });
    }
  }, [editingItem, initialData, isOpen]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      url: '',
      icon: null,
      taxonomy_ids: []
    });
    onClose();
  };

  const removeIcon = () => {
    setFormData({ ...formData, icon: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 m-0">
      <div className="bg-white rounded w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-themeTealWhite transition duration-300 cursor-pointer"
            >
              <X width={20} height={20}/>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-themeTeal mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none placeholder:text-themeTealLighter focus:border-themeTeal text-themeTeal"
                placeholder="Enter news title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-themeTeal mb-1">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal text-themeTeal placeholder:text-themeTealLighter"
                placeholder="https://example.com/news-article"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-themeTeal mb-1">Icon</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({...formData, icon: e.target.files?.[0] || null})}
                className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal text-themeTeal placeholder:text-themeTealLighter"
              />
              {formData.icon && (
                <div className="mt-2">
                  <div className="relative inline-block">
                    <img 
                      src={URL.createObjectURL(formData.icon)} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={removeIcon}
                      className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-themeTeal mb-1">Taxonomy</label>
              <div className="space-y-2">
                <SearchableMultiSelect
                  key={`taxonomy-dropdown-${taxonomies.map(t => t.id).join('-')}`}
                  options={taxonomies}
                  selectedValues={formData.taxonomy_ids}
                  onChange={(selectedIds) => setFormData({...formData, taxonomy_ids: selectedIds})}
                  placeholder="Select taxonomies..."
                  className="w-full"
                />
                <div className="flex items-center justify-end">
                  <button
                    onClick={onTaxonomyModalOpen}
                    className="text-themeTeal hover:text-themeSkyBlue text-sm flex items-center transition duration-300 cursor-pointer"
                  >
                    <Plus width={14} height={14} className="mr-1"/>
                    Add Taxonomy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 flex-shrink-0 border-t border-themeTealLighter">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-5 py-3 text-themeTealWhite bg-themeTealLighter rounded hover:bg-themeTealLight transition duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.url || (!formData.icon && !editingItem?.icon) || loading}
              className="px-5 py-3 bg-themeTeal text-white rounded-md hover:bg-themeSkyBlue disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 cursor-pointer"
            >
              {loading ? 'Processing...' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsFormModal;
