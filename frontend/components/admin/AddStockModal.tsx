'use client';

import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

interface StockData {
  company_name: string;
  logo: string;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
  demand: 'High Demand' | 'Low Demand';
  homeDisplay: 'yes' | 'no';
  bannerDisplay: 'yes' | 'no';
  valuation: string;
  price_per_share: number;
  percentage_change: number;
  icon: File | null;
}

interface AddStockModalProps {
  onClose: () => void;
  onSubmit: (stockData: StockData) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<StockData>({
    company_name: '',
    logo: '',
    price_change: 0,
    teaser: '',
    short_description: '',
    analysis: '',
    demand: 'Low Demand',
    homeDisplay: 'no',
    bannerDisplay: 'no',
    valuation: '',
    price_per_share: 0,
    percentage_change: 0,
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] flex flex-col">
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
        <div className="p-6 overflow-y-auto">
          
          <form id="stock-form" onSubmit={handleSubmit} className="space-y-6">
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
            
            {/* Price Change */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Price Change
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="price_change"
                  value={formData.price_change}
                  onChange={(e) => setFormData({...formData, price_change: parseFloat(e.target.value) || 0})}
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Teaser */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Teaser <span className="text-red-500">*</span>
              </label>
              <textarea
                name="teaser"
                value={formData.teaser}
                onChange={(e) => setFormData({...formData, teaser: e.target.value})}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                placeholder="Enter teaser text"
                rows={2}
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Short Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.short_description}
                onChange={(value) => setFormData({...formData, short_description: value})}
                placeholder="Enter short description with rich formatting..."
                height="120px"
              />
            </div>

            {/* Analysis */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Analysis <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.analysis}
                onChange={(value) => setFormData({...formData, analysis: value})}
                placeholder="Enter detailed analysis with rich formatting..."
                height="200px"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Demand <span className="text-red-500">*</span>
                </label>
                <select
                  name="demand"
                  value={formData.demand}
                  onChange={(e) => setFormData({...formData, demand: e.target.value as 'High Demand' | 'Low Demand'})}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                >
                  <option value="High Demand">High Demand</option>
                  <option value="Low Demand">Low Demand</option>
                </select>
              </div>
            </div>

            {/* Display Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Home Display <span className="text-red-500">*</span>
                </label>
                <select
                  name="homeDisplay"
                  value={formData.homeDisplay}
                  onChange={(e) => setFormData({...formData, homeDisplay: e.target.value as 'yes' | 'no'})}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Banner Display <span className="text-red-500">*</span>
                </label>
                <select
                  name="bannerDisplay"
                  value={formData.bannerDisplay}
                  onChange={(e) => setFormData({...formData, bannerDisplay: e.target.value as 'yes' | 'no'})}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Valuation */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Valuation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="valuation"
                value={formData.valuation}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                placeholder="Enter valuation"
              />
            </div>

            {/* Percentage Change and Price per Share - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Percentage Change <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                  <input
                    type="number"
                    name="percentage_change"
                    value={formData.percentage_change}
                    onChange={(e) => setFormData({...formData, percentage_change: parseFloat(e.target.value) || 0})}
                    required
                    className="w-full pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price per Share <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="price_per_share"
                    value={formData.price_per_share}
                    onChange={(e) => setFormData({...formData, price_per_share: parseFloat(e.target.value) || 0})}
                    required
                    className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                placeholder="Enter logo URL"
              />
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
