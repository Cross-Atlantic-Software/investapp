"use client";

import { useState, useEffect } from "react";
import { Clipboard } from "lucide-react";

const cardCls = "rounded bg-white p-4 sm:p-6";

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-[15px] font-semibold text-themeTeal">{title}</p>
      {right}
    </div>
  );
}

export default function OverviewCard() {
  const [portfolioData, setPortfolioData] = useState<{
    total_investment: number;
    price_change: number;
    percentage_change: number;
    updated_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('/api/user-portfolio');

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setPortfolioData(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (numAmount >= 100000) {
      return `₹${(numAmount / 100000).toFixed(1)}L`;
    }
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Show more decimal places for small percentages
    if (Math.abs(numValue) < 1) {
      return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
    }
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className={cardCls}>
        <CardHeader title="Portfolio Overview" right={<Clipboard className="h-5 w-5 text-themeTeal/80" />} />
        <div className="text-3xl font-semibold text-themeTeal">Loading...</div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className={cardCls}>
        <CardHeader title="Portfolio Overview" right={<Clipboard className="h-5 w-5 text-themeTeal/80" />} />
        <div className="text-3xl font-semibold text-themeTeal">No Portfolio Data</div>
        <div className="mt-3 text-sm text-themeTealLighter">No portfolio data available</div>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <CardHeader title="Portfolio Overview" right={<Clipboard className="h-5 w-5 text-themeTeal/80" />} />
      <div className="text-3xl font-semibold text-themeTeal">{formatCurrency(portfolioData.total_investment)}</div>
      <div className={`mt-3 text-sm font-semibold ${portfolioData.price_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {portfolioData.price_change >= 0 ? '↗' : '↘'} {formatCurrency(portfolioData.price_change)} ({formatPercentage(portfolioData.percentage_change)})
      </div>
      <div className="mt-2 text-sm text-themeTealLighter">Last updated: {formatDate(portfolioData.updated_at)}</div>
    </div>
  );
}
