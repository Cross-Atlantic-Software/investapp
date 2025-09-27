"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface StockCarouselCardProps {
  stock: {
    id: number;
    company_name: string;
    logo: string;
    price_per_share: number;
    percentage_change: number;
    valuation: string;
  };
}

function Logo({ name, src }: { name: string; src: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[8px] font-semibold text-gray-600">
        {name.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  
  // Handle external URLs (like S3 URLs)
  if (src.startsWith('http')) {
    return (
      <div className="h-8 w-8 flex items-center justify-center">
        <img
          src={src}
          alt={`${name} logo`}
          className="h-6 w-6 object-contain"
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
        width={32}
        height={32}
        className="object-contain"
        onError={() => setErr(true)}
      />
    </div>
  );
}

function StockCarouselCard({ stock }: StockCarouselCardProps) {
  return (
    <Link href={`/unlisted-company-name/${encodeURIComponent(stock.company_name)}`} className="block cursor-pointer">
      <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Logo name={stock.company_name} src={stock.logo} />
        <div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {stock.company_name}
          </h3>
          <p className="text-xs text-gray-500">{stock.valuation}</p>
        </div>
      </div>

      {/* Price Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Price per share</span>
          <span className="text-sm font-semibold text-gray-900">
            ₹{stock.price_per_share}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Change</span>
          <span className={`text-sm font-semibold ${
            stock.percentage_change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {stock.percentage_change >= 0 ? '+' : ''}{stock.percentage_change}%
          </span>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="mt-3 h-16 bg-gradient-to-r from-blue-50 to-green-50 rounded flex items-center justify-center">
        <div className="text-xs text-gray-500">📈 Chart</div>
      </div>
      </div>
    </Link>
  );
}

export default StockCarouselCard;
export { StockCarouselCard };
