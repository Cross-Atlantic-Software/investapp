'use client';

import React from 'react';

const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-themeTealLighter">
      <div className="flex items-center justify-between h-16 px-6 ml-64">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-themeTeal font-serif">
            Admin Panel
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-themeTealLighter">
            Last updated: {new Date().toLocaleString()}
          </div>
          <div className="w-8 h-8 bg-themeTeal rounded-full flex items-center justify-center">
            <span className="text-themeTealWhite text-sm font-medium">A</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
