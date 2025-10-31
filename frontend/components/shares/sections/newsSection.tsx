"use client";

import { Button } from "@/components/ui";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export type NewsItem = {
  id: number;
  title: string;
  date: string;        // e.g. "Apr 28, 2025"
  href: string;
  imgSrc: string;      // S3 URL or public path
  imgAlt?: string;
};

type MarketInsightData = {
  id: number;
  title: string;
  blog_image: string;
  updated_at: string;
  slug: string;
};

export default function NewsSection({
  stockId,
  heading = "Related Market Insights",
  info,
  viewAllHref,
  items,
}: {
  stockId?: number;
  heading?: string;
  info?: string;
  viewAllHref?: string;
  items?: NewsItem[];
}) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(items || DEMO_ITEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNewsItems = useCallback(async () => {
    if (!stockId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch market insights and filter by company_ids containing this stockId
      const response = await fetch('/api/market-insights');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter insights where company_ids contains the current stockId
        const filteredInsights = result.data.filter((insight: any) => {
          if (!insight.company_ids) return false;
          
          try {
            const companyIds = JSON.parse(insight.company_ids);
            return Array.isArray(companyIds) && companyIds.includes(stockId);
          } catch (error) {
            console.error('Error parsing company_ids:', error);
            return false;
          }
        });
        
        const formattedItems: NewsItem[] = filteredInsights.map((item: MarketInsightData) => ({
          id: item.id,
          title: item.title,
          date: new Date(item.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          href: `/market-insights/${item.slug}`,
          imgSrc: item.blog_image || '/images/default-news.webp',
          imgAlt: item.title
        }));
        
        setNewsItems(formattedItems);
      } else {
        setNewsItems([]);
      }
    } catch (err) {
      console.error('Error loading market insights:', err);
      setError('Failed to load market insights');
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  }, [stockId]);

  useEffect(() => {
    if (stockId && !items) {
      loadNewsItems();
    } else if (!stockId && !items) {
      setNewsItems(DEMO_ITEMS);
    }
  }, [stockId, items, loadNewsItems]);
  // Show loading state
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading market insights...</p>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="space-y-4">
        <div className="text-center py-8 text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      </section>
    );
  }

  // Show empty state
  if (newsItems.length === 0) {
    return (
      <section className="space-y-4">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No market insights available for this company.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      {(heading || info || viewAllHref) && (
        <div className="flex items-center justify-between">
          <div>
            {heading && <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>}
            {info && <p className="text-sm text-gray-600 mt-1">{info}</p>}
          </div>
          {viewAllHref && (
            <Button 
              text="View All" 
              color="themeTeal" 
              variant="outline" 
              size="sm" 
              href={viewAllHref} 
            />
          )}
        </div>
      )}

      {/* cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {newsItems.map((n) => (
          <article
            key={n.id}
            className="rounded bg-white"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md">
              <Image
                src={n.imgSrc}
                alt={n.imgAlt ?? n.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                priority={false}
              />
            </div>

            <h4 className="text-md font-semibold leading-snug text-themeTeal p-4">
              {n.title}
            </h4>

            <div className="flex items-center px-4 justify-between p-4">
              <time className="text-themeTealLighter text-sm">{n.date}</time>
              <a 
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-md transition-colors"
              >
                View Details
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* demo data - fallback when no stockId provided */
const DEMO_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: "Q1 2025 Secondary Market Update",
    date: "Apr 28, 2025",
    href: "#",
    imgSrc: "/images/news1.webp",
  },
  {
    id: 2,
    title: "How Will the Tariff Sell-Off Hit Your Private Company Portfolio",
    date: "Apr 7, 2025",
    href: "#",
    imgSrc: "/images/news2.webp",
  },
  {
    id: 3,
    title: "AltStock Tracker: March 2025 update",
    date: "Mar 13, 2025",
    href: "#",
    imgSrc: "/images/news3.webp",
  },
];
