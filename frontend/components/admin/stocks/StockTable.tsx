'use client';

import React, { useState } from 'react';
import RichTextEditor from '../RichTextEditor';
import Image from 'next/image';
import { Check, ChevronDown, Eye, IndianRupee, SquarePen, Trash2, X } from 'lucide-react';

interface Stock {
  id: number;
  company_name: string;
  logo: string;
  price: number;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string
  demand: 'High Demand' | 'Low Demand';
  homeDisplay: 'yes' | 'no';
  bannerDisplay: 'yes' | 'no';
  valuation: string;
  price_per_share: number;
  percentage_change: number;
  createdAt: string;
  updatedAt: string;
}

interface StockTableProps {
  stocks: Stock[];
  onRefresh: () => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onNotification?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
}

interface ImageUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

const StockTable: React.FC<StockTableProps> = ({ stocks, onRefresh, onSort, sortBy, sortOrder, onNotification }) => {
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Stock>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editIconFile, setEditIconFile] = useState<File | null>(null);
  const [viewingStock, setViewingStock] = useState<Stock | null>(null);
  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  });

  // Get current user's role to determine permissions
  const getCurrentUserRole = () => {
    try {
      const storedUser = sessionStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.role;
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
    return null;
  };

  const currentUserRole = getCurrentUserRole();
  const canManageStocks = currentUserRole === 10 || currentUserRole === 11; // Admin or SuperAdmin

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

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setEditFormData({
      company_name: stock.company_name,
      price: stock.price,
      price_change: stock.price_change,
      teaser: stock.teaser,
      short_description: stock.short_description,
      analysis: stock.analysis,
      demand: stock.demand,
      homeDisplay: stock.homeDisplay,
      bannerDisplay: stock.bannerDisplay,
      valuation: stock.valuation,
      price_per_share: stock.price_per_share,
      percentage_change: stock.percentage_change
    });
    setEditIconFile(null); // Reset icon file
    setImageUpload({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
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
      setEditIconFile(null);
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
      setEditIconFile(null);
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
    
    setEditIconFile(file);
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
    setEditIconFile(null);
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

  const handleViewStock = (stock: Stock) => {
    setViewingStock(stock);
  };

  const handleUpdateStock = async () => {
    if (!editingStock) return;
    
    setEditLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('company_name', editFormData.company_name || '');
      formData.append('price', editFormData.price?.toString() || '');
      formData.append('price_change', editFormData.price_change?.toString() || '');
      formData.append('teaser', editFormData.teaser || '');
      formData.append('short_description', editFormData.short_description || '');
      formData.append('analysis', editFormData.analysis || '');
      formData.append('demand', editFormData.demand || '');
      formData.append('homeDisplay', editFormData.homeDisplay || '');
      formData.append('bannerDisplay', editFormData.bannerDisplay || '');
      formData.append('valuation', editFormData.valuation || '');
      formData.append('price_per_share', editFormData.price_per_share?.toString() || '');
      formData.append('percentage_change', editFormData.percentage_change?.toString() || '');
      
      // Add logo file if selected
      if (editIconFile) {
        formData.append('logo', editIconFile);
      }

      const response = await fetch(`/api/admin/stocks/${editingStock.id}`, {
        method: 'PUT',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onRefresh();
        setEditingStock(null);
        setEditFormData({});
        setEditIconFile(null);
        onNotification?.('success', 'Stock Updated', 'Stock has been updated successfully!');
      } else {
        onNotification?.('error', 'Update Failed', data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      onNotification?.('error', 'Update Failed', 'Error updating stock');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this stock?')) {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
        const response = await fetch(`/api/admin/stocks/${id}`, {
          method: 'DELETE',
        headers: {
          'token': token,
        },
      });
        
        const data = await response.json();
        if (data.success) {
          onRefresh();
          onNotification?.('success', 'Stock Deleted', 'Stock has been deleted successfully!');
        } else {
          onNotification?.('error', 'Delete Failed', data.message || 'Failed to delete stock');
        }
      } catch (error) {
        console.error('Error deleting stock:', error);
        onNotification?.('error', 'Delete Failed', 'Error deleting stock');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Table */}
      <div className="bg-white rounded border border-themeTealLighter">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-themeTeal border-b border-themeTealLighter">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('company_name')}
                >
                  <div className="flex items-center">
                    Company
                    {sortBy === 'company_name' ? (
                      <ChevronDown className={`ml-1 h-4 w-4 transition duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}/>
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50"/>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortBy === 'price' ? (
                      <ChevronDown className={`ml-1 h-4 w-4 transition duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}/>
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50"/>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider cursor-pointer"
                  onClick={() => onSort?.('price_change')}
                >
                  <div className="flex items-center">
                    Price Change
                    {sortBy === 'price_change' ? (
                      <ChevronDown className={`ml-1 h-4 w-4 transition duration-300 ${sortOrder === 'asc' ? 'rotate-180' : ''}`}/>
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4 opacity-50"/>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider">
                  Teaser
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  onClick={() => onSort?.('demand')}
                >
                  <div className="flex items-center">
                    Demand
                    {sortBy === 'demand' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  onClick={() => onSort?.('homeDisplay')}
                >
                  <div className="flex items-center">
                    Home Display
                    {sortBy === 'homeDisplay' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  onClick={() => onSort?.('bannerDisplay')}
                >
                  <div className="flex items-center">
                    Banner Display
                    {sortBy === 'bannerDisplay' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  onClick={() => onSort?.('valuation')}
                >
                  <div className="flex items-center">
                    Valuation
                    {sortBy === 'valuation' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  onClick={() => onSort?.('price_per_share')}
                >
                  <div className="flex items-center">
                    Price/Share
                    {sortBy === 'price_per_share' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  onClick={() => onSort?.('percentage_change')}
                >
                  <div className="flex items-center">
                    % Change
                    {sortBy === 'percentage_change' ? (
                      <svg className={`ml-1 h-3 w-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="ml-1 h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-themeTealWhite uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-themeTealLighter">
              {stocks.map((stock, index) => (
                <tr 
                  key={stock.id}
                  className={`hover:bg-themeTealWhite transition duration-300 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-themeTealWhite'
                  }`}
                >
                  {/* Company Column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {stock.logo ? (
                          <Image
                            className="h-8 rounded-full object-cover"
                            src={stock.logo}
                            alt={stock.company_name}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <span className="text-xs font-bold text-themeTealWhite bg-themeTeal p-2 rounded">
                            {stock.company_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-themeTeal font-semibold">
                          {stock.company_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-themeTeal flex items-center"><IndianRupee width={12} height={12}/>{stock.price}</div>
                  </td>

                  {/* Price Change Column */}
                  <td className="px-4 py-3">
                    <div className={`text-xs font-medium flex items-center ${stock.price_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.price_change >= 0 ? '+' : '-'}<IndianRupee width={12} height={12}/>{stock.price_change}
                    </div>
                  </td>

                  {/* Teaser Column */}
                  <td className="px-4 py-3">
                    <div className="text-xs text-themeTealLight truncate max-w-xs">
                      {stock.teaser}
                    </div>
                  </td>

                  {/* Demand Column */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stock.demand === 'High Demand' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stock.demand || 'N/A'}
                    </span>
                  </td>

                  {/* Home Display Column */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stock.homeDisplay === 'yes' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stock.homeDisplay === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </td>

                  {/* Banner Display Column */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stock.bannerDisplay === 'yes' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stock.bannerDisplay === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </td>

                  {/* Valuation Column */}
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-gray-900">
                      {stock.valuation || 'N/A'}
                    </div>
                  </td>

                  {/* Price per Share Column */}
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-gray-900">₹{stock.price_per_share || 0}</div>
                  </td>

                  {/* Percentage Change Column */}
                  <td className="px-4 py-3">
                    <div className={`text-xs font-medium ${(stock.percentage_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(stock.percentage_change || 0) >= 0 ? '+' : ''}{stock.percentage_change || 0}%
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      {/* View Button - Available for all users */}
                      <button
                        onClick={() => handleViewStock(stock)}
                        className="p-2 text-themeTealWhite bg-themeSkyBlue rounded transition duration-300 hover:bg-white hover:text-themeSkyBlue cursor-pointer"
                        title="View Stock Details"
                      >
                        <Eye width={16} height={16}/>
                      </button>
                      
                      {canManageStocks && (
                        <>
                          <button
                            onClick={() => handleEditStock(stock)}
                            className="p-2 bg-themeTeal text-themeTealWhite rounded transition duration-300 hover:bg-white hover:text-themeTeal cursor-pointer"
                            title="Edit Stock"
                          >
                            <SquarePen width={16} height={16}/>
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id)}
                            className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer"
                            title="Delete Stock"
                          >
                            <Trash2 width={16} height={16}/>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Empty State */}
      {stocks.length === 0 && (
        <div className="text-center py-16 min-h-[400px] flex flex-col items-center justify-center">
          <svg className="mx-auto h-16 w-16 text-themeTealLighter mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-themeTeal mb-2">No stocks found</h3>
          <p className="text-sm text-themeTealLighter">Get started by adding a new stock.</p>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-themeTealWhite">Edit Stock</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingStock(null);
                    setEditFormData({});
                    setEditIconFile(null);
                  }}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              <form id="edit-stock-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name Field */}
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.company_name || ''}
                      onChange={(e) => setEditFormData({...editFormData, company_name: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Price Field */}
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-themeTealLighter"><IndianRupee width={16} height={16} /></span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.price || ''}
                        onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Price Change Field */}
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Price Change <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-themeTealLighter"><IndianRupee width={16} height={16} /></span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.price_change || ''}
                        onChange={(e) => setEditFormData({...editFormData, price_change: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Teaser Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Teaser <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editFormData.teaser || ''}
                      onChange={(e) => setEditFormData({...editFormData, teaser: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                      placeholder="Enter teaser text"
                      rows={2}
                    />
                  </div>

                  {/* Short Description Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={editFormData.short_description || ''}
                      onChange={(value) => setEditFormData({...editFormData, short_description: value})}
                      placeholder="Enter short description"
                      height="120px"
                    />
                  </div>

                  {/* Analysis Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Analysis <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={editFormData.analysis || ''}
                      onChange={(value) => setEditFormData({...editFormData, analysis: value})}
                      placeholder="Enter detailed analysis with rich formatting..."
                      height="200px"
                    />
                  </div>

                  {/* Demand Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Demand <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.demand || ''}
                      onChange={(e) => setEditFormData({...editFormData, demand: e.target.value as 'High Demand' | 'Low Demand'})}
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal"
                    >
                      <option value="">Select Demand</option>
                      <option value="High Demand">High Demand</option>
                      <option value="Low Demand">Low Demand</option>
                    </select>
                  </div>

                  {/* Home Display Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Home Display <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.homeDisplay || ''}
                      onChange={(e) => setEditFormData({...editFormData, homeDisplay: e.target.value as 'yes' | 'no'})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Display</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {/* Banner Display Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Banner Display <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.bannerDisplay || ''}
                      onChange={(e) => setEditFormData({...editFormData, bannerDisplay: e.target.value as 'yes' | 'no'})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Display</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {/* Valuation Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Valuation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.valuation || ''}
                      onChange={(e) => setEditFormData({...editFormData, valuation: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                      placeholder="Enter valuation"
                    />
                  </div>

                  {/* Price per Share Field */}
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
                        step="0.01"
                        value={editFormData.price_per_share || ''}
                        onChange={(e) => setEditFormData({...editFormData, price_per_share: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Percentage Change Field */}
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
                        step="0.01"
                        value={editFormData.percentage_change || ''}
                        onChange={(e) => setEditFormData({...editFormData, percentage_change: parseFloat(e.target.value) || 0})}
                        className="w-full pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-themeTeal mb-1">
                      Company Logo URL
                    </label>
                    {/* Error Message */}
                    {imageUpload.error && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-600">{imageUpload.error}</p>
                      </div>
                    )}
                    
                    <label 
                      htmlFor="edit-icon-upload"
                      className={`mt-1 border-2 block border-dashed rounded transition duration-200 cursor-pointer ${
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
                        /* New Image Preview */
                        <div className="p-4">
                          <div className="space-y-3 text-center">
                            <div className="relative inline-block">
                              <Image
                                src={imageUpload.preview}
                                alt="New preview"
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
                              <p className="font-medium text-green-600">✓ New image selected</p>
                              <p className="text-xs text-themeTealLighter">{imageUpload.file?.name}</p>
                              <p className="text-xs text-themeTealLighter">
                                {imageUpload.file?.size ? (imageUpload.file.size / 1024 / 1024).toFixed(2) : '0'} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              className="bg-themeTeal text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-themeTealLight transition duration-200 cursor-pointer"
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      ) : editingStock?.logo ? (
                        /* Current Icon Display */
                        <div className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Image
                                src={editingStock.logo}
                                alt="Current icon"
                                width={60}
                                height={60}
                                className="h-15 w-15 rounded object-cover border-2 border-themeTealLighter/30"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-themeTeal mb-2">Current Icon</p>
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  className="bg-themeTeal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-themeTealLight transition-colors duration-200"
                                >
                                  Change Icon
                                </button>
                                <p className="text-xs text-themeTealLighter">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Upload Prompt */
                        <div className="p-4">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600 justify-center">
                              <span className="bg-white rounded-md font-medium text-themeTeal px-2 py-1">Upload a file</span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                    
                    {/* Hidden File Input */}
                    <input
                      id="edit-icon-upload"
                      name="edit-icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    
                    {/* Upload Progress */}
                    {imageUpload.uploading && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{imageUpload.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-themeTeal h-2 rounded-full transition-all duration-300"
                            style={{ width: `${imageUpload.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-themeTealWhite flex justify-end flex-shrink-0 rounded-b-2xl">
              <button
                type="submit"
                form="edit-stock-form"
                onClick={handleUpdateStock}
                disabled={editLoading}
                className="px-4 py-3 text-sm bg-themeTeal text-white rounded hover:bg-themeTealLight transition duration-200 disabled:opacity-50 font-medium cursor-pointer flex gap-1"
              >
                {editLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Check width={20} height={20}/>
                    <span>Update Stock</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Stock Modal */}
      {viewingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded shadow w-full max-w-2xl mx-4 my-4 max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-themeTeal px-6 py-4 rounded-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-themeTealWhite flex items-center justify-center overflow-hidden">
                    {viewingStock.logo ? (
                      <Image
                        src={viewingStock.logo}
                        alt={viewingStock.company_name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-themeTealWhite">
                        {viewingStock.company_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-themeTealWhite">Stock Details</h3>
                    <p className="text-themeTealWhite/80 text-sm">{viewingStock.company_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingStock(null)}
                  className="text-themeTealWhite transition duration-300 cursor-pointer"
                >
                  <X/>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">Company Name</label>
                    <input
                      type="text"
                      value={viewingStock.company_name}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded bg-themeTealWhite text-themeTeal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">Stock ID</label>
                    <input
                      type="text"
                      value={viewingStock.id}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded bg-themeTealWhite text-themeTeal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">Current Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-themeTealLighter"><IndianRupee width={16} height={16} /></span>
                      </div>
                      <input
                        type="text"
                        value={viewingStock.price}
                        readOnly
                        className="w-full pl-8 pr-4 py-2 text-sm border border-themeTealLighter rounded bg-themeTealWhite text-themeTeal focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">Price Change</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-themeTealLighter"><IndianRupee width={16} height={16} /></span>
                      </div>
                      <input
                        type="text"
                        value={`${viewingStock.price_change >= 0 ? '+' : ''}${viewingStock.price_change}`}
                        readOnly
                        className={`w-full pl-8 pr-4 py-2 text-sm border border-themeTealLighter rounded bg-themeTealWhite focus:outline-none ${
                          viewingStock.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Stock Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Demand</label>
                      <p className={`text-sm bg-white p-2 rounded border ${
                        viewingStock.demand === 'High Demand' 
                          ? 'text-green-600 font-semibold' 
                          : 'text-red-600 font-semibold'
                      }`}>
                        {viewingStock.demand || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valuation</label>
                      <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                        {viewingStock.valuation || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price per Share</label>
                      <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                        ₹{viewingStock.price_per_share || 0}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentage Change</label>
                      <p className={`text-sm bg-white p-2 rounded border ${
                        (viewingStock.percentage_change || 0) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(viewingStock.percentage_change || 0) >= 0 ? '+' : ''}{viewingStock.percentage_change || 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Home Display</label>
                      <p className={`text-sm bg-white p-2 rounded border ${
                        viewingStock.homeDisplay === 'yes' 
                          ? 'text-green-600 font-semibold' 
                          : 'text-gray-600'
                      }`}>
                        {viewingStock.homeDisplay === 'yes' ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Banner Display</label>
                      <p className={`text-sm bg-white p-2 rounded border ${
                        viewingStock.bannerDisplay === 'yes' 
                          ? 'text-green-600 font-semibold' 
                          : 'text-gray-600'
                      }`}>
                        {viewingStock.bannerDisplay === 'yes' ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teaser */}
                <div>
                  <label className="block text-xs font-medium text-themeTeal mb-1">Teaser</label>
                  <textarea
                    value={viewingStock.teaser}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded bg-themeTealWhite text-themeTeal focus:outline-none"
                    rows={2}
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-medium text-themeTeal mb-1">Short Description</label>
                  <textarea
                    value={viewingStock.short_description}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded bg-themeTealWhite text-themeTeal focus:outline-none"
                    rows={3}
                  />
                </div>

                {/* Analysis */}
                <div>
                  <label className="block text-xs font-medium text-themeTeal mb-1">Analysis</label>
                  <textarea
                    value={viewingStock.analysis}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-themeTealLighter rounded bg-themeTealWhite text-themeTeal focus:outline-none"
                    rows={4}
                  />
                </div>

                {/* Company Logo */}
                {viewingStock.logo && (
                  <div>
                    <label className="block text-xs font-medium text-themeTeal mb-1">Company Logo</label>
                    <div className="mt-1 border-2 border-themeTealLighter border-dashed rounded p-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <Image
                            src={viewingStock.logo}
                            alt={`${viewingStock.company_name} logo`}
                            width={120}
                            height={120}
                            className="h-30 w-30 rounded-lg object-cover shadow-sm shadow-themeTeal/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;
