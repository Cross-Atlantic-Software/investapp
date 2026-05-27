"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Heading } from "@/components/ui";

type InsightCard = {
  title: string;
  period?: string;
  src: string;   // public path e.g. /images/insights/sector-performance.webp or S3 URL
  alt?: string;
};

type Props = {
  cards?: InsightCard[];
};

interface HomeInsight {
  id: number;
  title: string;
  file: string;
  created_at: string;
  updated_at: string;
}

// Format date for period display
function formatPeriod(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} Days Ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} Weeks Ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} Months Ago`;
  return `${Math.ceil(diffDays / 365)} Years Ago`;
}

export function MarketInsight({
  cards,
}: Props) {
  const [homeInsights, setHomeInsights] = useState<HomeInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCards, setDisplayCards] = useState<InsightCard[]>([]);

  // Fetch home insights from database
  useEffect(() => {
    const fetchHomeInsights = async () => {
      try {
        const response = await fetch("/api/home-insights");
        const data = await response.json();

        if (data.success && data.data.homeInsights) {
          setHomeInsights(data.data.homeInsights || []);
        }
      } catch (error) {
        console.error("Error fetching home insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeInsights();
  }, []);

  // Transform home insights to cards format
  useEffect(() => {
    if (homeInsights.length > 0) {
      const transformedCards: InsightCard[] = homeInsights.map((insight) => ({
        title: insight.title,
        period: formatPeriod(insight.created_at),
        src: insight.file,
        alt: insight.title,
      }));
      setDisplayCards(transformedCards);
    } else if (cards && cards.length > 0) {
      // Fallback to provided cards if no home insights
      setDisplayCards(cards);
    } else {
      // Default fallback cards
      setDisplayCards([
        { title: "Fastest-Growing Sectors", period: "Past 7 Days", src: "/images/graph1.png" },
        { title: "Sector vs. Market Benchmark", period: "Past 6 Months", src: "/images/graph2.png" },
        { title: "Demand–Supply Dynamics", period: "Past 8 Months", src: "/images/graph3.png" },
        { title: "Valuation Trends by Funding", period: "Past 6 Months", src: "/images/graph4.png" },
        { title: "Capital Raised So Far", src: "/images/graph5.png" },
        { title: "Workforce as Growth Signal", period: "Past 6 Months", src: "/images/graph6.png" },
      ]);
    }
  }, [homeInsights, cards]);

  return (
    <section>
      <div className="appContainer py-12 md:py-16">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <Heading as="h2" className="mb-3 text-themeTeal">Your Data-Driven Edge in Private Markets</Heading>
          <p className="text-themeTealLight">Go beyond prices. Explore sector momentum, valuation shifts, funding patterns, and demand–supply ratios, all transformed into actionable insights you can trust.</p>
        </div>

        {/* Image grid */}
        {loading ? (
          <div className="text-center text-gray-500">Loading insights...</div>
        ) : displayCards.length === 0 ? (
          <div className="text-center text-gray-500">No insights available</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayCards.map((c, i) => (
              <div key={`${c.title}-${i}`} className="rounded-md bg-themeTealWhite p-4 md:p-5">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="text-md font-medium text-themeTeal">{c.title}</span>
                  {c.period && <span className="text-themeTealLighter">{c.period}</span>}
                </div>

                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-white">
                  {/* Use Next.js Image for both local and external URLs */}
                  <Image
                    src={c.src}
                    alt={c.alt ?? c.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    priority={i === 0}
                    unoptimized={c.src.startsWith('http')}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
