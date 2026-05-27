"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const cardCls = "rounded bg-white p-4 sm:p-6";

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-[15px] font-semibold text-themeTeal">{title}</p>
      {right}
    </div>
  );
}

function Logo({ name, src }: { name: string; src: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-gray-600">
        {name.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  
  // Handle external URLs (like S3 URLs)
  if (src.startsWith('http')) {
    return (
      <div className="h-10 w-10 flex items-center justify-center">
        <img
          src={src}
          alt={`${name} logo`}
          className="h-8 w-8 object-contain"
          onError={() => setErr(true)}
        />
      </div>
    );
  }
  
  // Handle local paths
  return (
    <div>
      <Image
        src={src.startsWith("/") ? src : `/${src.replace(/^\/+/, "")}`}
        alt={`${name} logo`}
        width={40}
        height={40}
        className="object-contain"
        onError={() => setErr(true)}
      />
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
        <article 
          className="rounded-md border border-themeTealLighter bg-brandGradientGreen p-5 mb-3 cursor-pointer hover:shadow-lg transition-all duration-300"
          onClick={handleStockClick}
        >
          {/* Top */}
          <div className="mb-5 flex items-center gap-3">
            <Logo name={currentStock.company_name} src={currentStock.logo || ''} />
            <div className="font-semibold text-themeTeal transition duration-500 hover:text-themeSkyBlue">
              {currentStock.company_name}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-left text-sm">
            <div>
              <p className="text-themeTealLighter">₹ Change</p>
              <p className="flex items-center gap-1 font-semibold text-green-800">
                {formatCurrency(currentStock.price_change)} <TrendingUp className="h-3.5 w-3.5" />
              </p>
            </div>
            <div>
              <p className="text-themeTealLighter">% Change</p>
              <p className="font-semibold text-green-800 flex gap-1 items-center">
                {formatPercentage(currentStock.percentage_change)} <ArrowUp size={16} />
              </p>
            </div>
            <div>
              <p className="text-themeTealLighter">Price Per Share</p>
              <p className="font-semibold text-themeTeal">{formatCurrency(currentStock.price_per_share)}</p>
            </div>
            <div>
              <p className="text-themeTealLighter">Demand</p>
              <p className={`font-semibold ${getDemandColor(currentStock.demand)}`}>
                {currentStock.demand}
              </p>
            </div>
          </div>
        </article>

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
