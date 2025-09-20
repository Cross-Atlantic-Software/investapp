'use client';

import React, { useState } from 'react';

interface AddStockModalProps {
  onClose: () => void;
  onSubmit: (stockData: any) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    price_per_share: '',
    valuation: '',
    price_change: '',
    percentage_change: '',
    icon: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      icon: file
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-themeTealLighter w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-themeTeal font-serif">Add New Stock</h3>
            <button
              onClick={onClose}
              className="text-themeTealLighter hover:text-themeTeal"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-themeTeal">
                Stock Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-themeTealLighter rounded-md px-3 py-2 focus:outline-none focus:ring-themeTeal focus:border-themeTeal"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-themeTeal">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-themeTealLighter rounded-md px-3 py-2 focus:outline-none focus:ring-themeTeal focus:border-themeTeal"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal">
                  Price per Share
                </label>
                <input
                  type="number"
                  name="price_per_share"
                  value={formData.price_per_share}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-themeTealLighter rounded-md px-3 py-2 focus:outline-none focus:ring-themeTeal focus:border-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal">
                  Valuation
                </label>
                <input
                  type="number"
                  name="valuation"
                  value={formData.valuation}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-themeTealLighter rounded-md px-3 py-2 focus:outline-none focus:ring-themeTeal focus:border-themeTeal"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal">
                  Price Change
                </label>
                <input
                  type="number"
                  name="price_change"
                  value={formData.price_change}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-themeTealLighter rounded-md px-3 py-2 focus:outline-none focus:ring-themeTeal focus:border-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal">
                  Percentage Change
                </label>
                <input
                  type="number"
                  name="percentage_change"
                  value={formData.percentage_change}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-themeTealLighter rounded-md px-3 py-2 focus:outline-none focus:ring-themeTeal focus:border-themeTeal"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-themeTeal">
                Stock Icon
              </label>
              <input
                type="file"
                name="icon"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-themeTealLighter file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-themeTealWhite file:text-themeTeal hover:file:bg-themeTeal"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-themeTeal bg-themeTealWhite rounded-md hover:bg-themeTealLighter"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-themeTealWhite bg-themeTeal rounded-md hover:bg-themeTealLight"
              >
                Add Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
