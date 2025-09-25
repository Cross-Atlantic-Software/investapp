'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import { StockTable, AddStockModal } from '@/components/admin/stocks';
import { Loader, NotificationContainer, NotificationData } from '@/components/admin/shared';

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs to store current values to avoid circular dependencies
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  
  // Update refs when values change
  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);
  
  useEffect(() => {
    sortOrderRef.current = sortOrder;
  }, [sortOrder]);
  
  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

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

  const fetchStocks = useCallback(async (searchQuery = '', showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setIsInitialLoad(true);
      }
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort_by', sortByRef.current);
      params.append('sort_order', sortOrderRef.current.toUpperCase());
      

      const url = `/api/admin/stocks?${params.toString()}`;

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
      if (showLoading) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, []); // No dependencies to prevent recreation

  // Separate search function that never touches loading states
  const searchStocks = useCallback(async (searchQuery: string) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sort_by', sortByRef.current);
      params.append('sort_order', sortOrderRef.current.toUpperCase());
      
      const url = `/api/admin/stocks?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'token': token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStocks(data.data.stocks);
      } else {
        console.error('Error searching stocks:', data.message);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    fetchStocks();
    getCurrentUserRole();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchStocks();
  };

  // Debounced search effect - faster and more responsive, no loading state
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
    }
    
    const timeoutId = setTimeout(() => {
      searchStocks(searchTerm); // Use dedicated search function that never touches loading states
      setIsSearching(false);
    }, 300); // Reduced to 300ms for faster response

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchTerm, searchStocks]); // Include searchStocks in dependencies

  // Separate effect for sorting changes
  useEffect(() => {
    if (searchTerm) {
      searchStocks(searchTerm);
    } else {
      fetchStocks('', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, searchTerm, searchStocks]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    // The useEffect will handle the API call when sortBy or sortOrder changes
  };

  const handleAddStock = async (stockData: {
    title: string;
    company_name: string;
    price_per_share: string;
    valuation: string;
    price_change: string;
    icon: File | null;
  }) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const formData = new FormData();
      
      // Map frontend fields to backend fields
      const fieldMapping: Record<string, string> = {
        'company_name': 'company_name',
        'price_per_share': 'price',
        'price_change': 'price_change',
        'icon': 'logo'
      };

      // Append mapped stock data to formData
      Object.keys(stockData).forEach(key => {
        const value = (stockData as Record<string, unknown>)[key];
        const backendField = fieldMapping[key] || key;
        
        if (key === 'icon' && value instanceof File) {
          formData.append(backendField, value);
        } else if (value !== null && value !== undefined && typeof value === 'string') {
          formData.append(backendField, value);
        }
      });

      // Add required fields that are missing from the form
      formData.append('teaser', stockData.title || 'Stock teaser');
      formData.append('short_description', `Short description for ${stockData.company_name}`);
      formData.append('analysis', `Analysis for ${stockData.company_name} stock`);

      const response = await fetch('/api/admin/stocks', {
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
      {loading && isInitialLoad ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" text="Loading stocks..." />
        </div>
      ) : (
        <>
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
                {isSearching ? (
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-themeTeal animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
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
        </>
      )}
      
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
