"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PrivateMarketNewsItem {
  id: number;
  title: string;
  url: string;
  icon: string;
  taxonomy_tags: string;
  impact_level: 'High Impact' | 'Medium Impact' | 'Low Impact';
  createdAt: string;
}

interface PrivateMarketNewsProps {
  limit?: number;
  showTitle?: boolean;
}

export default function PrivateMarketNews({ limit = 3, showTitle = true }: PrivateMarketNewsProps) {
  const [news, setNews] = useState<PrivateMarketNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [limit]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/private-market-news?limit=${limit}&sortOrder=DESC`);
      const data = await response.json();
      
      if (data.success) {
        setNews(data.data.news || []);
      } else {
        console.error('Error fetching private market news:', data.message);
      }
    } catch (error) {
      console.error('Error fetching private market news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High Impact':
        return 'bg-red-100 text-red-800';
      case 'Medium Impact':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low Impact':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const parseTaxonomyTags = (tagsString: string) => {
    try {
      return JSON.parse(tagsString);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Market News</h3>
        )}
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="bg-white rounded-lg p-6">
        {showTitle && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Market News</h3>
        )}
        <p className="text-gray-500 text-center py-4">No news available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Market News</h3>
      )}
      <div className="space-y-4">
        {news.map((item) => {
          const taxonomyTags = parseTaxonomyTags(item.taxonomy_tags);
          const primaryTag = taxonomyTags.find((tag: any) => tag.category === 'Primary');
          const secondaryTag = taxonomyTags.find((tag: any) => tag.category === 'Secondary');
          
          return (
            <div key={item.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              {/* Icon */}
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">
                  {item.icon || 'N'}
                </span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Tags */}
                <div className="flex items-center space-x-2 mb-1">
                  {primaryTag && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {primaryTag.name}
                    </span>
                  )}
                  {secondaryTag && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getImpactColor(item.impact_level)}`}>
                      {secondaryTag.name}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  <Link 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {item.title}
                  </Link>
                </h4>
                
                {/* Time */}
                <p className="text-xs text-gray-500">
                  {getTimeAgo(item.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
