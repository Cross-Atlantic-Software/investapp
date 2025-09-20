'use client';

import React, { useState, useEffect } from 'react';
import StockTable from '@/components/admin/StockTable';
import AddStockModal from '@/components/admin/AddStockModal';

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null);

  useEffect(() => {
    fetchStocks();
    getCurrentUserRole();
  }, []);

  const getCurrentUserRole = () => {
    try {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUserRole(user.role);
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
  };

  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch('http://localhost:8888/api/admin/stocks', {
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
      setLoading(false);
    }
  };

  const handleAddStock = async (stockData: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const formData = new FormData();
      
      // Append all stock data to formData
      Object.keys(stockData).forEach(key => {
        if (key === 'icon' && stockData[key]) {
          formData.append(key, stockData[key]);
        } else if (stockData[key] !== null && stockData[key] !== undefined) {
          formData.append(key, stockData[key]);
        }
      });

      const response = await fetch('http://localhost:8888/api/admin/stocks', {
        method: 'POST',
        headers: {
          'token': token,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchStocks(); // Refresh the list
      } else {
        alert(data.message || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error adding stock');
    }
  };

  // Check if current user can create stocks (only Admin and SuperAdmin)
  const canCreateStocks = currentUserRole === 10 || currentUserRole === 11;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-themeTeal">Loading stocks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-themeTeal font-serif">Stock Management</h1>
          <p className="text-themeTealLight">Manage investment stocks and companies</p>
        </div>
        {canCreateStocks && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-themeTeal text-themeTealWhite px-4 py-2 rounded-md hover:bg-themeTealLight transition-colors duration-200"
          >
            Add New Stock
          </button>
        )}
      </div>

      <StockTable stocks={stocks} onRefresh={fetchStocks} />
      
      {showAddModal && (
        <AddStockModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStock}
        />
      )}
    </div>
  );
}
