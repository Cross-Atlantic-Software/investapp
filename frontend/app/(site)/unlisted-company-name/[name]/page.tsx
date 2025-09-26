'use client';
import { Section, ShareIntro, TradeTabsShell } from "@/components/shares";
// Removed unused section imports since we only display stock details from our schema
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// const NAV = [
//   { id: "stock-details", label: "Stock Details" },
// ];

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
        tags={["Most Active", "Upcoming IPO", "Unicorn"]}
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
          {/* <SectionNav items={NAV} offset={88} /> */}

          <div className="space-y-6">
            <Section id="stock-details" title="Company Analysis">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-6">
                  {/* Company Logo and Name */}
                  {/* <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden">
                      <Image src={stockData.logo} alt={`${stockData.company_name} logo`} width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{stockData.company_name}</h2>
                      <p className="text-gray-600">Stock ID: {stockData.id}</p>
                    </div>
                  </div> */}

                  {/* Price Information */}
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div> */}

                  {/* Teaser */}
                  {/* <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Teaser</h3>
                    <p className="text-gray-700 text-lg">{stockData.teaser}</p>
                  </div> */}

                  {/* Short Description */}
                  {/* <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Short Description</h3>
                    <div 
                      className="text-gray-700 prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: stockData.short_description || '' }}
                    />
                  </div> */}

                  {/* Analysis */}
                  <div className="space-y-2">
                    {/* <h3 className="text-lg font-semibold text-gray-900">Analysis</h3> */}
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: stockData.analysis || '' }}
                    />
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
            priceINR={stockData.price_per_share}
            settlementDate="Aug 21, 2025"
            minUnits={300}
            lotSize={300}
          />
        </aside>
      </div>

    </>
  );
}
