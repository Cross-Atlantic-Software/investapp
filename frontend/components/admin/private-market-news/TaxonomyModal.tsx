'use client';

import React from 'react';
import { X } from 'lucide-react';
import { TaxonomyModalProps } from './types';

const TaxonomyModal: React.FC<TaxonomyModalProps> = ({
  isOpen,
  onClose,
  taxonomies,
  onCreateTaxonomy,
  onDeleteTaxonomy,
  newTaxonomy,
  setNewTaxonomy
}) => {
  const handleSubmit = () => {
    onCreateTaxonomy(newTaxonomy);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-themeTeal px-6 py-4 rounded-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Manage Taxonomies</h3>
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
          {/* Create New Taxonomy */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-themeTeal mb-3">Create New Taxonomy</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Name</label>
                <input
                  type="text"
                  value={newTaxonomy.name}
                  onChange={(e) => setNewTaxonomy({...newTaxonomy, name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none placeholder:text-themeTealLighter text-themeTeal focus:border-themeTeal"
                  placeholder="Enter taxonomy name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newTaxonomy.color}
                    onChange={(e) => setNewTaxonomy({...newTaxonomy, color: e.target.value})}
                    className="w-12 h-8 border border-themeTealLighter rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTaxonomy.color}
                    onChange={(e) => setNewTaxonomy({...newTaxonomy, color: e.target.value})}
                    className="flex-1 px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none placeholder:text-themeTealLighter text-themeTeal focus:border-themeTeal mb-3"
                    placeholder="#0097D1"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!newTaxonomy.name}
                className="w-full px-4 py-3 bg-themeTeal text-white rounded-md hover:bg-themeSkyBlue disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                Create Taxonomy
              </button>
            </div>
          </div>
          
          {/* Existing Taxonomies */}
          <div>
            <h4 className="text-md font-medium text-themeTeal mb-3">Existing Taxonomies</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {taxonomies.map((taxonomy) => (
                <div key={taxonomy.id} className="flex items-center justify-between p-2 border border-themeTealLighter rounded">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: taxonomy.color }}
                    ></div>
                    <span className="text-sm text-themeTeal">{taxonomy.name}</span>
                  </div>
                  <button
                    onClick={() => onDeleteTaxonomy(taxonomy.id)}
                    className="text-red-600 hover:text-red-800 text-sm transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 flex-shrink-0 border-t border-themeTealLighter">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-3 text-themeTealWhite bg-themeTeal rounded-md hover:bg-themeTealLight transition duration-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxonomyModal;
