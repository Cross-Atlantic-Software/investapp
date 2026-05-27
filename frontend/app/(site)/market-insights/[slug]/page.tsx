"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Lock, Search } from "lucide-react";
import Breadcrumbs, { type Crumb } from "@/components/subcomponents/breadcrumbs";
import { Button, Heading } from "@/components/ui";
import RelatedCarousel from "@/components/subcomponents/relatedCarousel";
import HighDemandStocks from "@/components/subcomponents/highDemandStocks";


// ---------- Types ----------
export interface MarketInsight {
  id: number;
  slug: string;
  is_featured: boolean;
  title: string;
  blog_image: string;
  teaser: string;
  summary: string;
  content_type: 'TEXT' | 'VIDEO';
  first_part?: string;
  second_part?: string;
  video_file?: string;
  video_url?: string;
  insight_sector_id?: number;
  insight_subsector_ids?: string;
  insight_topic_id?: number;
  insight_subtopic_ids?: string;
  insight_theme_id?: number;
  company_ids?: string;
  InsightSector?: { id: number; name: string };
  InsightTopic?: { id: number; name: string };
  InsightTheme?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

interface HighDemandStock {
  id: string;
  name: string;
  logo: string;
  changeINR: string;
  changePct: string;
  price: string;
  valuation: string;
  priceChangePeriod?: string;
}

// ---------- Utilities ----------
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function fmt(iso: string) {
  try {
    // Handle both date-only and full ISO strings
    const date = iso.includes('T') ? new Date(iso) : new Date(`${iso}T00:00:00Z`);
    return DATE_FMT.format(date);
  } catch {
    return iso;
  }
}

// Convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
  try {
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    // If no pattern matches, return the original URL
    return url;
  } catch {
    return url;
  }
}

// ---------- Components ----------
function LoginPrompt() {
  return (
    <div className="mt-6 p-6 bg-themeTealWhite rounded-lg border border-themeTealLighter">
      <div className="flex items-center gap-3 mb-4">
        <Lock className="h-5 w-5 text-themeTeal" />
        <h4 className="text-lg font-semibold text-themeTeal">Login to see more</h4>
      </div>
      <p className="text-themeTealLight mb-4">
        Get access to exclusive content and detailed insights by logging into your account.
      </p>
      <div className="flex gap-3">
        <Button 
          text="Login" 
          color="themeTeal" 
          variant="solid" 
          size="md" 
          href="/login"
          className="rounded"
        />
        <Button 
          text="Register" 
          color="skyblue" 
          variant="solid" 
          size="md" 
          href="/register"
          className="rounded"
        />
      </div>
    </div>
  );
}

function MetaRow({ item }: { item: MarketInsight }) {
  return (
    <div className="flex items-center gap-3 text-xs text-themeTealLighter">
      <time dateTime={item.created_at} className="inline-flex items-center gap-1">
        <CalendarDays className="h-3 w-3" /> {fmt(item.created_at)}
      </time>
      <span>•</span>
      <span className="uppercase tracking-wide text-themeTealLighter">{item.InsightSector?.name || 'General'}</span>
      {item.InsightTopic && (
        <>
          <span>•</span>
          <span>{item.InsightTopic.name}</span>
        </>
      )}
    </div>
  );
}

function RightSidebar({ highDemandStocks, relatedInsights }: { highDemandStocks: HighDemandStock[], relatedInsights: MarketInsight[] }) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <HighDemandStocks 
        title="High Demand Stocks" 
        items={highDemandStocks}
        autoplayMs={5000}
        singleSlide={true}
      />

      <div className="rounded bg-themeTealWhite p-4">
        <p className="text-themeTeal font-semibold mb-4 text-lg">Related Insights</p>
        <ul className="space-y-4 divide-y divide-themeTealLighter">
          {relatedInsights.slice(0, 3).map((r) => (
            <li key={r.id} className="py-4">
                <Link href={`/market-insights/${r.slug}`} className="block text-themeTeal hover:text-themeSkyBlue transition">
                <span className="uppercase text-sm text-themeTealLighter">{r.InsightSector?.name || 'General'}</span>
                    <div className="text-md my-2 font-medium">{r.title}</div>
                <div className="text-sm text-themeTealLight">{fmt(r.created_at)}</div>
                </Link>
            </li>
            ))}
        </ul>
      </div>

      <div className="rounded bg-themeTeal p-5 text-themeTealWhite text-center">
        <p className="text-2xl mb-3">Talk to an Expert</p>
        <p className="text-5xl font-serif mb-4">Explore our personalized service</p>
        <Button text="Get in Touch" color="skyblue" variant="solid" size="md" href='/contact' className="rounded py-4"/>
      </div>
    </aside>
  );
}

// ---------- Page ----------
export default function MarketInsightDetailPage() {
  const route = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(route?.slug) ? route.slug[0] : (route?.slug as string | undefined);
  
  const [marketInsight, setMarketInsight] = useState<MarketInsight | null>(null);
  const [relatedInsights, setRelatedInsights] = useState<MarketInsight[]>([]);
  const [highDemandStocks, setHighDemandStocks] = useState<HighDemandStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the main insight
        const insightRes = await fetch(`/api/market-insights/${slug}`);
        const insightData = await insightRes.json();
        
        if (!insightData.success) {
          setError('Insight not found');
          return;
        }
        
        setMarketInsight(insightData.data);
        
        // Fetch related insights (same topic, featured)
        if (insightData.data.insight_topic_id) {
          const relatedRes = await fetch(`/api/market-insights?topic=${insightData.data.insight_topic_id}&featured=true&limit=3`);
          const relatedData = await relatedRes.json();
          
          if (relatedData.success) {
            // Filter out current insight
            const filtered = relatedData.data.filter((item: MarketInsight) => item.id !== insightData.data.id);
            setRelatedInsights(filtered);
          }
        }
        
        // Fetch high demand stocks from API
        try {
          const stocksRes = await fetch('/api/stocks/home-display');
          const stocksData = await stocksRes.json();
          
          if (stocksData.success) {
            // Filter for high demand stocks and transform data
            const highDemandStocks = stocksData.data.stocks
              .filter((stock: any) => stock.demand === 'High Demand')
              .map((stock: any) => ({
                id: stock.id?.toString() || '0',
                name: stock.company_name || 'Unknown',
                logo: stock.logo || '',
                changeINR: stock.price_change?.toString() || '0',
                changePct: stock.percentage_change?.toString() || '0',
                price: stock.price_per_share?.toString() || '0',
                valuation: stock.valuation || 'N/A',
                priceChangePeriod: stock.price_change_period || 'N/A'
              }));
            setHighDemandStocks(highDemandStocks);
          }
        } catch (error) {
          console.error('Error fetching high demand stocks:', error);
          // Fallback to empty array if API fails
          setHighDemandStocks([]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load insight');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="px-6 py-3 bg-themeTealWhite">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Market Insights" }, { label: "Loading..." }]} />
        </div>
        <div className="appContainer py-8">
          <div className="text-center py-8 text-themeTealLighter">Loading...</div>
        </div>
      </main>
    );
  }

  if (error || !marketInsight) {
    return (
      <main className="min-h-screen">
        <div className="px-6 py-3 bg-themeTealWhite">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Market Insights" }, { label: "Not Found" }]} />
        </div>
        <div className="appContainer py-8">
          <div className="text-center py-8 text-themeTealLighter">{error || 'Insight not found'}</div>
        </div>
      </main>
    );
  }

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Market Insights", href: "/market-insights" },
    { label: marketInsight.title },
  ];


  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="px-6 py-3">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Search Box */}
      <div className="px-6 py-4 bg-themeTealWhite">
        <div className="appContainer">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLight" />
            <input
              type="text"
              placeholder="Search market insights..."
              className="w-full rounded text-themeTeal pl-10 pr-3 py-2.5 outline-none ring-1 ring-themeTealLighter focus:ring-themeTeal transition duration-500"
            />
          </div>
        </div>
      </div>

      {/* Hero */}
      {/* <section className="py-8 bg-themeTealWhite flex justify-center">
        <Image src={marketInsight.blog_image} alt={marketInsight.title} width={800} height={400} className="object-cover rounded" />
      </section> */}

      {/* Body + Sidebar */}
      <section className="appContainer py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-8">
            <MetaRow item={marketInsight} />
            <Heading as="h3" className="mt-2 mb-4 font-semibold text-themeTeal">{marketInsight.title}</Heading>

            <div className="text-themeTealLight">
              {/* Content based on type */}
              {marketInsight.content_type === 'TEXT' ? (
                <>
                  {marketInsight.first_part && (
                    <div 
                      className="mb-4 prose prose-sm max-w-none prose-headings:text-themeTeal prose-p:text-themeTealLight prose-strong:text-themeTeal prose-a:text-themeSkyBlue prose-ul:text-themeTealLight prose-ol:text-themeTealLight"
                      dangerouslySetInnerHTML={{ __html: marketInsight.first_part }}
                    />
                  )}
                  {marketInsight.second_part && (
                    <>
                      {isAuthenticated ? (
                        <div 
                          className="mb-4 prose prose-sm max-w-none prose-headings:text-themeTeal prose-p:text-themeTealLight prose-strong:text-themeTeal prose-a:text-themeSkyBlue prose-ul:text-themeTealLight prose-ol:text-themeTealLight"
                          dangerouslySetInnerHTML={{ __html: marketInsight.second_part }}
                        />
                      ) : (
                        <LoginPrompt />
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="mb-4">
                  {marketInsight.video_file ? (
                    /* S3 Video File */
                    <video 
                      src={marketInsight.video_file} 
                      controls 
                      className="w-full rounded"
                      style={{ maxHeight: '400px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : marketInsight.video_url ? (
                    /* YouTube Video URL */
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        src={getYouTubeEmbedUrl(marketInsight.video_url)}
                        title={marketInsight.title}
                        className="absolute top-0 left-0 w-full h-full rounded"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 bg-gray-100 rounded">
                      No video content available
                    </div>
                  )}
                </div>
              )}
            </div>

          </article>

          <div className="lg:col-span-4">
            <RightSidebar highDemandStocks={highDemandStocks} relatedInsights={relatedInsights} />
          </div>
        </div>

        {/* Related */}
        {relatedInsights.length > 0 && (
        <div className="mt-12">
            <RelatedCarousel 
              items={relatedInsights.map(item => ({
                slug: item.slug,
                title: item.title,
                dateISO: item.created_at,
                hero: item.blog_image,
                type: item.content_type === 'TEXT' ? 'Guide' : 'Article'
              }))} 
            />
        </div>
        )}
      </section>
    </main>
  );
}