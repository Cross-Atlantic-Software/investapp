'use client';

import { ChartColumnStacked, ShieldCheck, TrendingDown, TrendingUp, Users, UserStar } from 'lucide-react';
import React from 'react';

interface AdminStatsProps {
  stats?: {
    totalUsers: number;
    totalStocks: number;
    totalRevenue: number;
    activeUsers: number;
    totalSiteUsers: number;
    verifiedSiteUsers: number;
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
  },
  loading = false 
}) => {

  const statCards = [
    {
      title: 'Total Admin Users',
      value: stats.totalUsers,
      change: '+2.59%',
      changeType: 'increase',
      icon: (
        <Users />
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
    {
      title: 'Total Site Users',
      value: stats.totalSiteUsers,
      change: '+5.2%',
      changeType: 'increase',
      icon: (
        <UserStar/>
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
    {
      title: 'Total Stocks',
      value: stats.totalStocks,
      change: '+2.59%',
      changeType: 'increase',
      icon: (
        <ChartColumnStacked/>
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
    {
      title: 'Verified Site Users',
      value: stats.verifiedSiteUsers,
      change: '+3.1%',  
      changeType: 'increase',
      icon: (
        <ShieldCheck/>
      ),
      gradient: 'from-themeTeal to-themeTeal',
      bgColor: 'bg-themeTeal',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded shadow-sm shadow-themeTeal/10 p-6 animate-pulse">
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded shadow-sm p-6 hover:shadow-xl shadow-themeTeal/10 transition duration-300 hover:-translate-y-1">
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
