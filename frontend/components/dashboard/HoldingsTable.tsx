"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import TradeTabs from "@/components/shares/buySell";

interface UserHolding {
  id: number;
  company_name: string;
  quantity: number;
  purchase_price: number | string;
  total_amount: number;
  price_change: number | string;
  percentage_change: number | string;
  price_per_share: number | string;
  min_units?: number | string | null;
  lot_size?: number | string | null;
}

export default function HoldingsTable() {
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<UserHolding | null>(null);
  const router = useRouter();

  const fetchUserHoldings = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      const response = await fetch('/api/user-holdings', {
        headers: {
          'token': token,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setHoldings(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHoldings();
  }, []);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  const getChangeIcon = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleBuy = (holding: UserHolding) => {
    setSelectedHolding(holding);
    setIsModalOpen(true);
  };

  const handleSell = (holding: UserHolding) => {
    // Navigate to sell page for this stock
    console.log('Sell clicked for:', holding.company_name);
    // You can implement navigation logic here
  };

  const handleCompanyClick = (holding: UserHolding) => {
    // Navigate to stock detail page
    router.push(`/unlisted-company-name/${holding.company_name}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHolding(null);
  };

  const handleBuySubmit = (params: { quantity: number; investINR: number }) => {
    // The TradeTabs component handles all the buy logic internally
    // This callback is called after successful buy order
    console.log('Buy order completed successfully:', params);
    
    // Close modal after successful buy
    closeModal();
    
    // Refresh holdings data to show updated quantities
    // Refresh data after a short delay to allow backend to process
    setTimeout(() => {
      fetchUserHoldings();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-themeTealLighter">Loading holdings...</div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-themeTealLighter">No holdings found</div>
        <div className="text-sm text-gray-500 mt-2">Start investing to see your holdings here</div>
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
                Shares
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding) => (
              <tr key={holding.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className="text-sm font-medium text-themeTeal cursor-pointer hover:text-themeTealDark transition-colors duration-200"
                    onClick={() => handleCompanyClick(holding)}
                  >
                    {holding.company_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {holding.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(holding.purchase_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(holding.total_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(holding.percentage_change)}
                    <span className={`text-sm font-medium ${getChangeColor(holding.percentage_change)}`}>
                      {formatPercentage(holding.percentage_change)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleBuy(holding);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      Buy
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSell(holding);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md transition-colors duration-200"
                    >
                      Sell
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buy Modal */}
      {isModalOpen && selectedHolding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-themeTeal">
                Buy {selectedHolding.company_name}
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
                company={selectedHolding.company_name}
                priceINR={parseFloat(selectedHolding.price_per_share.toString())}
                minUnits={selectedHolding.min_units && selectedHolding.min_units !== null ? parseInt(selectedHolding.min_units.toString()) : 1}
                lotSize={selectedHolding.lot_size && selectedHolding.lot_size !== null ? parseInt(selectedHolding.lot_size.toString()) : 1}
                onBuySubmit={handleBuySubmit}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
