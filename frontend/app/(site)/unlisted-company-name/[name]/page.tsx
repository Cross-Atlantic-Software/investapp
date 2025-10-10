'use client';
import { Section, SectionNav, ShareIntro, TradeTabsShell } from "@/components/shares";
import { FaqSection, FinancialPerformanceSection, InvestmentRationaleSection, NewsSection, PerformanceBenchmarkSection, PriceChart, ScorecardSection, SectorOutlookSection, ShareholdingSection } from "@/components/shares/sections";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { id: "price", label: "Price Chart" },
  { id: "score", label: "Signal Analyzer" },
  { id: "rationale", label: "Investment Rationale" },
  { id: "bench", label: "Competitive Benchmarking" },
  { id: "outlook", label: "SWOT & Porter Analysis" },
  { id: "financials", label: "Financial Performance" },
  { id: "holders", label: "Shareholding" },
  { id: "news", label: "Related News" },
  { id: "faq", label: "Frequently Asked Questions" },
];

interface StockData {
  id: string;
  company_name: string;
  logo: string;
  price_per_share: number;
  price_change: number;
  valuation: string;
  teaser: string;
  short_description: string;
  analysis: string;
  founded: number;
  sector_ids: number[];
  subsector_ids: number[];
  sectors?: Array<{
    id: number;
    name: string;
  }>;
  subsectors?: Array<{
    id: number;
    name: string;
    sector_id: number;
  }>;
  headquarters: string;
  min_units: number;
  lot_size: number;
  stock_masters?: Array<{
    id: number;
    name: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

interface MethodologyNote {
  id: number;
  section_key: string;
  section_name: string;
  methodology_text: string;
  is_active: boolean;
}

export default function UnlistedCompanyDetails() {
  const params = useParams();
  const companyName = params.name as string;
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [methodologyNotes, setMethodologyNotes] = useState<MethodologyNote[]>([]);

  const fetchMethodologyNotes = async () => {
    try {
      const response = await fetch('/api/methodology-notes');
      const data = await response.json();
      
      if (data.success && data.data) {
        setMethodologyNotes(data.data);
      }
    } catch (err) {
      console.error('Error fetching methodology notes:', err);
    }
  };

  const getMethodologyText = (sectionKey: string): string => {
    const note = methodologyNotes.find(note => note.section_key === sectionKey);
    return note ? note.methodology_text : 'Intraday private-market price. Delayed. Not investment advice.';
  };

  useEffect(() => {
    const fetchStockData = async () => {
      if (!companyName) {
        setError('No company name provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/name/${encodeURIComponent(companyName)}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Map the backend data to frontend format
          const stock = data.data;
          const mappedStock: StockData = {
            id: stock.id.toString(),
            company_name: stock.company_name,
            logo: stock.logo,
            price_per_share: typeof stock.price_per_share === 'string' ? parseFloat(stock.price_per_share) : stock.price_per_share,
            price_change: typeof stock.price_change === 'string' ? parseFloat(stock.price_change) : stock.price_change,
            valuation: stock.valuation || '0',
            teaser: stock.teaser,
            short_description: stock.short_description,
            analysis: stock.analysis,
            founded: typeof stock.founded === 'string' ? parseInt(stock.founded) : stock.founded,
            sector_ids: Array.isArray(stock.sector_ids) ? stock.sector_ids : [],
            subsector_ids: Array.isArray(stock.subsector_ids) ? stock.subsector_ids : [],
            sectors: stock.sectors || [],
            subsectors: stock.subsectors || [],
            headquarters: stock.headquarters,
            min_units: typeof stock.min_units === 'string' ? parseInt(stock.min_units) : stock.min_units,
            lot_size: typeof stock.lot_size === 'string' ? parseInt(stock.lot_size) : stock.lot_size,
            stock_masters: stock.stock_masters || [],
            createdAt: stock.createdAt?.toString(),
            updatedAt: stock.updatedAt?.toString()
          };
          setStockData(mappedStock);
        } else {
          setError(data.message || 'Failed to fetch stock data');
        }
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch stock data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    fetchMethodologyNotes();
  }, [companyName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-themeTeal">Loading stock details...</div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'Stock not found'}</div>
      </div>
    );
  }

  return (
    <>
      <ShareIntro
        stockId={stockData.id}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Invest", href: "/invest" },
          { label: `Buy and sell ${stockData.company_name}` }
        ]}
        logoUrl={stockData.logo}
        company={stockData.company_name}
        investPrice={stockData.price_per_share}
        changeAbs={stockData.price_change}
        updatedAt={stockData.updatedAt ? new Date(stockData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Recently"}
        tags={stockData.stock_masters?.map(master => master.name) || []}
        founded={stockData.founded}
        sector={stockData.sectors?.map(s => s.name).join(', ') || 'No sectors assigned'}
        subsector={stockData.subsectors?.map(s => s.name).join(', ') || 'No subsectors assigned'}
        hq={stockData.headquarters}
        about={stockData.short_description}
        website={`${stockData.company_name.toLowerCase().replace(/\s+/g, '')}.com`}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)] p-6">
        {/* LEFT: content */}
        <div className="min-w-0 space-y-6">
          <SectionNav items={NAV} offset={88} />

          <div className="space-y-6">
            <Section id="price" title="Price Chart" info={getMethodologyText('price')}>
              <PriceChart
                stockId={parseInt(stockData.id)}
                stockName={stockData.company_name}
                currentPrice={stockData.price_per_share}
                priceChange={stockData.price_change}
                percentageChange={stockData.price_change / stockData.price_per_share * 100}
              />
            </Section>
            <Section id="score" title="Signal Analyzer" info={getMethodologyText('score')}><ScorecardSection stockId={parseInt(stockData.id)} /></Section>
            <Section id="rationale" title="Investment Rationale" info={getMethodologyText('rationale')}><InvestmentRationaleSection stockId={parseInt(stockData.id)} /></Section>
            <Section id="bench" title="Competitive Benchmarking" info={getMethodologyText('bench')}><PerformanceBenchmarkSection stockId={parseInt(stockData.id)} /></Section>
            <Section id="outlook" title="SWOT & Porter Analysis" info={getMethodologyText('outlook')}><SectorOutlookSection stockId={parseInt(stockData.id)} /></Section>
            <Section id="financials" title="Financial Performance" info={getMethodologyText('financials')}><FinancialPerformanceSection stockId={stockData.id} /></Section>
            <Section id="holders" title="Shareholding" info={getMethodologyText('holders')}><ShareholdingSection stockId={stockData.id} /></Section>
            <Section id="news" title="Related News" info={getMethodologyText('news')}><NewsSection stockId={parseInt(stockData.id)} /></Section>
            <Section id="faq" title="Frequently Asked Questions" info={getMethodologyText('faq')}><FaqSection stockId={parseInt(stockData.id)} /></Section>
          </div>
        </div>

        {/* RIGHT: sticky, scrollable sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] overflow-y-auto">
          <TradeTabsShell
            company={stockData.company_name}
            priceINR={stockData.price_per_share}
            minUnits={stockData.min_units}
            lotSize={stockData.lot_size}
          />
        </aside>
      </div>

    </>
  );
}
