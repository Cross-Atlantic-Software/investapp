'use client';

import React, { useState, useEffect } from 'react';
import { AdminStats } from '@/components/admin/dashboard';
import { Loader } from '@/components/admin/shared';

interface DashboardStats {
  totalUsers: number;
  totalStocks: number;
  totalRevenue: number;
  activeUsers: number;
  totalSiteUsers: number;
  verifiedSiteUsers: number;
  totalEnquiries: number;
  totalSubscribers: number;
  newRegistrations24h: number;
  // Percentage changes
  totalUsersChange: number;
  totalStocksChange: number;
  totalSiteUsersChange: number;
  verifiedSiteUsersChange: number;
  totalEnquiriesChange: number;
  totalSubscribersChange: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStocks: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalSiteUsers: 0,
    verifiedSiteUsers: 0,
    totalEnquiries: 0,
    totalSubscribers: 0,
    newRegistrations24h: 0,
    // Percentage changes
    totalUsersChange: 0,
    totalStocksChange: 0,
    totalSiteUsersChange: 0,
    verifiedSiteUsersChange: 0,
    totalEnquiriesChange: 0,
    totalSubscribersChange: 0,
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

      // Fetch enquiries stats
      const enquiriesResponse = await fetch('/api/admin/enquiries/stats', {
        headers: {
          'token': token,
        },
      });
      const enquiriesData = await enquiriesResponse.json();

      // Fetch subscribers stats
      const subscribersResponse = await fetch('/api/admin/subscribers/stats', {
        headers: {
          'token': token,
        },
      });
      const subscribersData = await subscribersResponse.json();

      // Fetch new registrations in last 24h
      const newRegistrationsResponse = await fetch('/api/admin/site-users/stats?period=24h', {
        headers: {
          'token': token,
        },
      });
      const newRegistrationsData = await newRegistrationsResponse.json();

      if (usersData.success && stocksData.success) {
        setStats({
          totalUsers: usersData.data.totalUsers || 0,
          totalStocks: stocksData.data.totalStocks || 0,
          totalRevenue: stocksData.data.totalValuation ? parseFloat(stocksData.data.totalValuation.replace('$', '').replace('T', '')) * 1000 : 0,
          activeUsers: usersData.data.activeUsers || 0,
          totalSiteUsers: siteUsersData.success ? siteUsersData.data.totalUsers || 0 : 0,
          verifiedSiteUsers: siteUsersData.success ? siteUsersData.data.verifiedUsers || 0 : 0,
          totalEnquiries: enquiriesData.success ? enquiriesData.data.total || 0 : 0,
          totalSubscribers: subscribersData.success ? subscribersData.data.totalSubscribers || 0 : 0,
          newRegistrations24h: newRegistrationsData.success ? newRegistrationsData.data.newRegistrations24h || 0 : 0,
          // Percentage changes
          totalUsersChange: usersData.data.totalUsersChange || 0,
          totalStocksChange: stocksData.data.totalStocksChange || 0,
          totalSiteUsersChange: siteUsersData.success ? siteUsersData.data.totalUsersChange || 0 : 0,
          verifiedSiteUsersChange: siteUsersData.success ? siteUsersData.data.verifiedUsersChange || 0 : 0,
          totalEnquiriesChange: enquiriesData.success ? enquiriesData.data.totalChange || 0 : 0,
          totalSubscribersChange: subscribersData.success ? subscribersData.data.totalSubscribersChange || 0 : 0,
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
