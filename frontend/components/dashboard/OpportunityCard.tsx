"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const cardCls = "rounded bg-white p-4 sm:p-6";

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-[15px] font-semibold text-themeTeal">{title}</p>
      {right}
    </div>
  );
}

interface BannerStock {
  id: number;
  company_name: string;
  logo: string;
  price_per_share: number | string;
  percentage_change: number | string;
  price_change: number | string;
  demand: string;
}

export default function OpportunityCard() {
  const [stocks, setStocks] = useState<BannerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchBannerStocks = async () => {
      try {
        const response = await fetch('/api/stocks/banner-display');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.stocks) {
            setStocks(data.data.stocks);
          }
        }
      } catch (error) {
        console.error('Error fetching banner stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerStocks();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (stocks.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stocks.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [stocks.length]);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  const getDemandColor = (demand: string) => {
    switch (demand.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % stocks.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + stocks.length) % stocks.length);
  };

  const handleStockClick = () => {
    if (currentStock) {
      router.push(`/unlisted-company-name/${currentStock.company_name}`);
    }
  };

  if (loading) {
    return (
      <div className={cardCls}>
        <CardHeader title="Opportunity Alert" right={<span className="h-3 w-3 rounded-full bg-emerald-600" />} />
        <div className="text-sm text-themeTealLighter">Loading opportunities...</div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className={cardCls}>
        <CardHeader title="Opportunity Alert" right={<span className="h-3 w-3 rounded-full bg-emerald-600" />} />
        <div className="text-sm text-themeTealLighter">No opportunities available</div>
      </div>
    );
  }

  const currentStock = stocks[currentIndex];

  if (!currentStock) {
    return (
      <div className={cardCls}>
        <CardHeader title="Opportunity Alert" right={<span className="h-3 w-3 rounded-full bg-emerald-600" />} />
        <div className="text-sm text-themeTealLighter">No stock data available</div>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <CardHeader title="Opportunity Alert" right={<span className="h-3 w-3 rounded-full bg-emerald-600" />} />
      
      {/* Slider Container */}
      <div className="relative">
        {/* Stock Card */}
        <div 
          className="bg-gray-50 rounded-lg p-3 mb-3 min-h-[120px] cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleStockClick}
        >
          <div className="flex items-start space-x-3">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src={currentStock.logo || '/images/placeholder-stock.webp'} 
                alt={currentStock.company_name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-stock.webp';
                }}
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-themeTeal mb-1">
                {currentStock.company_name}
              </h4>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-themeTealLighter">Price:</span>
                  <span className="text-xs font-medium text-themeTeal">
                    {formatCurrency(currentStock.price_per_share)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-themeTealLighter">Change:</span>
                  <span className={`text-xs font-medium ${(typeof currentStock.percentage_change === 'string' ? parseFloat(currentStock.percentage_change) : currentStock.percentage_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(currentStock.percentage_change)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-themeTealLighter">Demand:</span>
                  <span className={`text-xs font-medium ${getDemandColor(currentStock.demand)}`}>
                    {currentStock.demand}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {stocks.length > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={prevSlide}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={stocks.length <= 1}
            >
              <ChevronLeft className="h-4 w-4 text-themeTeal" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex space-x-1">
              {stocks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-themeTeal' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={stocks.length <= 1}
            >
              <ChevronRight className="h-4 w-4 text-themeTeal" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
