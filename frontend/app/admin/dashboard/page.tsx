'use client';

import React, { useState, useEffect } from 'react';
import AdminStats from '../../../components/admin/AdminStats';
import Loader from '../../../components/admin/Loader';

interface DashboardStats {
  totalUsers: number;
  totalStocks: number;
  totalRevenue: number;
  activeUsers: number;
  totalSiteUsers: number;
  verifiedSiteUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStocks: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalSiteUsers: 0,
    verifiedSiteUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Fetch user stats
      const usersResponse = await fetch('/api/admin/users/stats', {
        headers: {
          'token': token,
        },
      });
      const usersData = await usersResponse.json();
      
      // Fetch stock stats
      const stocksResponse = await fetch('/api/admin/stocks/stats', {
        headers: {
          'token': token,
        },
      });
      const stocksData = await stocksResponse.json();

      // Fetch site users stats
      const siteUsersResponse = await fetch('/api/admin/site-users/stats', {
        headers: {
          'token': token,
        },
      });
      const siteUsersData = await siteUsersResponse.json();

      if (usersData.success && stocksData.success) {
        setStats({
          totalUsers: usersData.data.totalUsers || 0,
          totalStocks: stocksData.data.totalStocks || 0,
          totalRevenue: stocksData.data.totalValuation ? parseFloat(stocksData.data.totalValuation.replace('$', '').replace('T', '')) * 1000 : 0,
          activeUsers: usersData.data.activeUsers || 0,
          totalSiteUsers: siteUsersData.success ? siteUsersData.data.totalUsers || 0 : 0,
          verifiedSiteUsers: siteUsersData.success ? siteUsersData.data.verifiedUsers || 0 : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden relative min-h-[60vh]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-themeTeal">Dashboard overview</h1>
        <p className="text-sm text-themeTealLight">Monitor your platform&apos;s key metrics and performance here.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader text="Loading dashboard data..." />
        </div>
      ) : (
        <AdminStats stats={stats} loading={false} />
      )}
    </div>
  );
}
