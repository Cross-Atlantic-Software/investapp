"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
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

interface MarketInsight {
  id: number;
  title: string;
  slug: string;
  blog_image: string;
  created_at: string;
  teaser?: string;
  topic?: {
    name: string;
  };
}

export default function RecoCard() {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedInsights = async () => {
      try {
        const response = await fetch('/api/market-insights/featured?topic=Trend Analyzer&limit=4');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setInsights(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching featured insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedInsights();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (insights.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [insights.length]);


  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const handleInsightClick = () => {
    if (currentInsight) {
      router.push(`/market-insights/${currentInsight.slug}`);
    }
  };

  if (loading) {
    return (
      <div className={cardCls}>
        <CardHeader title="Actionable Signals" right={<TrendingUp className="h-5 w-5 text-themeTeal/80" />} />
        <div className="text-sm text-themeTealLighter">Loading insights...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className={cardCls}>
        <CardHeader title="Actionable Signals" right={<TrendingUp className="h-5 w-5 text-themeTeal/80" />} />
        <div className="text-sm text-themeTealLighter">No insights available</div>
      </div>
    );
  }

  const currentInsight = insights[currentIndex];

  return (
    <div className={cardCls}>
      <CardHeader title="Actionable Signals" right={<TrendingUp className="h-5 w-5 text-themeTeal/80" />} />
      
      {/* Slider Container */}
      <div className="relative">
        {/* Insight Card */}
        <div 
          className="bg-gray-50 rounded-lg p-3 mb-3 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleInsightClick}
        >
          {/* Content */}
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-themeTeal line-clamp-2 mb-1">
              {currentInsight.title}
            </h4>
            <p className="text-xs text-themeTealLighter truncate">
              {currentInsight.teaser || 'No description available'}
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        {insights.length > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={prevSlide}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={insights.length <= 1}
            >
              <ChevronLeft className="h-4 w-4 text-themeTeal" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex space-x-1">
              {insights.map((_, index) => (
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
              disabled={insights.length <= 1}
            >
              <ChevronRight className="h-4 w-4 text-themeTeal" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
