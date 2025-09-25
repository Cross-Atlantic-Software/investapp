'use client';
import { Section, SectionNav, ShareIntro, TradeTabsShell } from "@/components/shares";
// Removed unused section imports since we only display stock details from our schema
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
const NAV = [
  { id: "stock-details", label: "Stock Details" },
];
interface StockData {
  id: string;
  company_name: string;
  logo: string;
  price: number;
  price_change: number;
  teaser: string;
  short_description: string;
  analysis: string;
  createdAt?: string;
  updatedAt?: string;
}

function DiscoverDetailsContent() {
  const searchParams = useSearchParams();
  const stockId = searchParams.get('stock');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!stockId) {
        setError('No stock ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/${stockId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Map the backend data to frontend format
          const stock = data.data;
          const mappedStock: StockData = {
            id: stock.id.toString(),
            company_name: stock.company_name,
            logo: stock.logo,
            price: typeof stock.price === 'string' ? parseFloat(stock.price) : stock.price,
            price_change: typeof stock.price_change === 'string' ? parseFloat(stock.price_change) : stock.price_change,
            teaser: stock.teaser,
            short_description: stock.short_description,
            analysis: stock.analysis,
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
  }, [stockId]);

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
        investPrice={stockData.price}
        changeAbs={stockData.price_change}
        changePct={0}
        updatedAt={stockData.updatedAt ? new Date(stockData.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Recently"}
        tags={["Most Active", "Upcoming IPO", "Unicorn"]}
        founded={1998}
        sector="Technology"
        subsector="Technology"
        hq="Noida, Uttar Pradesh"
        about={stockData.short_description}
        website={`${stockData.company_name.toLowerCase().replace(/\s+/g, '')}.com`}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)] p-6">
        {/* LEFT: content */}
        <div className="min-w-0 space-y-6">
          {/* <SectionNav items={NAV} offset={88} /> */}

          <div className="space-y-6">
            {/* <Section id="price" title="Price Chart" info="Intraday private-market price. Delayed. Not investment advice."><PriceChartSection /></Section> */}
            {/* <Section id="score" title="Scorecard" info="Intraday private-market price. Delayed. Not investment advice."><ScorecardSection /></Section> */}
            {/* <Section id="rationale" title="Investment Rationale" info="Intraday private-market price. Delayed. Not investment advice."><InvestmentRationaleSection /></Section> */}
            {/* <Section id="bench" title="Performance Benchmark" info="Intraday private-market price. Delayed. Not investment advice."><PerformanceBenchmarkSection /></Section> */}
            {/* <Section id="outlook" title="Sector Outlook" info="Intraday private-market price. Delayed. Not investment advice."><SectorOutlookSection /></Section> */}
            {/* <Section id="financials" title="Financial Performance" info="Intraday private-market price. Delayed. Not investment advice."><FinancialPerformanceSection /></Section> */}
            {/* <Section id="holders" title="Shareholding" info="Intraday private-market price. Delayed. Not investment advice."><ShareholdingSection /></Section> */}
            {/* <Section id="news" title="News Related to Company" info="Intraday private-market price. Delayed. Not investment advice."><NewsSection /></Section> */}
            {/* <Section id="faq" title="Frequently Asked Questions" info="Intraday private-market price. Delayed. Not investment advice."><FaqSection /></Section> */}
            <Section id="stock-details" title="Stock Details" info="Real-time stock information from our database.">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  {/* Company Logo and Name */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden">
                      <Image src={stockData.logo} alt={`${stockData.company_name} logo`} width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{stockData.company_name}</h2>
                      <p className="text-gray-600">Stock ID: {stockData.id}</p>
                    </div>
                  </div>

                  {/* Price Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Price Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Price:</span>
                          <span className="font-medium text-green-600">₹{stockData.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price Change:</span>
                          <span className={`font-medium ${stockData.price_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stockData.price_change >= 0 ? '+' : ''}₹{stockData.price_change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Timestamps</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium text-sm">
                            {stockData.createdAt ? new Date(stockData.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium text-sm">
                            {stockData.updatedAt ? new Date(stockData.updatedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Teaser */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Teaser</h3>
                    <p className="text-gray-700 text-lg">{stockData.teaser}</p>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Short Description</h3>
                    <p className="text-gray-700">{stockData.short_description}</p>
                  </div>

                  {/* Analysis */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Analysis</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{stockData.analysis}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* RIGHT: sticky, scrollable sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] overflow-y-auto">
          <TradeTabsShell
            company={stockData.company_name}
            priceINR={stockData.price}
            settlementDate="Aug 21, 2025"
            minUnits={300}
            lotSize={300}
          />
        </aside>
      </div>

    </>
  );
}

export default function DiscoverDetails() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto"></div>
          <p className="mt-2 text-themeTealLighter">Loading stock details...</p>
        </div>
      </div>
    }>
      <DiscoverDetailsContent />
    </Suspense>
  );
}
