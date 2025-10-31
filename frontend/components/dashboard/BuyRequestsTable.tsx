"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BuyRequestItem {
  id: number;
  stock_id: number;
  stock_name: string;
  quantity: number;
  price: number | string;
  total_amount: number | string;
  created_at: string;
  company_name: string;
  logo?: string;
  price_per_share?: number | string;
}

export default function BuyRequestsTable() {
  const [buyRequests, setBuyRequests] = useState<BuyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBuyRequests = async () => {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      const response = await fetch('/api/user-buy-requests', {
        headers: {
          'token': token,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setBuyRequests(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching buy requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyRequests();
  }, []);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCompanyClick = (item: BuyRequestItem) => {
    router.push(`/unlisted-company-name/${encodeURIComponent(item.company_name)}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-themeTealLighter">Loading buy requests...</div>
      </div>
    );
  }

  if (buyRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-themeTealLighter">No buy requests found</div>
        <div className="text-sm text-gray-500 mt-2">Your buy requests will appear here</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price per Share
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {buyRequests.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.logo && item.logo.trim() !== '' ? (
                      <Image
                        src={item.logo}
                        alt={`${item.company_name} logo`}
                        width={40}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-themeTeal text-sm font-semibold">
                        {item.company_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div
                    className="text-sm font-medium text-themeTeal cursor-pointer hover:text-themeTealDark transition-colors duration-200"
                    onClick={() => handleCompanyClick(item)}
                  >
                    {item.company_name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(item.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(item.total_amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

