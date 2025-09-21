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
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-themeTeal to-themeTealLight px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Add New Stock</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          <form id="stock-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Stock Title */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stock Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                placeholder="Enter stock title"
              />
            </div>
            
            {/* Company Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                placeholder="Enter company name"
              />
            </div>
            
            {/* Price and Valuation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price per Share <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price_per_share"
                  value={formData.price_per_share}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Valuation <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="valuation"
                  value={formData.valuation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Price Change and Percentage Change */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price Change
                </label>
                <input
                  type="number"
                  name="price_change"
                  value={formData.price_change}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Percentage Change
                </label>
                <input
                  type="number"
                  name="percentage_change"
                  value={formData.percentage_change}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Stock Icon */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stock Icon
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-themeTeal transition-colors duration-200">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="icon-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-themeTeal hover:text-themeTealLight focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-themeTeal">
                      <span>Upload a file</span>
                      <input
                        id="icon-upload"
                        name="icon"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            form="stock-form"
            className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTealLight transition-colors duration-200 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
