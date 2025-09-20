'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Stock {
  id: number;
  title: string;
  company_name: string;
  price_per_share: string;
  valuation: string;
  price_change: string;
  percentage_change: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface StockTableProps {
  stocks: Stock[];
  onRefresh: () => void;
}

const StockTable: React.FC<StockTableProps> = ({ stocks, onRefresh }) => {
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Stock>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editIconFile, setEditIconFile] = useState<File | null>(null);

  // Get current user's role to determine permissions
  const getCurrentUserRole = () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
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
      title: stock.title,
      company_name: stock.company_name,
      price_per_share: stock.price_per_share,
      valuation: stock.valuation,
      price_change: stock.price_change,
      percentage_change: stock.percentage_change
    });
    setEditIconFile(null); // Reset icon file
  };

  const handleUpdateStock = async () => {
    if (!editingStock) return;
    
    setEditLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', editFormData.title || '');
      formData.append('company_name', editFormData.company_name || '');
      formData.append('price_per_share', editFormData.price_per_share || '');
      formData.append('valuation', editFormData.valuation || '');
      formData.append('price_change', editFormData.price_change || '');
      formData.append('percentage_change', editFormData.percentage_change || '');
      
      // Add icon file if selected
      if (editIconFile) {
        formData.append('icon', editIconFile);
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
      } else {
        alert(data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this stock?')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.error('No token found');
          return;
        }
        const response = await fetch(`http://localhost:8888/api/admin/stocks/${id}`, {
          method: 'DELETE',
        headers: {
          'token': token,
        },
        });
        
        const data = await response.json();
        if (data.success) {
          onRefresh();
        } else {
          alert(data.message || 'Failed to delete stock');
        }
      } catch (error) {
        console.error('Error deleting stock:', error);
        alert('Error deleting stock');
      }
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-themeTealLighter">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-themeTeal mb-4 font-serif">
          All Stocks
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-themeTealWhite">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider">
                  Valuation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-themeTealLight uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-themeTealLighter">
              {stocks.map((stock) => (
                <tr key={stock.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={stock.icon || '/placeholder-icon.png'}
                          alt={stock.title}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-themeTeal">
                          {stock.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {stock.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {stock.price_per_share}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {stock.valuation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      stock.percentage_change.startsWith('+') ? 'text-themeSkyBlue' : 'text-red-600'
                    }`}>
                      {stock.percentage_change}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {canManageStocks ? (
                      <>
                        <button
                          onClick={() => handleEditStock(stock)}
                          className="text-themeTeal hover:text-themeTealLight mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(stock.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-themeTealLighter text-xs">View Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-themeTeal">Edit Stock</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Company Name</label>
                <input
                  type="text"
                  value={editFormData.company_name || ''}
                  onChange={(e) => setEditFormData({...editFormData, company_name: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Price Per Share</label>
                <input
                  type="text"
                  value={editFormData.price_per_share || ''}
                  onChange={(e) => setEditFormData({...editFormData, price_per_share: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Valuation</label>
                <input
                  type="text"
                  value={editFormData.valuation || ''}
                  onChange={(e) => setEditFormData({...editFormData, valuation: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Price Change</label>
                <input
                  type="text"
                  value={editFormData.price_change || ''}
                  onChange={(e) => setEditFormData({...editFormData, price_change: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Percentage Change</label>
                <input
                  type="text"
                  value={editFormData.percentage_change || ''}
                  onChange={(e) => setEditFormData({...editFormData, percentage_change: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Icon</label>
                <div className="flex items-center space-x-4">
                  {editingStock?.icon && (
                    <div className="flex-shrink-0">
                      <Image
                        src={editingStock.icon}
                        alt="Current icon"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditIconFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-md focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  />
                </div>
                <p className="text-xs text-themeTealLighter mt-1">
                  {editIconFile ? `Selected: ${editIconFile.name}` : 'Select a new icon (optional)'}
                </p>
              </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingStock(null);
                  setEditFormData({});
                  setEditIconFile(null);
                }}
                className="px-4 py-2 text-sm font-medium text-themeTealLighter bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={editLoading}
                className="px-4 py-2 text-sm font-medium text-themeTealWhite bg-themeTeal rounded-md hover:bg-themeTealLight disabled:opacity-50"
              >
                {editLoading ? 'Updating...' : 'Update Stock'}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;
