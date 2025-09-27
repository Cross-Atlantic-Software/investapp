'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import StockTable from '@/components/admin/stocks/StockTable';
import AddStockModal from '@/components/admin/stocks/AddStockModal';
import Loader from '@/components/admin/shared/Loader';
import { NotificationContainer, NotificationData } from '@/components/admin/shared/Notification';
import { Plus, Search } from 'lucide-react';
import { 
  StockMasterModal,
  StockMasterItem,
  NewStockMasterForm
} from '@/components/admin/stock-master';

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [stockMasters, setStockMasters] = useState<StockMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockMasterModal, setShowStockMasterModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newStockMaster, setNewStockMaster] = useState<NewStockMasterForm>({
    name: ''
  });
  
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

  const fetchStockMasters = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stock-masters/select');
      const data = await response.json();

      console.log('Stock Masters API Response:', data);

      if (data.success) {
        console.log('Stock Masters Data:', data.data.stockMasters);
        setStockMasters(data.data.stockMasters);
      }
    } catch (error) {
      console.error('Error fetching stock masters:', error);
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    fetchStocks();
    fetchStockMasters();
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
    founded: number;
    sector: string;
    subsector: string;
    headquarters: string;
    stock_master_ids: number[];
    icon: File | null;
  }) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const formData = new FormData();
      
      // Append all stock data to formData
      formData.append('title', stockData.title);
      formData.append('company_name', stockData.company_name);
      formData.append('logo', stockData.logo);
      formData.append('price_per_share', stockData.price_per_share.toString());
      formData.append('price_change', stockData.price_change.toString());
      formData.append('teaser', stockData.teaser);
      formData.append('short_description', stockData.short_description);
      formData.append('analysis', stockData.analysis);
      formData.append('demand', stockData.demand);
      formData.append('homeDisplay', stockData.homeDisplay);
      formData.append('bannerDisplay', stockData.bannerDisplay);
      formData.append('valuation', stockData.valuation);
      formData.append('price_per_share', stockData.price_per_share.toString());
      formData.append('percentage_change', stockData.percentage_change.toString());
      formData.append('founded', stockData.founded.toString());
      formData.append('sector', stockData.sector);
      formData.append('subsector', stockData.subsector);
      formData.append('headquarters', stockData.headquarters);
      formData.append('stock_master_ids', JSON.stringify(stockData.stock_master_ids));
      
      // Add logo file if selected
      if (stockData.icon) {
        formData.append('logo', stockData.icon);
      }

      const response = await fetch('/api/admin/stocks', {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.status === true || data.success === true) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock created successfully!',
          duration: 5000
        });
        setShowAddModal(false);
        fetchStocks(); // Refresh the list
      } else {
        // Handle both old and new error formats
        const errorMessage = data.error?.message || data.message || 'Failed to create stock';
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: errorMessage,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Error creating stock',
        duration: 5000
      });
    }
  };

  const handleCreateStockMaster = async (data: NewStockMasterForm) => {
    try {
      const response = await fetch('/api/admin/stock-masters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === true || result.success === true) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock master created successfully!',
          duration: 5000
        });
        setNewStockMaster({ name: '' });
        fetchStockMasters();
      } else {
        // Handle both old and new error formats
        const errorMessage = result.error?.message || result.message || 'Failed to create stock master';
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: errorMessage,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating stock master:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Error creating stock master',
        duration: 5000
      });
    }
  };

  const handleDeleteStockMaster = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/stock-masters/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Stock master deleted successfully!',
          duration: 5000
        });
        fetchStockMasters();
      } else {
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: data.message || 'Failed to delete stock master',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting stock master:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Error deleting stock master',
        duration: 5000
      });
    }
  };

  // Check if current user can create stocks (only Admin and SuperAdmin)
  const canCreateStocks = currentUserRole === 10 || currentUserRole === 11;

  return (
    <div className="space-y-6 relative overflow-hidden">
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
          <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
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
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition duration-300 text-themeTeal placeholder:text-themeTealLighter"
                />
                {isSearching ? (
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-themeTeal animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-themeTealLighter"/>
                )}
                
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 h-4 w-4 text-themeTealLight hover:text-themeTealLighter"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowStockMasterModal(true)}
                className="bg-themeTealLighter text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeTeal hover:text-white transition duration-300 flex items-center cursor-pointer"
              >
                <Plus width={16} height={16} className='mr-1'/>
                Manage Stock Masters
              </button>
              {canCreateStocks && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-themeTeal text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeSkyBlue transition duration-300 flex items-center cursor-pointer"
                >
                  <Plus width={16} height={16} className='mr-1'/>
                  Add stock
                </button>
              )}
            </div>
          </div>
          
          <div className="w-100 md:w-full overflow-hidden">
          <StockTable 
            stocks={stocks} 
            onRefresh={fetchStocks} 
            onSort={handleSort} 
            sortBy={sortBy} 
            sortOrder={sortOrder}
            onNotification={(type, title, message) => addNotification({ type, title, message, duration: 5000 })}
            stockMasters={stockMasters}
          />
          </div>
        </>
      )}
      
      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          stockMasters={stockMasters}
          onSubmit={(stockData) => {
            const adaptedData = {
              title: stockData.title,
              company_name: stockData.company_name,
              logo: stockData.logo,
              price_change: stockData.price_change,
              teaser: stockData.teaser,
              short_description: stockData.short_description,
              analysis: stockData.analysis,
              demand: stockData.demand,
              homeDisplay: stockData.homeDisplay,
              bannerDisplay: stockData.bannerDisplay,
              valuation: stockData.valuation,
              price_per_share: stockData.price_per_share,
              percentage_change: stockData.percentage_change,
              founded: stockData.founded,
              sector: stockData.sector,
              subsector: stockData.subsector,
              headquarters: stockData.headquarters,
              stock_master_ids: stockData.stock_master_ids,
              icon: stockData.icon
            };
            handleAddStock(adaptedData);
            addNotification({
              type: 'success',
              title: 'Stock Added',
              message: 'Stock has been added successfully!',
              duration: 5000
            });
          }}
        />
      )}

      <StockMasterModal
        isOpen={showStockMasterModal}
        onClose={() => setShowStockMasterModal(false)}
        stockMasters={stockMasters}
        onCreateStockMaster={handleCreateStockMaster}
        onDeleteStockMaster={handleDeleteStockMaster}
        newStockMaster={newStockMaster}
        setNewStockMaster={setNewStockMaster}
      />

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}