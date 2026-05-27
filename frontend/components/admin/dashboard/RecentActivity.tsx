'use client';

import React, { useState, useEffect } from 'react';

interface Activity {
  id: number;
  type: 'user_registration' | 'stock_created' | 'stock_updated' | 'user_login';
  description: string;
  timestamp: string;
  user?: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockActivities: Activity[] = [
      {
        id: 1,
        type: 'user_registration',
        description: 'New user registered',
        timestamp: new Date().toISOString(),
        user: 'john@example.com'
      },
      {
        id: 2,
        type: 'stock_created',
        description: 'New stock added',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'admin'
      },
      {
        id: 3,
        type: 'user_login',
        description: 'User logged in',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: 'jane@example.com'
      },
      {
        id: 4,
        type: 'stock_updated',
        description: 'Stock information updated',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        user: 'admin'
      },
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return '👤';
      case 'stock_created':
        return '📈';
      case 'stock_updated':
        return '✏️';
      case 'user_login':
        return '🔑';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-green-100 text-green-800';
      case 'stock_created':
        return 'bg-blue-100 text-blue-800';
      case 'stock_updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'user_login':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-themeTeal mb-4">Recent Activity</h3>
        <div className="text-center py-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-themeTealLighter">
        <h3 className="text-lg font-medium text-themeTeal">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-themeTeal">
                    {activity.description}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(activity.type)}`}>
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-themeTealLighter">
                  <span>{activity.user && `by ${activity.user}`}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
