'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Eye, Calendar, RefreshCw } from 'lucide-react';
import { NotificationContainer, NotificationData, SortableHeader, createSortHandler } from '@/components/admin/shared';

interface UserPortfolio {
  id: number;
  user_id: number;
  total_investment: number | string;
  holding_number: number;
  price_change: number | string;
  percentage_change: number | string;
  portfolio_performance_score: number | string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PortfolioStats {
  total_portfolios: number;
  avg_investment: number;
  total_market_investment: number;
  avg_holdings: number;
  avg_performance_score: number;
  profitable_portfolios: number;
  loss_portfolios: number;
  avg_percentage_change: number;
  max_investment: number;
  min_investment: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function UserPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [sortBy, setSortBy] = useState('total_investment');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);

  // Refs to store current values to avoid dependency issues
  const searchRef = useRef(search);
  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);

  // Update refs when values change
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

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

  // Sort handler using the utility function
  const handleSort = createSortHandler(setSortBy, setSortOrder);

  const fetchPortfolios = useCallback(async (page: number = 1, showLoading: boolean = true) => {
    try {
      if (showLoading && sortByRef.current === 'total_investment' && sortOrderRef.current === 'desc') setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchRef.current,
        sort_by: sortByRef.current,
        sort_order: sortByRef.current.toUpperCase()
      });

      const response = await fetch(`/api/admin/user-portfolios?${params.toString()}`, {
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPortfolios(data.data.portfolios || data.data);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      } else {
        console.error('Error fetching user portfolios:', data.message);
        const id = Date.now().toString();
        setNotifications(prev => [...prev, { 
          id, 
          type: 'error', 
          title: 'Error', 
          message: data.message || 'Failed to fetch user portfolios', 
          duration: 5000 
        }]);
      }
    } catch (error) {
      console.error('Error fetching user portfolios:', error);
      const id = Date.now().toString();
      setNotifications(prev => [...prev, { 
        id, 
        type: 'error', 
        title: 'Error', 
        message: 'Failed to fetch user portfolios', 
        duration: 5000 
      }]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/user-portfolios-stats', {
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
    }
  }, []);

  const refreshAllPortfolios = async () => {
    setRefreshing(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/user-portfolios/refresh-all', {
        method: 'POST',
        headers: {
          'token': token,
        },
      });

      const data = await response.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'All portfolios refreshed successfully',
          duration: 5000
        });
        fetchPortfolios(pagination.currentPage, false);
        fetchStats();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to refresh portfolios',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error refreshing portfolios:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to refresh portfolios',
        duration: 5000
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    fetchPortfolios();
    fetchStats();
  }, [fetchPortfolios, fetchStats]);

  // Sorting effect
  useEffect(() => {
    if (sortBy !== 'total_investment' || sortOrder !== 'desc') {
      fetchPortfolios(1, false);
    }
  }, [sortBy, sortOrder, fetchPortfolios]);

  // Debounced search effect
  useEffect(() => {
    if (search) {
      setIsSearching(true);
    }
    
    const timeoutId = setTimeout(() => {
      fetchPortfolios(1, false);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [search, fetchPortfolios]);

  const handlePageChange = (page: number) => {
    fetchPortfolios(page);
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatPercentage = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceBadge = (score: number | string) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 90) {
      return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Outstanding</span>;
    } else if (numScore >= 80) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Excellent</span>;
    } else if (numScore >= 60) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Good</span>;
    } else if (numScore >= 40) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Average</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Below Average</span>;
    }
  };

  const getChangeBadge = (change: number | string) => {
    const numChange = typeof change === 'string' ? parseFloat(change) : change;
    if (numChange > 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">+{formatCurrency(numChange)}</span>;
    } else if (numChange < 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">{formatCurrency(numChange)}</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">No Change</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4" />
          <p className="text-themeTeal text-sm">Loading user portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-themeTeal">User Portfolios</h1>
        <p className="text-sm text-themeTealLight">View and manage user investment portfolios and performance.</p>
      </div>


      {/* Search and Actions */}
      <div className="flex justify-between flex-col md:flex-row gap-4 md:items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-themeTeal/10 px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-themeTeal">
              All portfolios <span className="bg-themeTeal text-white px-2 py-0.5 rounded-full text-xs ml-1">{stats?.total_portfolios || 0}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshAllPortfolios}
            disabled={refreshing}
            className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh All'}
          </button>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email"
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
          </div>
        </div>
      </div>

      {/* Portfolios Table */}
      <div className="w-100 md:w-full overflow-hidden">
        <div className="bg-white rounded border border-themeTealLighter">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-themeTeal border-b border-themeTealLighter">
                <tr>
                  <SortableHeader
                    field="user.first_name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  >
                    User
                  </SortableHeader>
                  <SortableHeader
                    field="total_investment"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  >
                    Total Investment
                  </SortableHeader>
                  <SortableHeader
                    field="holding_number"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  >
                    Holdings
                  </SortableHeader>
                  <SortableHeader
                    field="price_change"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  >
                    Price Change
                  </SortableHeader>
                  <SortableHeader
                    field="percentage_change"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  >
                    % Change
                  </SortableHeader>
                  <SortableHeader
                    field="portfolio_performance_score"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  >
                    Performance Score
                  </SortableHeader>
                  <SortableHeader
                    field="created_at"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  >
                    Last Updated
                  </SortableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-themeTealLighter">
                {portfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-themeTeal flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-themeTealWhite">
                            {portfolio.user.first_name?.[0] || portfolio.user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-themeTeal">
                            {portfolio.user.first_name} {portfolio.user.last_name}
                          </div>
                          <div className="text-xs text-themeTealLighter truncate">{portfolio.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal font-medium">
                      {portfolio.total_investment === 0 || portfolio.total_investment === '0' ? (
                        <span className="text-gray-500 italic">No Investment</span>
                      ) : (
                        formatCurrency(portfolio.total_investment)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                      {portfolio.holding_number === 0 ? (
                        <span className="text-gray-500 italic">No Holdings</span>
                      ) : (
                        portfolio.holding_number
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {portfolio.holding_number === 0 ? (
                        <span className="text-gray-500 italic">No Change</span>
                      ) : (
                        getChangeBadge(portfolio.price_change)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {portfolio.holding_number === 0 ? (
                        <span className="text-gray-500 italic">No Change</span>
                      ) : (
                        <span className={`font-medium ${Number(portfolio.percentage_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(portfolio.percentage_change)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {portfolio.holding_number === 0 ? (
                        <span className="text-gray-500 italic">No Score</span>
                      ) : (
                        getPerformanceBadge(portfolio.portfolio_performance_score)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                      {formatDate(portfolio.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-themeTeal border-themeTeal text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
