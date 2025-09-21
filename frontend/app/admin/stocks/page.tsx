'use client';

import React, { useState, useEffect } from 'react';
import StockTable from '@/components/admin/StockTable';
import AddStockModal from '@/components/admin/AddStockModal';
import Loader from '@/components/admin/Loader';
import { NotificationContainer, NotificationData } from '@/components/admin/Notification';

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  useEffect(() => {
    fetchStocks();
    getCurrentUserRole();
  }, []);

  const getCurrentUserRole = () => {
    try {
      const storedUser = sessionStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUserRole(user.role);
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
  };

  const fetchStocks = async (searchQuery = '', showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder.toUpperCase());
      
      const url = `http://localhost:8888/api/admin/stocks?${params.toString()}`;
        
      const response = await fetch(url, {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStocks(data.data.stocks);
      } else {
        console.error('Error fetching stocks:', data.message);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStocks(searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchStocks();
  };

  // Debounced search effect - faster and more responsive, no loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStocks(searchTerm, false); // No loading state for dynamic search
    }, 300); // Reduced to 300ms for faster response

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    fetchStocks(searchTerm);
  };

  const handleAddStock = async (stockData: any) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const formData = new FormData();
      
      // Append all stock data to formData
      Object.keys(stockData).forEach(key => {
        if (key === 'icon' && stockData[key]) {
          formData.append(key, stockData[key]);
        } else if (stockData[key] !== null && stockData[key] !== undefined) {
          formData.append(key, stockData[key]);
        }
      });

      const response = await fetch('http://localhost:8888/api/admin/stocks', {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchStocks(); // Refresh the list
      } else {
        alert(data.message || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error adding stock');
    }
  };

  // Check if current user can create stocks (only Admin and SuperAdmin)
  const canCreateStocks = currentUserRole === 10 || currentUserRole === 11;

  return (
    <div className="space-y-6 relative">
      {loading && <Loader fullScreen text="Loading stocks..." />}
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-themeTeal">Stock management</h1>
        <p className="text-sm text-themeTealLight">Manage your investment stocks and companies here.</p>
      </div>

      {/* Search Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-themeTeal">
              All stocks <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{stocks.length}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by stock name"
              className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {canCreateStocks && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-themeTeal text-white px-4 py-2 text-sm rounded-lg hover:bg-themeTealLight transition-colors duration-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add stock
            </button>
          )}
        </div>
      </div>

      <StockTable 
        stocks={stocks} 
        onRefresh={fetchStocks} 
        onSort={handleSort} 
        sortBy={sortBy} 
        sortOrder={sortOrder}
        onNotification={(type, title, message) => addNotification({ type, title, message, duration: 5000 })}
      />
      
      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(stockData) => {
            handleAddStock(stockData);
            addNotification({
              type: 'success',
              title: 'Stock Added',
              message: 'Stock has been added successfully!',
              duration: 5000
            });
          }}
        />
      )}

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
