"use client";

import { Heading } from "@/components/ui";
import InvestmentCTA from "../subcomponents/investmentCTA";
import { useEffect, useState } from "react";
import Image from "next/image";

// API Data Types
type BulkDeal = {
  id: number;
  icon: string;
  value: string;
  label: string;
  created_at: string;
  updated_at: string;
};

type BulkDealsResponse = {
  success: boolean;
  message: string;
  data: {
    bulkDeals: BulkDeal[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBulkDeals: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
};

// Component Types - all dynamic from API
type Stat = { 
  icon: string; // Always a URL from S3
  value: string; 
  label: string;
  iconType: 'image';
};
type Props = {
  eyebrow?: string;
  title?: string;
  description?: string;
  stats?: Stat[];
};

// Dynamic icon handling - all icons come from API as URLs

// Convert API data to component format - all icons are URLs from S3
const convertToStats = (bulkDeals: BulkDeal[]): Stat[] => {
  return bulkDeals.map(deal => ({
    icon: deal.icon, // Always a URL from S3
    value: deal.value,
    label: deal.label,
    iconType: 'image' as const,
  }));
};

export default function BulkDeals({
  eyebrow = "Institutional Grade Opportunities",
  title = "Bulk Deals Corner",
  description = "Access exclusive bulk deals in India's top unlisted companies, designed for institutions, family offices, and HNIs. Transparent, compliant, and built for scale.",
  stats: propStats,
}: Props) {
  const [stats, setStats] = useState<Stat[]>(propStats || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBulkDeals = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/bulk-deals');
        const data: BulkDealsResponse = await response.json();
        
        if (data.success && data.data.bulkDeals.length > 0) {
          const convertedStats = convertToStats(data.data.bulkDeals);
          setStats(convertedStats);
        } else {
          // No data from API, keep empty array
          setStats([]);
        }
      } catch (err) {
        console.error('Error fetching bulk deals:', err);
        setError('Failed to load bulk deals data');
        // Keep empty array on error - no fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchBulkDeals();
  }, []);
  return (
    <section>
      <div className="appContainer py-12 md:py-16 flex flex-col items-center gap-8 text-center">
        {/* Eyebrow */}
        <span className="inline-flex items-center rounded-full bg-themeTealLighter px-3 py-1 text-sm font-medium text-themeTealWhite">
          {eyebrow}
        </span>

        {/* Title + copy */}
        <div className="max-w-3xl">
          <Heading as="h2" className="mb-3 text-themeTeal">
            {title}
          </Heading>
          <p className="text-themeTealLight">{description}</p>
        </div>

        {/* Stats */}
        <div className="grid w-full max-w-5xl grid-cols-2 gap-10 md:grid-cols-4 mb-16">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-md bg-gray-200 mb-3 animate-pulse">
                  <div className="h-10 w-10 bg-gray-300 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-themeTealLight">No bulk deals data available</p>
            </div>
          ) : stats.length === 0 ? (
            // No data state
            <div className="col-span-full text-center">
              <p className="text-themeTealLight">No bulk deals available</p>
            </div>
          ) : (
            // Dynamic stats display - all icons are S3 URLs
            stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-md bg-themeTealWhite mb-3">
                  <Image 
                    src={s.icon} 
                    alt={s.label}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="text-2xl font-bold text-themeTeal mb-0">{s.value}</div>
                <div className="text-sm text-themeTealLight">{s.label}</div>
              </div>
            ))
          )}
        </div>

        <InvestmentCTA />
      </div>
    </section>
  );
}
