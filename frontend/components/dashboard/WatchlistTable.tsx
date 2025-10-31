"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, X, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TradeTabs from "@/components/shares/buySell";

interface WishlistItem {
  id: number;
  user_id: number;
  stock_id: number;
  created_at: string;
  stock: {
    id: number;
    company_name: string;
    price_per_share: number;
    logo: string;
    price_change?: number;
    percentage_change?: number;
    min_units?: number | null;
    lot_size?: number | null;
  };
}

export default function WatchlistTable() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<WishlistItem | null>(null);
  const router = useRouter();

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      const response = await fetch('/api/wishlist/my-wishlist', {
        headers: {
          'token': token,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setWishlistItems(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number | string | undefined) => {
    if (value === undefined) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  const getChangeIcon = (value: number | string | undefined) => {
    if (value === undefined) return null;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = (value: number | string | undefined) => {
    if (value === undefined) return 'text-gray-500';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleBuy = (item: WishlistItem) => {
    setSelectedStock(item);
    setIsModalOpen(true);
  };

  const handleCompanyClick = (item: WishlistItem) => {
    router.push(`/unlisted-company-name/${encodeURIComponent(item.stock.company_name)}`);
  };

  const handleRemove = async (stockId: number) => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      const response = await fetch(`/api/wishlist/remove/${stockId}`, {
        method: 'DELETE',
        headers: {
          'token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Remove from local state
          setWishlistItems(prev => prev.filter(item => item.stock_id !== stockId));
        }
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  const handleBuySubmit = (params: { quantity: number; investINR: number }) => {
    console.log('Buy order completed successfully:', params);
    closeModal();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-themeTealLighter">Loading watchlist...</div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-themeTealLighter">No items in watchlist</div>
        <div className="text-sm text-gray-500 mt-2">Add stocks to your watchlist to track them here</div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wishlistItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.stock.logo && item.stock.logo.trim() !== '' ? (
                        <Image
                          src={item.stock.logo}
                          alt={`${item.stock.company_name} logo`}
                          width={40}
                          height={40}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-themeTeal text-sm font-semibold">
                          {item.stock.company_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-sm font-medium text-themeTeal cursor-pointer hover:text-themeTealDark transition-colors duration-200"
                      onClick={() => handleCompanyClick(item)}
                    >
                      {item.stock.company_name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(item.stock.price_per_share)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBuy(item);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      Buy
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(item.stock_id);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md transition-colors duration-200 flex items-center space-x-1"
                      title="Remove from watchlist"
                    >
                      <Heart className="h-3 w-3 fill-current" />
                      <span>Remove</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buy Modal */}
      {isModalOpen && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-themeTeal">
                Buy {selectedStock.stock.company_name}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <TradeTabs
                company={selectedStock.stock.company_name}
                priceINR={selectedStock.stock.price_per_share}
                minUnits={selectedStock.stock.min_units && selectedStock.stock.min_units !== null ? selectedStock.stock.min_units : 1}
                lotSize={selectedStock.stock.lot_size && selectedStock.stock.lot_size !== null ? selectedStock.stock.lot_size : 1}
                onBuySubmit={handleBuySubmit}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

