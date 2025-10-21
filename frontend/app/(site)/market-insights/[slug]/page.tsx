"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import Breadcrumbs, { type Crumb } from "@/components/subcomponents/breadcrumbs";
import { Button, Heading } from "@/components/ui";
import Image from "next/image";
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

// ---------- Components ----------
function MetaRow({ item }: { item: MarketInsight }) {
  return (
    <div className="flex items-center gap-3 text-xs text-themeTealLighter">
      <time dateTime={item.created_at} className="inline-flex items-center gap-1">
        <CalendarDays className="h-3 w-3" /> {fmt(item.created_at)}
      </time>
      <span>•</span>
      <span className="uppercase tracking-wide text-themeTealLighter">{item.content_type === 'TEXT' ? 'Article' : 'Guide'}</span>
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
                <span className="uppercase text-sm text-themeTealLighter">{r.content_type === 'TEXT' ? 'Article' : 'Guide'}</span>
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

      {/* Hero */}
      <section className="py-8 bg-themeTealWhite flex justify-center">
        <Image src={marketInsight.blog_image} alt={marketInsight.title} width={800} height={400} className="object-cover rounded" />
      </section>

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
                    <p className="mb-4">{marketInsight.first_part}</p>
                  )}
                  {marketInsight.second_part && (
                    <p className="mb-4">{marketInsight.second_part}</p>
                  )}
                </>
              ) : (
                marketInsight.video_file && (
                  <div className="mb-4">
                    <video 
                      src={marketInsight.video_file} 
                      controls 
                      className="w-full rounded"
                      style={{ maxHeight: '400px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )
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