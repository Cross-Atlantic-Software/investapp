"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/ui";
import { Clock } from "lucide-react";
import { HighDemandStocks, LowDemandStocks, NotableActivity, PrivateMarketNews } from "../subcomponents";

interface Stock {
  id: number;
  company_name: string;
  logo: string;
  price: number;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
  demand: 'High Demand' | 'Low Demand';
  homeDisplay: 'yes' | 'no';
  bannerDisplay: 'yes' | 'no';
  valuation: string;
  price_per_share: number;
  percentage_change: number;
  createdAt: string;
  updatedAt: string;
}

export function BeyondMarket() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchHomeDisplayStocks();
  }, [retryCount]);

  const fetchHomeDisplayStocks = async () => {
    try {
      const response = await fetch('/api/stocks/home-display');
      const data = await response.json();
      
      if (data.success) {
        setStocks(data.data.stocks);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        console.error('API Error:', data.message);
        // Fallback: show empty state instead of breaking
        setStocks([]);
        setLastUpdated('Error loading data');
      }
    } catch (error) {
      console.error('Error fetching home display stocks:', error);
      // Fallback: show empty state instead of breaking
      setStocks([]);
      setLastUpdated('Connection error');
    } finally {
      setLoading(false);
    }
  };

  // Filter stocks by demand
  const highDemandStocks = stocks.filter(stock => stock.demand === 'High Demand');
  const lowDemandStocks = stocks.filter(stock => stock.demand === 'Low Demand');

  // Transform data to match component interface
  const transformStockData = (stock: Stock) => ({
    id: stock.id.toString(),
    name: stock.company_name,
    logo: stock.logo,
    changeINR: stock.price_change.toString(),
    changePct: stock.percentage_change.toString(),
    price: stock.price_per_share.toString(),
    valuation: stock.valuation
  });
  return (
    <section className="">
      <div className="appContainer py-16 md:py-20 flex flex-col gap-6 text-center">
        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <Heading as="h2" className="mb-3">Your Real-Time Window into India’s Private Market</Heading>
          <p className="text-themeTealLight">Track live demand, price shifts, and valuations for top unlisted companies, from fast-growing startups to established giants.</p>
        </div>

        {/* Status bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-base text-themeTealLight gap-4">
          {/* Left: label + badges */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-themeTeal">
              What’s Going on Today
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-800" />
              Live
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-red-800" />
              Offline
            </span>
          </div>

          {/* Right: last updated */}
          <div className="flex items-center gap-2 text-sm text-themeTealLighter">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdated || 'Loading...'}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-8 gap-4">
            <p className="text-themeTealLight">No stocks available for home display</p>
            {lastUpdated.includes('Error') && (
              <button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeTealLight transition-colors duration-200 text-sm"
              >
                Retry Connection
              </button>
            )}
          </div>
        ) : (
          <>
            {highDemandStocks.length > 0 && (
              <HighDemandStocks
                items={highDemandStocks.map(transformStockData)}
                autoplayMs={8000}
              />
            )}

            {lowDemandStocks.length > 0 && (
              <LowDemandStocks
                items={lowDemandStocks.map(transformStockData)}
                autoplayMs={8000}
              />
            )}
          </>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <PrivateMarketNews />
          </div>
          <div>
            <NotableActivity />
          </div>
        </div>

      </div>
    </section>
  );
}
