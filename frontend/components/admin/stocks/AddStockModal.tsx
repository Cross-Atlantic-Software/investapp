'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import RichTextEditor from '../RichTextEditor';

export interface StockData {
  title: string;
  company_name: string;
  logo: string;
  price: number;
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

interface ImageUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface AddStockModalProps {
  onClose: () => void;
  onSubmit: (stockData: StockData) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<StockData>({
    title: '',
    company_name: '',
    logo: '',
    price: 0,
    price_change: 0,
    teaser: '',
    short_description: '',
    analysis: '',
    demand: 'High Demand',
    homeDisplay: 'no',
    bannerDisplay: 'no',
    valuation: '',
    price_per_share: 0,
    percentage_change: 0,
    icon: null as File | null,
  });

  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateImageFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file (PNG, JPG, GIF, etc.)';
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setImageUpload({
        file: null,
        preview: null,
        uploading: false,
        progress: 0,
        error: null,
      });
      setFormData(prev => ({ ...prev, icon: null }));
      return;
    }

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setImageUpload(prev => ({
        ...prev,
        error: validationError,
        file: null,
        preview: null,
      }));
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    
    setImageUpload({
      file,
      preview,
      uploading: false,
      progress: 0,
      error: null,
    });
    
    setFormData(prev => ({
      ...prev,
      icon: file
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create a synthetic event to reuse the file change handler
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(syntheticEvent);
    }
  };

  const removeImage = () => {
    if (imageUpload.preview) {
      URL.revokeObjectURL(imageUpload.preview);
    }
    setImageUpload({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
    setFormData(prev => ({ ...prev, icon: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto m-0">
          <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
              <h3 className="text-base font-semibold text-white">Add New Stock</h3>
            </div>
            <button
              onClick={onClose}
              className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X/>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          <form id="stock-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Stock Title */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Stock Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
                placeholder="Enter stock title"
              />
            </div>
            
            {/* Company Name */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
                placeholder="Enter company name"
              />
            </div>
            
            {/* Price and Valuation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Price per Share <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price_per_share"
                  value={formData.price_per_share}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Valuation <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="valuation"
                  value={formData.valuation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Price and Price Change */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Price Change
                </label>
                <input
                  type="number"
                  name="price_change"
                  value={formData.price_change}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            {/* Percentage Change */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Percentage Change
              </label>
              <input
                type="number"
                name="percentage_change"
                value={formData.percentage_change}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            {/* Teaser */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Teaser
              </label>
              <textarea
                name="teaser"
                value={formData.teaser}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight placeholder-text-themeTealLight"
                placeholder="Enter teaser text"
                rows={3}
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Short Description
              </label>
              <RichTextEditor
                value={formData.short_description}
                onChange={(value) => setFormData({...formData, short_description: value})}
                placeholder="Enter short description"
                height="120px"
              />
            </div>

            {/* Analysis */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Analysis
              </label>
              <RichTextEditor
                value={formData.analysis}
                onChange={(value) => setFormData({...formData, analysis: value})}
                placeholder="Enter detailed analysis with rich formatting..."
                height="200px"
              />
            </div>

            {/* Demand */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Demand
              </label>
              <select
                name="demand"
                value={formData.demand}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
              >
                <option value="High Demand">High Demand</option>
                <option value="Low Demand">Low Demand</option>
              </select>
            </div>

            {/* Display Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Home Display
                </label>
                <select
                  name="homeDisplay"
                  value={formData.homeDisplay}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-themeTeal mb-1">
                  Banner Display
                </label>
                <select
                  name="bannerDisplay"
                  value={formData.bannerDisplay}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded-md focus:outline-none focus:border-themeTeal transition duration-200 text-themeTealLight"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            
            {/* Stock Icon */}
            <div>
              <label className="block text-xs font-medium text-themeTeal mb-1">
                Stock Icon
              </label>
              
              {/* Error Message */}
              {imageUpload.error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600">{imageUpload.error}</p>
                </div>
              )}
              
              {/* Upload Area */}
              <label 
                htmlFor="icon-upload"
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-themeTealLighter rounded transition-colors duration-200 cursor-pointer ${
                  imageUpload.error 
                    ? 'border-red-300 bg-red-50' 
                    : imageUpload.preview 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-themeTealLighter hover:bg-themeTealWhite'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imageUpload.preview ? (
                  /* Image Preview */
                  <div className="space-y-3 text-center">
                    <div className="relative inline-block">
                      <Image
                        src={imageUpload.preview}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover rounded border border-themeTealLighter mx-auto"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                      >
                        <X/>
                      </button>
                    </div>
                    <div className="text-sm text-themeTealLighter">
                      <p className="font-medium text-green-600 mb-2">✓ Image selected</p>
                      <p className="text-xs text-themeTealLighter">{imageUpload.file?.name}</p>
                      <p className="text-xs text-themeTealLighter">
                        {imageUpload.file?.size ? (imageUpload.file.size / 1024 / 1024).toFixed(2) : '0'} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="bg-themeTeal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-themeTealLight transition-colors duration-200 cursor-pointer"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  /* Upload Prompt */
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="bg-white rounded-md font-medium text-themeTeal px-2 py-1">Upload a file</span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
              
              {/* Hidden File Input */}
              <input
                id="icon-upload"
                name="icon"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              
              {/* Upload Progress */}
              {imageUpload.uploading && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-themeTealLighter mb-1">
                    <span>Uploading...</span>
                    <span>{imageUpload.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-themeTeal h-2 rounded-full transition duration-300"
                      style={{ width: `${imageUpload.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-themeTealWhite flex justify-end flex-shrink-0 rounded-b-2xl">
          <button
            type="submit"
            form="stock-form"
            className="px-5 py-3 text-sm bg-themeTeal text-white rounded hover:bg-themeTealLight transition duration-200 disabled:opacity-50 font-medium cursor-pointer"
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
