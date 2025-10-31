"use client";

import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { OverviewCard, RiskCard, RecoCard, OpportunityCard, HoldingsTable } from "@/components/dashboard";
import UpdatesListing, { type UpdateItem } from "@/components/dashboard/updatesListing";
import { NotableActivity } from "@/components/subcomponents";
import { Button, Heading } from "@/components/ui";

interface MarketInsight {
  id: number;
  slug: string;
  title: string;
  updated_at: string;
  company_ids?: string;
}

interface WishlistItem {
  stock_id: number;
}

/* ---------- page ---------- */
export default function DashboardPage() {
  const [watchlistInsights, setWatchlistInsights] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'fy2025-26' | 'date-range' | 'last-3-months'>('fy2025-26');
  const [format, setFormat] = useState<'pdf' | 'xls' | 'csv'>('pdf');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  useEffect(() => {
    const fetchWatchlistInsights = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';

        // Fetch user's watchlist
        const watchlistResponse = await fetch('/api/wishlist/my-wishlist', {
          headers: {
            'token': token,
          },
        });

        if (!watchlistResponse.ok) {
          console.error('Failed to fetch watchlist');
          setWatchlistInsights([]);
          return;
        }

        const watchlistData = await watchlistResponse.json();
        
        if (!watchlistData.success || !watchlistData.data || watchlistData.data.length === 0) {
          setWatchlistInsights([]);
          return;
        }

        // Extract stock_ids from watchlist
        const stockIds = watchlistData.data.map((item: WishlistItem) => item.stock_id);

        // Fetch market insights
        const insightsResponse = await fetch('/api/market-insights');
        const insightsData = await insightsResponse.json();

        if (!insightsData.success || !insightsData.data) {
          setWatchlistInsights([]);
          return;
        }

        // Filter insights where company_ids contains any watchlist stock_id
        const filteredInsights = insightsData.data.filter((insight: MarketInsight) => {
          if (!insight.company_ids) return false;
          
          try {
            const companyIds = JSON.parse(insight.company_ids);
            return Array.isArray(companyIds) && companyIds.some((id: number) => stockIds.includes(id));
          } catch (error) {
            console.error('Error parsing company_ids:', error);
            return false;
          }
        });

        // Sort by updated_at (newest first) before converting
        filteredInsights.sort((a: MarketInsight, b: MarketInsight) => {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

        // Convert to UpdateItem format and limit to 10 items
        const formattedInsights: UpdateItem[] = filteredInsights.slice(0, 10).map((insight: MarketInsight) => {
          const updatedDate = new Date(insight.updated_at);
          const now = new Date();
          const diffMs = now.getTime() - updatedDate.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);

          let timeString: string;
          if (diffHours < 1) {
            timeString = 'Just now';
          } else if (diffHours < 24) {
            timeString = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
          } else if (diffDays < 7) {
            timeString = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
          } else {
            timeString = updatedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }

          return {
            id: insight.id.toString(),
            title: insight.title,
            time: timeString,
            href: `/market-insights/${insight.slug}`,
            state: diffDays < 7 ? 'live' : 'muted'
          };
        });

        setWatchlistInsights(formattedInsights);
      } catch (error) {
        console.error('Error fetching watchlist insights:', error);
        setWatchlistInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistInsights();
  }, []);


  const handleDownloadReport = async () => {
    try {
      // Validate date range if selected
      if (period === 'date-range' && (!startDate || !endDate)) {
        alert('Please select both start and end dates');
        return;
      }

      // TODO: Implement actual download logic based on period and format
      console.log('Download Report:', { period, format, startDate, endDate });
      
      // For now, show alert
      alert(`Downloading report: ${format.toUpperCase()} format for ${period === 'fy2025-26' ? 'FY 2025-26' : period === 'date-range' ? `${startDate} to ${endDate}` : 'Last 3 months'}`);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  // Calculate date range for "Last 3 months"
  useEffect(() => {
    if (period === 'last-3-months') {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (period === 'fy2025-26') {
      // FY 2025-26: April 1, 2025 to March 31, 2026
      setStartDate('2025-04-01');
      setEndDate('2026-03-31');
    }
  }, [period]);

  return (
    <section id="dashboard-content">
      {/* header */}
      <div className="mb-4 flex flex-col gap-3 rounded bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading as="h5" className="font-semibold">
          Portfolio Dashboard
        </Heading>
        <div className="flex items-center gap-3">
          <Button
            text="Download Snapshot"
            color="themeTeal"
            variant="outline"
            size="sm"
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            icon={Download}
            iconPosition="left"
          />
        </div>
      </div>

      {/* Download Options Modal/Dropdown */}
      {showDownloadOptions && (
        <div className="mb-4 rounded bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <Heading as="h6" className="font-semibold text-themeTeal">
              Download Report
            </Heading>
            <button
              onClick={() => setShowDownloadOptions(false)}
              className="text-themeTealLighter hover:text-themeTeal"
            >
              ×
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Period Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-themeTeal">
                Select Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'fy2025-26' | 'date-range' | 'last-3-months')}
                className="w-full rounded-lg border border-themeTealLighter px-4 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
              >
                <option value="fy2025-26">FY 2025-26</option>
                <option value="date-range">Date Range</option>
                <option value="last-3-months">Last 3 months</option>
              </select>

              {/* Date Range Fields - Only show when Date Range is selected */}
              {period === 'date-range' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-themeTeal">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-themeTealLighter px-4 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-themeTeal">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-themeTealLighter px-4 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Format Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-themeTeal">
                Select Format
              </label>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-themeTealLighter p-3 hover:bg-themeTealWhite">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={format === 'pdf'}
                    onChange={(e) => setFormat(e.target.value as 'pdf')}
                    className="h-4 w-4 text-themeTeal focus:ring-themeTeal"
                  />
                  <span className="text-sm font-medium text-themeTeal">PDF</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-themeTealLighter p-3 hover:bg-themeTealWhite">
                  <input
                    type="radio"
                    name="format"
                    value="xls"
                    checked={format === 'xls'}
                    onChange={(e) => setFormat(e.target.value as 'xls')}
                    className="h-4 w-4 text-themeTeal focus:ring-themeTeal"
                  />
                  <span className="text-sm font-medium text-themeTeal">XLS</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-themeTealLighter p-3 hover:bg-themeTealWhite">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value as 'csv')}
                    className="h-4 w-4 text-themeTeal focus:ring-themeTeal"
                  />
                  <span className="text-sm font-medium text-themeTeal">CSV</span>
                </label>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mt-6 flex justify-end">
            <Button
              text={`Download ${format.toUpperCase()}`}
              color="themeTeal"
              variant="solid"
              size="sm"
              onClick={handleDownloadReport}
              icon={Download}
              iconPosition="left"
            />
          </div>
        </div>
      )}

      {/* top summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard />
        <RiskCard />
        <RecoCard />
        <OpportunityCard />
      </div>

      {/* holdings table - full width */}
      <section className="rounded bg-white p-4">
        <div className="mb-4">
          <Heading as="h5" className="text-themeTeal">
            Holdings
          </Heading>
        </div>

        {/* table: responsive with proper overflow handling */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <HoldingsTable />
          </div>
        </div>
      </section>

      {/* updates sidebar */}
      <div className="mt-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full lg:w-1/2">
            {loading ? (
              <div className="rounded bg-white p-4">
                <h3 className="px-4 pt-3 text-lg font-semibold text-themeTeal">Market Insights</h3>
                <div className="px-4 py-3 text-sm text-themeTealLighter">Loading...</div>
              </div>
            ) : watchlistInsights.length > 0 ? (
              <UpdatesListing items={watchlistInsights} heading="Market Insights" className="p-2" />
            ) : (
              <div className="rounded bg-white p-4">
                <h3 className="px-4 pt-3 text-lg font-semibold text-themeTeal">Market Insights</h3>
                <div className="px-4 py-3 text-sm text-themeTealLighter">No market insights available for your watchlist companies.</div>
              </div>
            )}
          </div>
          <div className="w-full lg:w-1/2">
            <div className="rounded bg-white p-2">
              <NotableActivity />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
