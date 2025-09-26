"use client";

import React from 'react';
import PrivateMarketNews from './privateMarketNews';

interface NewsAndActivityProps {
  newsLimit?: number;
  activityLimit?: number;
}

export default function NewsAndActivity({ newsLimit = 3, activityLimit = 3 }: NewsAndActivityProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Private Market News */}
      <div>
        <PrivateMarketNews limit={newsLimit} showTitle={true} />
      </div>
      
    </div>
  );
}
