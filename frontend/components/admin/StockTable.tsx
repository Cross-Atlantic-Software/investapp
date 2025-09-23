'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Stock {
  id: number;
  company_name: string;
  logo: string;
  price: number;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
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

const StockTable: React.FC<StockTableProps> = ({ stocks, onRefresh, onSort, sortBy, sortOrder, onNotification }) => {
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Stock>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editIconFile, setEditIconFile] = useState<File | null>(null);
  const [viewingStock, setViewingStock] = useState<Stock | null>(null);

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

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setEditFormData({
      company_name: stock.company_name,
      price: stock.price,
      price_change: stock.price_change,
      teaser: stock.teaser,
      short_description: stock.short_description,
      analysis: stock.analysis
    });
    setEditIconFile(null); // Reset icon file
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
      
      // Add logo file if selected
      if (editIconFile) {
        formData.append('logo', editIconFile);
      }

      const response = await fetch(`http://localhost:8888/api/admin/stocks/${editingStock.id}`, {
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
        const response = await fetch(`http://localhost:8888/api/admin/stocks/${id}`, {
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                  onClick={() => onSort?.('company_name')}
                >
                  <div className="flex items-center">
                    Company
                    {sortBy === 'company_name' ? (
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
                  onClick={() => onSort?.('price')}
                >
                  <div className="flex items-center">
                    Price
                    {sortBy === 'price' ? (
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
                  onClick={() => onSort?.('price_change')}
                >
                  <div className="flex items-center">
                    Price Change
                    {sortBy === 'price_change' ? (
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teaser
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock, index) => (
                <tr 
                  key={stock.id}
                  className={`hover:bg-gray-50 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  {/* Company Column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-themeTeal to-themeTealLight flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                        {stock.logo ? (
                          <Image
                            className="h-8 w-8 rounded-full object-cover"
                            src={stock.logo}
                            alt={stock.company_name}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {stock.company_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {stock.company_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-gray-900">₹{stock.price}</div>
                  </td>

                  {/* Price Change Column */}
                  <td className="px-4 py-3">
                    <div className={`text-xs font-medium ${stock.price_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.price_change >= 0 ? '+' : ''}₹{stock.price_change}
                    </div>
                  </td>

                  {/* Teaser Column */}
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600 truncate max-w-xs">
                      {stock.teaser}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-3 text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      {/* View Button - Available for all users */}
                      <button
                        onClick={() => handleViewStock(stock)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                        title="View Stock Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {canManageStocks && (
                        <>
                          <button
                            onClick={() => handleEditStock(stock)}
                            className="p-2 text-themeTeal hover:text-themeTealLight hover:bg-teal-50 rounded-md transition-colors duration-200"
                            title="Edit Stock"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                            title="Delete Stock"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
          <p className="text-sm text-gray-500">Get started by adding a new stock.</p>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-4 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-themeTeal to-themeTealLight px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Edit Stock</h3>
                </div>
                <button
                  onClick={() => {
                    setEditingStock(null);
                    setEditFormData({});
                    setEditIconFile(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <form id="edit-stock-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.company_name || ''}
                      onChange={(e) => setEditFormData({...editFormData, company_name: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                      placeholder="Enter company name"
                    />
                  </div>

                  {/* Price Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.price || ''}
                        onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Price Change Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price Change <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.price_change || ''}
                        onChange={(e) => setEditFormData({...editFormData, price_change: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Teaser Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Teaser <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editFormData.teaser || ''}
                      onChange={(e) => setEditFormData({...editFormData, teaser: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                      placeholder="Enter teaser text"
                      rows={2}
                    />
                  </div>

                  {/* Short Description Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editFormData.short_description || ''}
                      onChange={(e) => setEditFormData({...editFormData, short_description: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                      placeholder="Enter short description"
                      rows={3}
                    />
                  </div>

                  {/* Analysis Field */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Analysis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editFormData.analysis || ''}
                      onChange={(e) => setEditFormData({...editFormData, analysis: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
                      placeholder="Enter analysis"
                      rows={4}
                    />
                  </div>

                  {/* Company Logo */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company Logo URL
                    </label>
                    <div className="mt-1 border-2 border-gray-300 border-dashed rounded-lg hover:border-themeTeal transition-colors duration-200">
                      {editingStock?.logo ? (
                        <div className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Image
                                src={editingStock.logo}
                                alt="Current icon"
                                width={60}
                                height={60}
                                className="h-15 w-15 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 mb-2">Current Icon</p>
                              <div className="flex items-center space-x-3">
                                <label htmlFor="edit-icon-upload" className="relative cursor-pointer bg-themeTeal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-themeTealLight focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-themeTeal transition-colors">
                                  <span>Change Icon</span>
                                  <input
                                    id="edit-icon-upload"
                                    name="edit-icon-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditIconFile(e.target.files?.[0] || null)}
                                    className="sr-only"
                                  />
                                </label>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label htmlFor="edit-icon-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-themeTeal hover:text-themeTealLight focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-themeTeal">
                                <span>Upload a file</span>
                                <input
                                  id="edit-icon-upload"
                                  name="edit-icon-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setEditIconFile(e.target.files?.[0] || null)}
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                form="edit-stock-form"
                onClick={handleUpdateStock}
                disabled={editLoading}
                className="px-4 py-2 text-sm bg-themeTeal text-white rounded-md hover:bg-themeTealLight transition-colors duration-200 disabled:opacity-50 font-medium flex items-center"
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
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-4 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    {viewingStock.logo ? (
                      <Image
                        src={viewingStock.logo}
                        alt={viewingStock.company_name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {viewingStock.company_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Stock Details</h3>
                    <p className="text-blue-100 text-sm">{viewingStock.company_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingStock(null)}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <p className="text-sm text-gray-900 bg-white p-2 rounded border">{viewingStock.company_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock ID</label>
                      <p className="text-sm text-gray-900 bg-white p-2 rounded border">{viewingStock.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                      <p className="text-sm text-gray-900 bg-white p-2 rounded border">₹{viewingStock.price}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Change</label>
                      <p className={`text-sm bg-white p-2 rounded border ${viewingStock.price_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {viewingStock.price_change >= 0 ? '+' : ''}₹{viewingStock.price_change}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teaser */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Teaser</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border leading-relaxed">
                    {viewingStock.teaser}
                  </p>
                </div>

                {/* Short Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Short Description</h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded border leading-relaxed">
                    {viewingStock.short_description}
                  </p>
                </div>

                {/* Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Analysis</h4>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded border leading-relaxed whitespace-pre-line">
                    {viewingStock.analysis}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                      <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                        {new Date(viewingStock.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                      <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                        {new Date(viewingStock.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logo Preview */}
                {viewingStock.logo && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h4>
                    <div className="flex justify-center">
                      <div className="relative">
                        <Image
                          src={viewingStock.logo}
                          alt={`${viewingStock.company_name} logo`}
                          width={200}
                          height={200}
                          className="rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2 break-all">
                      {viewingStock.logo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingStock(null)}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;
