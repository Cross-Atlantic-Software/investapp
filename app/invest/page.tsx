'use client';
import { PageTitle } from '@/components/containers';
import { FilterSidebar, ProductList } from '@/components/subcomponents';
import { Heading } from '@/components/ui';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const PRODUCTS = [
    { id: 'anth', name: 'Anthropic', symbol: 'ANTH', sector: 'Fintech', description: 'Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.', priceINR: 350.92, changePct: 0.05, volumeThousands: 82752, graphImg: '/images/price-up-graph.svg', logoUrl: '/images/anthropic.png' },
    { id: 'anth1', name: 'Anthropic', symbol: 'ANTH', sector: 'Fintech', description: 'Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.', priceINR: 350.92, changePct: 0.05, volumeThousands: 82752, graphImg: '/images/price-up-graph.svg', logoUrl: '/images/anthropic.png' },
    { id: 'anth2', name: 'Anthropic', symbol: 'ANTH', sector: 'Fintech', description: 'Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.', priceINR: 350.92, changePct: 0.05, volumeThousands: 82752, graphImg: '/images/price-up-graph.svg', logoUrl: '/images/anthropic.png' },
    { id: 'anth3', name: 'Anthropic', symbol: 'ANTH', sector: 'Fintech', description: 'Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.', priceINR: 350.92, changePct: 0.05, volumeThousands: 82752, graphImg: '/images/price-up-graph.svg', logoUrl: '/images/anthropic.png' },
    { id: 'anth4', name: 'Anthropic', symbol: 'ANTH', sector: 'Fintech', description: 'Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.', priceINR: 350.92, changePct: 0.05, volumeThousands: 82752, graphImg: '/images/price-up-graph.svg', logoUrl: '/images/anthropic.png' },
    { id: 'anth5', name: 'Anthropic', symbol: 'ANTH', sector: 'Fintech', description: 'Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.', priceINR: 350.92, changePct: 0.05, volumeThousands: 82752, graphImg: '/images/price-up-graph.svg', logoUrl: '/images/anthropic.png' },
    { id: 'anth6', name: 'Anthropic', symbol: 'ANTH', sector: 'Fintech', description: 'Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.', priceINR: 350.92, changePct: 0.05, volumeThousands: 82752, graphImg: '/images/price-up-graph.svg', logoUrl: '/images/anthropic.png' },
];

export default function Invest() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!showFilters) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowFilters(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFilters]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(
      x =>
        x.name.toLowerCase().includes(q) ||
        x.symbol.toLowerCase().includes(q) ||
        x.sector.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  return (
    <>
      <PageTitle
        heading="Explore Our Investment Opportunities"
        description="Find the best opportunities in the private market to diversify and grow your investments."
        linkText="Sign up to Learn More"
        linkHref="#"
      />

      <section className="appContainer py-8 md:py-12">
        {/* layout */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[max-content_minmax(0,1fr)]">
          {/* left column: desktop sidebar */}
          <aside className="hidden md:block md:w-auto md:max-w-max md:justify-self-start">
            <FilterSidebar />
          </aside>

          {/* right column: results */}
          <main className="min-w-0">
            {/* header row: consistent on all screens */}
            <div className="mb-4">
                {/* row: mobile → heading left, Filters right; desktop → heading left, search right */}
                <div className="flex items-center justify-between md:grid md:grid-cols-[1fr_auto] md:gap-3">
                    <Heading as="h5" className="font-semibold">Search Results</Heading>

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
                    <div className="hidden lg:block lg:w-80 lg:justify-self-end">
                        <div className="flex items-center border border-themeTealLighter rounded-md px-2 py-1.5 w-full">
                            <Search className="text-themeTealLighter mr-2 shrink-0" size={18} />
                            <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-1.5 outline-none bg-transparent text-themeTeal"
                            />
                        </div>
                    </div>
                </div>

                {/* Search input (mobile full-width below row) */}
                <div className="mt-3 md:hidden">
                    <div className="flex items-center border border-themeTealLighter rounded-md px-2 py-1.5 w-full">
                        <Search className="text-themeTealLighter mr-2 shrink-0" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-1.5 outline-none bg-transparent text-themeTeal"
                        />
                    </div>
                </div>
            </div>

            <ProductList items={filtered} pageSize={5} />
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
                <FilterSidebar />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
