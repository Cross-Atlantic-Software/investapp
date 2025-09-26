'use client';

import { ChartColumnStacked, ShieldCheck, TrendingDown, TrendingUp, Users, UserStar } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

interface AdminStatsProps {
  stats?: {
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
  };
  loading?: boolean;
}

const AdminStats: React.FC<AdminStatsProps> = ({ 
  stats = {
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
  },
  loading = false 
}) => {
  const router = useRouter();

  const statCards = [
    {
      title: 'Total Admin Users',
      value: stats.totalUsers,
      change: `${stats.totalUsersChange >= 0 ? '+' : ''}${stats.totalUsersChange.toFixed(1)}%`,
      changeType: stats.totalUsersChange >= 0 ? 'increase' : 'decrease',
      redirectPath: '/admin/users',
      icon: (
        <Users />
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
    {
      title: 'Total Site Users',
      value: stats.totalSiteUsers,
      change: `${stats.totalSiteUsersChange >= 0 ? '+' : ''}${stats.totalSiteUsersChange.toFixed(1)}%`,
      changeType: stats.totalSiteUsersChange >= 0 ? 'increase' : 'decrease',
      redirectPath: '/admin/site-users',
      icon: (
        <UserStar/>
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
    {
      title: 'Total Stocks',
      value: stats.totalStocks,
      change: `${stats.totalStocksChange >= 0 ? '+' : ''}${stats.totalStocksChange.toFixed(1)}%`,
      changeType: stats.totalStocksChange >= 0 ? 'increase' : 'decrease',
      redirectPath: '/admin/stocks',
      icon: (
        <ChartColumnStacked/>
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
    {
      title: 'Verified Site Users',
      value: stats.verifiedSiteUsers,
      change: `${stats.verifiedSiteUsersChange >= 0 ? '+' : ''}${stats.verifiedSiteUsersChange.toFixed(1)}%`,
      changeType: stats.verifiedSiteUsersChange >= 0 ? 'increase' : 'decrease',
      redirectPath: '/admin/site-users',
      icon: (
        <ShieldCheck/>
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
    // {
    //   title: 'Total Enquiries',
    //   value: stats.totalEnquiries,
    //   change: `${stats.totalEnquiriesChange >= 0 ? '+' : ''}${stats.totalEnquiriesChange.toFixed(1)}%`,
    //   changeType: stats.totalEnquiriesChange >= 0 ? 'increase' : 'decrease',
    //   redirectPath: '/admin/enquiries',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    //     </svg>
    //   ),
    //   gradient: 'from-themeTeal to-themeTeal',
    //   bgColor: 'bg-themeTeal',
    // },
    // {
    //   title: 'Newsletter Subscribers',
    //   value: stats.totalSubscribers,
    //   change: `${stats.totalSubscribersChange >= 0 ? '+' : ''}${stats.totalSubscribersChange.toFixed(1)}%`,
    //   changeType: stats.totalSubscribersChange >= 0 ? 'increase' : 'decrease',
    //   redirectPath: '/admin/subscribers',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    //     </svg>
    //   ),
    //   gradient: 'from-themeTeal to-themeTeal',
    //   bgColor: 'bg-themeTeal',
    // },
    // {
    //   title: 'New Registrations (24h)',
    //   value: stats.newRegistrations24h,
    //   change: '+15.3%',
    //   changeType: 'increase',
    //   redirectPath: '/admin/site-users',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    //     </svg>
    //   ),
    //   gradient: 'from-themeTeal to-themeTeal',
    //   bgColor: 'bg-themeTeal',
    // },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleCardClick = (redirectPath: string) => {
    router.push(redirectPath);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          onClick={() => handleCardClick(stat.redirectPath)}
          className="bg-white rounded-xl shadow-lg shadow-themeTeal/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-themeTealLight mb-1">{stat.title}</h3>
              <div className="text-3xl font-bold text-themeTeal mb-2">{stat.value}</div>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-themeTealLighter">
                  {stat.changeType === 'increase' ? 'increased' : 'decreased'}
                </span>
                {stat.changeType === 'increase' ? (
                  <TrendingUp width={20} height={20} className='text-green-600'/>
                ) : (
                  <TrendingDown width={20} height={20} className='text-red-600'/>
                )}
              </div>
            </div>
            <div className={`p-3 rounded bg-gradient-to-r ${stat.gradient} text-white shadow-lg shadow-themeTeal/10`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStats;