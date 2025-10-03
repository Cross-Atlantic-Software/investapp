'use client';
import { Section, SectionNav, ShareIntro, TradeTabsShell } from "@/components/shares";
import { FaqSection, FinancialPerformanceSection, InvestmentRationaleSection, NewsSection, PerformanceBenchmarkSection, PriceChartSection, ScorecardSection, SectorOutlookSection, ShareholdingSection } from "@/components/shares/sections";
import PriceChart from "@/components/shares/PriceChart";
// Removed unused section imports since we only display stock details from our schema
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { id: "stock-details", label: "Stock Details" },
];

interface StockData {
  id: string;
  company_name: string;
  logo: string;
  price_per_share: number;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
  founded: number;
  sector: string;
  subsector: string;
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

export default function UnlistedCompanyDetails() {
  const params = useParams();
  const companyName = params.name as string;
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            teaser: stock.teaser,
            short_description: stock.short_description,
            analysis: stock.analysis,
            founded: typeof stock.founded === 'string' ? parseInt(stock.founded) : stock.founded,
            sector: stock.sector,
            subsector: stock.subsector,
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
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Invest", href: "/invest" },
          { label: `Buy and sell ${stockData.company_name}` }
        ]}
        logoUrl={stockData.logo}
        company={stockData.company_name}
        investPrice={stockData.price_per_share}
        changeAbs={stockData.price_change}
        changePct={0}
        updatedAt={stockData.updatedAt ? new Date(stockData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Recently"}
        tags={stockData.stock_masters?.map(master => master.name) || []}
        founded={stockData.founded}
        sector={stockData.sector}
        subsector={stockData.subsector}
        hq={stockData.headquarters}
        about={stockData.short_description}
        website={`${stockData.company_name.toLowerCase().replace(/\s+/g, '')}.com`}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)] p-6">
        {/* LEFT: content */}
        <div className="min-w-0 space-y-6">
          <SectionNav items={NAV} offset={88} />

          <div className="space-y-6">
          <Section id="price" title="Price Chart" info="Intraday private-market price. Delayed. Not investment advice."><PriceChartSection /></Section>
            <Section id="score" title="Scorecard" info="Intraday private-market price. Delayed. Not investment advice."><ScorecardSection /></Section>
            <Section id="rationale" title="Investment Rationale" info="Intraday private-market price. Delayed. Not investment advice."><InvestmentRationaleSection /></Section>
            <Section id="bench" title="Performance Benchmark" info="Intraday private-market price. Delayed. Not investment advice."><PerformanceBenchmarkSection /></Section>
            <Section id="outlook" title="Sector Outlook" info="Intraday private-market price. Delayed. Not investment advice."><SectorOutlookSection /></Section>
            <Section id="financials" title="Financial Performance" info="Intraday private-market price. Delayed. Not investment advice."><FinancialPerformanceSection /></Section>
            <Section id="holders" title="Shareholding" info="Intraday private-market price. Delayed. Not investment advice."><ShareholdingSection /></Section>
            <Section id="news" title="News Related to Company" info="Intraday private-market price. Delayed. Not investment advice."><NewsSection /></Section>
            <Section id="faq" title="Frequently Asked Questions" info="Intraday private-market price. Delayed. Not investment advice."><FaqSection /></Section>
            <Section id="stock-details" title="Company Analysis">
              <div>
                  {/* Analysis */}
                  <div className="space-y-2">
                    {/* <h3 className="text-lg font-semibold text-gray-900">Analysis</h3> */}
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: stockData.analysis || '' }}
                    />
                  </div>
                </div>
            </Section>

            {/* Price Chart Section */}
            <PriceChart
              stockId={parseInt(stockData.id)}
              stockName={stockData.company_name}
              currentPrice={stockData.price_per_share}
              priceChange={stockData.price_change}
              percentageChange={stockData.price_change / stockData.price_per_share * 100}
            />
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
