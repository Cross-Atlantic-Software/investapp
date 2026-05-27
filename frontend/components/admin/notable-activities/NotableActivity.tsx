// components/NotableActivity.tsx
"use client";

import { IndianRupee, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

type Activity = {
  id: string;
  title: string;        // Activity type name
  description: string;  // Activity description
  created_at: string;   // Created timestamp
  icon?: string;        // Icon URL
  iconUrl?: string;     // Processed icon URL (absolute URLs only)
  initials?: string;    // Fallback initials
};

export default function NotableActivity({
  items = [],
}: { items?: Activity[] }) {
  const [activities, setActivities] = useState<Activity[]>(items);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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

  useEffect(() => {
    const fetchActivities = async () => {
      if (hasFetched) return; // Prevent multiple fetches
      
      setLoading(true);
      try {
        const response = await fetch('/api/notable-activities?limit=4');
        const data = await response.json();
        
        if (data.success && data.data.activities) {
          // Transform activities to handle icon URLs properly
          const transformedActivities = data.data.activities.map((activity: {
            id: number;
            title: string;
            description: string;
            created_at: string;
            icon?: string;
          }) => ({
            ...activity,
            initials: activity.icon && !activity.icon.startsWith('http') ? activity.icon : activity.title.substring(0, 2).toUpperCase(),
            iconUrl: activity.icon && activity.icon.startsWith('http') ? activity.icon : undefined,
          }));
          setActivities(transformedActivities);
        }
      } catch (error) {
        console.error('Error fetching notable activities:', error);
        // Keep default items if API fails
        setActivities(items);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    };

    // Only fetch if no items provided and haven't fetched yet
    if (items.length === 0 && !hasFetched) {
      fetchActivities();
    }
  }, [hasFetched, items.length]); // Depend on hasFetched and items.length to prevent infinite loops

  if (loading) {
    return (
      <aside className="rounded-md border border-themeTealLighter bg-themeTealWhite p-5 md:p-6">
        <header className="mb-4 flex items-center gap-2 text-themeTeal">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-base font-semibold">Notable Activity</h3>
        </header>
        <div className="flex flex-col gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 text-left animate-pulse">
              <div className="mt-0.5 h-12 w-12 shrink-0 rounded-full bg-gray-200"></div>
              <div className="min-w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-themeTealLighter bg-themeTealWhite p-5 md:p-6">
      <header className="mb-4 flex items-center gap-2 text-themeTeal">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-base font-semibold">Notable Activity</h3>
      </header>

      <ul className="flex flex-col gap-5">
        {activities.map((x) => (
          <li key={x.id} className="flex items-start gap-3 text-left">
            <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-themeTealLighter text-md font-semibold text-themeTealWhite overflow-hidden">
              {x.iconUrl ? (
                <Image 
                  src={x.iconUrl} 
                  alt={x.title} 
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
              <span style={{display: x.iconUrl ? 'none' : 'flex'}}>
                {x.initials || <IndianRupee className="h-4 w-4" />}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-md font-semibold text-themeTeal">{x.title}</p>
              <p className="text-sm text-themeTealLighter">{x.description}</p>
              <p className="mt-1 text-xs text-themeTealLighter">{getTimeAgo(x.created_at)}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
