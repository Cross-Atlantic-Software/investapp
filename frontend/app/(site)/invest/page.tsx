'use client';
import { PageTitle } from '@/components/containers';
import { FilterSidebar, ProductList } from '@/components/subcomponents';
import { ProductItem } from '@/components/subcomponents/productsList';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { FilterState } from '@/components/subcomponents/filterssidebar';

export default function Invest() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stocks, setStocks] = useState<ProductItem[]>([]);
  const [allStocks, setAllStocks] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    valuation: [],
    filingStatusAttractiveness: [],
    sectors: [],
    subsectors: [],
    themes: [],
  });
  
  // State for valuation mapping
  const [valuationMapping, setValuationMapping] = useState<any[]>([]);

  // Fetch valuation mapping
  const fetchValuationMapping = useCallback(async () => {
    try {
      console.log('🔄 Fetching valuation mapping...');
      const response = await fetch('/api/admin/valuation-mapping');
      const data = await response.json();
      
      console.log('📡 Valuation mapping response:', data);
      
      if (data.success && data.data?.mapping) {
        console.log('✅ Setting valuation mapping:', data.data.mapping);
        setValuationMapping(data.data.mapping);
      } else {
        console.log('❌ Failed to fetch valuation mapping:', data);
      }
    } catch (error) {
      console.error('Error fetching valuation mapping:', error);
    }
  }, []);

  // Function to map backend data to frontend format
  const mapStockToProduct = useCallback((stock: {
    id: number;
    company_name: string;
    logo: string;
    price_per_share: number;
    price_change: number;
    price_change_period_id?: number;
    price_change_period?: string;
    valuation_id?: number;
    valuation?: string;
    teaser: string;
    short_description: string;
    analysis: string;
    sector_ids?: string;
    subsector_ids?: string;
    theme_ids?: string;
    stock_master_ids?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): ProductItem & { valuation_id?: number; sector_ids?: string; subsector_ids?: string; theme_ids?: string; stock_master_ids?: string; price_change_period_id?: number | undefined } => {
    return {
      id: stock.id.toString(),
      company_name: stock.company_name,
      logo: stock.logo,
      price_per_share: typeof stock.price_per_share === 'string' ? parseFloat(stock.price_per_share) : stock.price_per_share,
      price_change: typeof stock.price_change === 'string' ? parseFloat(stock.price_change) : stock.price_change,
      price_change_period_id: stock.price_change_period_id || undefined, // No default
      price_change_period: stock.price_change_period, // Optional for backward compatibility
      valuation: stock.valuation || 'N/A',
      valuation_id: stock.valuation_id,
      teaser: stock.teaser,
      short_description: stock.short_description,
      analysis: stock.analysis,
      sector_ids: stock.sector_ids,
      subsector_ids: stock.subsector_ids,
      theme_ids: stock.theme_ids,
      stock_master_ids: stock.stock_master_ids,
      createdAt: stock.createdAt?.toString(),
      updatedAt: stock.updatedAt?.toString()
    };
  }, []);

  // Fetch stocks from API
  const fetchStocks = useCallback(async (searchQuery = '', filters: FilterState | null = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: '1',
        limit: '50', // Get more stocks for better user experience
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Add filter parameters
      if (filters) {
        if (filters.valuation.length > 0) {
          params.append('valuation', filters.valuation.join(','));
        }
        if (filters.sectors.length > 0) {
          params.append('sectors', filters.sectors.join(','));
        }
        if (filters.subsectors.length > 0) {
          params.append('subsectors', filters.subsectors.join(','));
        }
        if (filters.themes.length > 0) {
          params.append('themes', filters.themes.join(','));
        }
        if (filters.filingStatusAttractiveness.length > 0) {
          params.append('stock_master_ids', filters.filingStatusAttractiveness.join(','));
        }
      }
      
      console.log('🔍 API DEBUG - Fetching stocks with params:', params.toString());
      
      const response = await fetch(`/api/stocks?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.data?.stocks) {
        const mappedStocks = data.data.stocks.map(mapStockToProduct);
        console.log('🔍 API DEBUG - Received stocks:', mappedStocks.length);
        setAllStocks(mappedStocks);
        setStocks(mappedStocks);
      } else {
        setError(data.message || 'Failed to fetch stocks');
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Failed to fetch stocks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mapStockToProduct]);

  // Apply filters
  const applyFilters = useCallback((filters: FilterState) => {
    console.log('🔍 FILTER DEBUG - Applying filters:', filters);
    setActiveFilters(filters);
    
    // Call API with filters instead of client-side filtering
    fetchStocks(searchTerm, filters);
    setShowFilters(false); // Close mobile filter drawer
  }, [fetchStocks, searchTerm]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const emptyFilters = {
      valuation: [],
      filingStatusAttractiveness: [],
      sectors: [],
      subsectors: [],
      themes: [],
    };
    setActiveFilters(emptyFilters);
    // Call API without filters
    fetchStocks(searchTerm, emptyFilters);
  }, [fetchStocks, searchTerm]);

  useEffect(() => {
    if (!showFilters) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowFilters(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFilters]);

  // Load valuation mapping on component mount
  useEffect(() => {
    fetchValuationMapping();
  }, [fetchValuationMapping]);

  // Handle search and filters with debouncing (includes initial load)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Use current active filters when searching
      fetchStocks(searchTerm, activeFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeFilters, fetchStocks]);

  const filtered = useMemo(() => {
    // Since we're filtering on the backend, just return the stocks as-is
    return stocks;
  }, [stocks]);

  return (
    <>
      <PageTitle
        heading="Explore Investment Opportunities"
        description="Find the best opportunities in the private market to diversify and grow your investments."
        {...(!isAuthenticated && {
          linkText: "Sign up to Learn More",
          linkHref: "/register/step-1"
        })}
      />

      <section className="appContainer py-8 md:py-12">
        {/* layout */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[max-content_minmax(0,1fr)]">
          {/* left column: desktop sidebar */}
          <aside className="hidden md:block md:w-auto md:max-w-max md:justify-self-start">
            <FilterSidebar onApplyFilters={applyFilters} onClearFilters={clearFilters} stockData={allStocks} />
          </aside>

          {/* right column: results */}
          <main className="min-w-0">
            {/* header row: consistent on all screens */}
            <div className="mb-4">
                {/* row: mobile → heading left, Filters right; desktop → heading left, search right */}
                <div className="flex items-center justify-between md:grid md:grid-cols-[1fr_auto] md:gap-3">

                    {/* Filters toggle (mobile only) */}
                    <button
                    type="button"
                    onClick={() => setShowFilters(v => !v)}
                    className="inline-flex items-center gap-2 rounded-sm border border-themeTealLighter px-3 py-2 text-sm text-themeTeal md:hidden cursor-pointer"
                    aria-expanded={showFilters}
                    aria-pressed={showFilters}
                    >
                    {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
                    {showFilters ? "Close" : "Filters"}
                    </button>

                    {/* Search input (desktop only in this row) */}
                    <div className="hidden lg:block lg:w-96 lg:justify-self-end">
                        <div className="flex items-center border border-themeTealLighter rounded-md px-3 py-2 w-full">
                            <Search className="text-themeTealLighter mr-3 shrink-0" size={20} />
                            <input
                            type="text"
                            placeholder="Search companies, sectors, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-1 outline-none bg-transparent text-themeTeal text-base"
                            />
                        </div>
                    </div>
                </div>

                {/* Search input (mobile full-width below row) */}
                <div className="mt-3 md:hidden">
                    <div className="flex items-center border border-themeTealLighter rounded-md px-3 py-2 w-full">
                        <Search className="text-themeTealLighter mr-3 shrink-0" size={20} />
                        <input
                            type="text"
                            placeholder="Search companies, sectors, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-1 outline-none bg-transparent text-themeTeal text-base"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-themeTeal">Loading stocks...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-600">{error}</div>
              </div>
            ) : (
              <ProductList items={filtered} pageSize={5} />
            )}
          </main>
        </div>

        {/* mobile drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-themeTealWhite shadow-xl overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-themeTeal bg-white">
                <span className="text-lg font-semibold text-themeTeal">Filter Results</span>
                <button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters" className="p-1.5 rounded-md hover:bg-slate-100 cursor-pointer">
                  <X className="h-5 w-5 text-themeTeal" />
                </button>
              </div>
              <div>
                <FilterSidebar onApplyFilters={applyFilters} onClearFilters={clearFilters} stockData={allStocks} />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
