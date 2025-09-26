// components/PrivateMarketNews.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Zap } from "lucide-react";

type TagVariant = "funding" | "impactHigh" | "impactMedium" | "corporate" | "product";

type NewsItem = {
  id: string;
  initials: string;          // e.g., "CL"
  iconUrl?: string;          // S3 URL for uploaded icon
  title: string;             // e.g., "CloudTech raises ₹150M Series C"
  tags: { label: string; variant: TagVariant; color?: string }[];
  timeAgo: string;           // "2h ago"
  highlight?: boolean;       // renders the middle white bubble
};

type BackendNewsItem = {
  id: number;
  title: string;
  url: string;
  icon: string;
  taxonomy_ids: string; // JSON string from database
  created_at: string;
  updated_at: string;
};

// Removed tagClass as we now use dynamic colors from database

export default function PrivateMarketNews({
  items,
}: { items?: NewsItem[] }) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const transformTags = (taxonomy_ids: string, taxonomiesData: {id: number, name: string, color: string}[]): { label: string; variant: TagVariant; color?: string }[] => {
    const tags: { label: string; variant: TagVariant; color?: string }[] = [];
    
    // Parse taxonomy IDs - handle both JSON array and comma-separated string formats
    let parsedIds: number[] = [];
    try {
      // First try to parse as JSON array
      parsedIds = JSON.parse(taxonomy_ids);
    } catch {
      // If JSON parsing fails, try comma-separated string
      try {
        parsedIds = taxonomy_ids
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id));
        console.log('Parsed taxonomy IDs from comma-separated string:', parsedIds);
      } catch (parseError) {
        console.error('Error parsing taxonomy IDs:', parseError);
        parsedIds = [];
      }
    }
    
    // Map taxonomy IDs to actual taxonomy data
    parsedIds.forEach((id) => {
      const taxonomy = taxonomiesData.find(t => t.id === id);
      if (taxonomy) {
        let variant: TagVariant = "corporate";
        
        // Determine variant based on taxonomy name
        const name = taxonomy.name.toLowerCase();
        if (name.includes('funding')) variant = "funding";
        else if (name.includes('product')) variant = "product";
        else if (name.includes('corporate')) variant = "corporate";
        else if (name.includes('high')) variant = "impactHigh";
        else if (name.includes('medium')) variant = "impactMedium";
        else if (name.includes('low')) variant = "impactMedium";
        
        tags.push({ 
          label: taxonomy.name, 
          variant,
          color: taxonomy.color
        });
      }
    });

    // If no tags, add a default one
    if (tags.length === 0) {
      tags.push({ label: "General", variant: "corporate" });
    }

    return tags;
  };


  const fetchNews = useCallback(async (taxonomiesData: {id: number, name: string, color: string}[]) => {
    try {
      const response = await fetch('/api/private-market-news');
      const data = await response.json();
      
      if (data.success && data.data && data.data.news) {
        const transformedItems = data.data.news.map((item: BackendNewsItem, index: number) => ({
          id: item.id.toString(),
          initials: item.icon && !item.icon.startsWith('http') ? item.icon : item.title.substring(0, 2).toUpperCase(),
          iconUrl: item.icon && item.icon.startsWith('http') ? item.icon : undefined,
          title: item.title,
          tags: transformTags(item.taxonomy_ids, taxonomiesData),
          timeAgo: getTimeAgo(item.created_at),
          highlight: index === 1, // Highlight second item
        }));
        setNewsItems(transformedItems);
      } else {
        console.warn('No news data received from API, setting empty array');
        setNewsItems([]);
      }
    } catch (error) {
      console.error('Error fetching private market news:', error);
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (items) {
      setNewsItems(items);
      setLoading(false);
      return;
    }

    // Fetch taxonomies first, then news with the taxonomy data
    const loadData = async () => {
      try {
        const response = await fetch('/api/taxonomies');
        const data = await response.json();
        let taxonomiesData: {id: number, name: string, color: string}[] = [];
        
        if (data.success && data.data && data.data.taxonomies) {
          taxonomiesData = data.data.taxonomies;
        }
        
        // Now fetch news with the taxonomy data
        await fetchNews(taxonomiesData);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, [items, fetchNews]);


  const getTimeAgo = (dateString: string): string => {
    // Handle time-only format (e.g., "20:37:41")
    if (dateString && dateString.includes(':') && !dateString.includes('-')) {
      // If it's just time format, assume it's today
      const today = new Date();
      const [hours, minutes, seconds] = dateString.split(':').map(Number);
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
      
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      // Show actual calculated hours
      if (diffInHours <= 0) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    }
    
    // Handle full datetime format
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    // Show actual calculated hours
    if (diffInHours <= 0) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };


  if (loading) {
    return (
      <section className="rounded-md border border-themeTealLighter bg-themeTealWhite p-5 md:p-6">
        <header className="mb-4 flex items-center gap-2 text-teal-900">
          <Zap className="h-4 w-4" />
          <h3 className="text-base font-semibold">Private Market News</h3>
        </header>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-themeTeal"></div>
        </div>
      </section>
    );
  }
  return (
    <section className="rounded-md border border-themeTealLighter bg-themeTealWhite p-5 md:p-6">
      <header className="mb-4 flex items-center gap-2 text-teal-900">
        <Zap className="h-4 w-4" />
        <h3 className="text-base font-semibold">Private Market News</h3>
      </header>

      {newsItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 text-themeTealLighter">
            <Zap className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-sm text-themeTealLighter">No private market news available at the moment</p>
          <p className="text-xs text-themeTealLighter mt-1">Check back later for updates</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4 text-left">
          {newsItems.map((n) => (
            <li
              key={n.id}
              className={[
                "rounded-xl transition duration-500 hover:bg-white p-3 md:p-4",
                n.highlight ? "" : "",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-themeTealLighter text-md font-semibold text-themeTealWhite overflow-hidden">
                  {n.iconUrl ? (
                    <Image 
                      src={n.iconUrl} 
                      alt="News icon" 
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span style={{display: n.iconUrl ? 'none' : 'flex'}}>
                    {n.initials}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {n.tags.map((t, i) => (
                      <span
                        key={`${n.id}-tag-${i}`}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium text-white`}
                        style={{ backgroundColor: t.color || '#3B82F6' }}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-md font-semibold text-themeTeal">{n.title}</p>
                  <p className="mt-1 text-xs text-themeTealLighter">{n.timeAgo}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
