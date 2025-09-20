'use client';

import React, { useState, useEffect } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalStocks: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStocks: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      // Fetch user stats
      const usersResponse = await fetch('http://localhost:8888/api/admin/users/stats', {
        headers: {
          'token': token,
        },
      });
      const usersData = await usersResponse.json();
      
      // Fetch stock stats
      const stocksResponse = await fetch('http://localhost:8888/api/admin/stocks/stats', {
        headers: {
          'token': token,
        },
      });
      const stocksData = await stocksResponse.json();

      if (usersData.success && stocksData.success) {
        setStats({
          totalUsers: usersData.data.totalUsers || 0,
          totalStocks: stocksData.data.totalStocks || 0,
          totalRevenue: stocksData.data.totalValuation ? parseFloat(stocksData.data.totalValuation.replace('$', '').replace('T', '')) * 1000 : 0,
          activeUsers: usersData.data.activeUsers || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-themeTealWhite min-h-screen flex items-center justify-center">
        <div className="text-lg text-themeTeal">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-themeTealWhite min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-themeTeal mb-2 font-serif">
          Our Stats
        </h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-themeTealLighter p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-themeTealLight mb-1">Total Users</p>
              <p className="text-3xl font-bold text-themeTeal">{stats.totalUsers}</p>
              <p className="text-sm text-themeSkyBlue flex items-center mt-1">
                <span className="mr-1">↗</span>
                <span>2.59%</span>
                <span className="text-themeTealLighter ml-1">increased</span>
              </p>
            </div>
            <div className="p-3 bg-themeTealWhite rounded-lg">
              <svg className="w-6 h-6 text-themeTeal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-themeTealLighter p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-themeTealLight mb-1">Total Valuation</p>
              <p className="text-3xl font-bold text-themeTeal">${stats.totalRevenue}T</p>
              <p className="text-sm text-themeSkyBlue flex items-center mt-1">
                <span className="mr-1">↗</span>
                <span>4.35%</span>
                <span className="text-themeTealLighter ml-1">increased</span>
              </p>
            </div>
            <div className="p-3 bg-themeTealWhite rounded-lg">
              <svg className="w-6 h-6 text-themeTeal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-themeTealLighter p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-themeTealLight mb-1">Total Stocks</p>
              <p className="text-3xl font-bold text-themeTeal">{stats.totalStocks}</p>
              <p className="text-sm text-themeSkyBlue flex items-center mt-1">
                <span className="mr-1">↗</span>
                <span>2.59%</span>
                <span className="text-themeTealLighter ml-1">increased</span>
              </p>
            </div>
            <div className="p-3 bg-themeTealWhite rounded-lg">
              <svg className="w-6 h-6 text-themeTeal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-themeTealLighter p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-themeTealLight mb-1">Active Users</p>
              <p className="text-3xl font-bold text-themeTeal">{stats.activeUsers}</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <span className="mr-1">↘</span>
                <span>0.95%</span>
                <span className="text-themeTealLighter ml-1">decreased</span>
              </p>
            </div>
            <div className="p-3 bg-themeTealWhite rounded-lg">
              <svg className="w-6 h-6 text-themeTeal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}