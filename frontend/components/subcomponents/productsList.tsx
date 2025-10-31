"use client";

import Image from "next/image";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ---------- types ---------- */
export type ProductItem = {
  id: string;
  company_name: string;
  logo: string;
  price_per_share: number;
  price_change: number;
  price_change_period_id: number | undefined;
  price_change_period?: string; // Optional for backward compatibility
  valuation: string;
  valuation_id?: number; // Added for filtering
  sector_ids?: string; // Added for filtering
  subsector_ids?: string; // Added for filtering
  theme_ids?: string; // Added for filtering
  sectors?: Array<{ id: number; name: string }>; // Optional sector names if provided by API
  sector?: string; // Optional single sector name fallback
  teaser: string;
  short_description: string;
  analysis: string;
  createdAt?: string;
  updatedAt?: string;
};

/* ---------- list with pagination ---------- */
export function ProductList({
  items,
  onWishlist,
  pageSize = 10,
  initialPage = 1,
}: {
  items: ProductItem[];
  onWishlist?: (id: string) => void;
  pageSize?: number;
  initialPage?: number;
}) {
  const [page, setPage] = useState(initialPage);
  const [sectorsMap, setSectorsMap] = useState<Record<number, string>>({});

  // Attempt to load sector names for mapping sector_ids -> names
  useEffect(() => {
    let cancelled = false;
    const loadSectors = async () => {
      try {
        const res = await fetch('/api/admin/sectors/select');
        if (!res.ok) return;
        const data = await res.json();
        const sectors = data?.data?.sectors || [];
        const map: Record<number, string> = {};
        sectors.forEach((s: { id: number; name: string }) => { map[s.id] = s.name; });
        if (!cancelled) setSectorsMap(map);
      } catch {}
    };
    loadSectors();
    return () => { cancelled = true; };
  }, []);

  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const start = (pageSafe - 1) * pageSize;
  const view = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);

  if (!items?.length) return null;

  return (
    <div className="space-y-3">
      {view.map((p) => (
        <ProductRow key={p.id} item={p} sectorsMap={sectorsMap} onWishlist={onWishlist} />
      ))}

      <Pagination
        page={pageSafe}
        totalPages={totalPages}
        onChange={(p) => setPage(p)}
      />
    </div>
  );
}

/* ---------- pagination ui ---------- */
function Pagination({
  page,
  totalPages,
  onChange,
  maxButtons = 5,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  maxButtons?: number;
}) {
  if (totalPages <= 1) return null;

  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <nav className="flex items-center justify-between gap-2 pt-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        className="inline-flex items-center gap-1 rounded-sm border border-themeTealLighter px-3 py-1.5 text-sm text-themeTeal disabled:opacity-40 cursor-pointer"
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>

      <div className="flex flex-wrap items-center gap-1">
        {start > 1 && (
          <>
            <PageBtn n={1} active={page === 1} onClick={onChange} />
            {start > 2 && <span className="px-1 text-themeTealLighter">…</span>}
          </>
        )}
        {nums.map((n) => (
          <PageBtn key={n} n={n} active={n === page} onClick={onChange} />
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-themeTealLighter">…</span>}
            <PageBtn n={totalPages} active={page === totalPages} onClick={onChange} />
          </>
        )}
      </div>

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="inline-flex items-center gap-1 rounded-sm border border-themeTealLighter px-3 py-1.5 text-sm text-themeTeal disabled:opacity-40 cursor-pointer"
        disabled={page === totalPages}
        aria-label="Next page"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageBtn({ n, active, onClick }: { n: number; active: boolean; onClick: (p: number) => void }) {
  return (
    <button
      onClick={() => onClick(n)}
      className={
        "h-8 min-w-8 px-2 rounded-md text-sm cursor-pointer " +
        (active
          ? "bg-themeTeal text-white"
          : "border border-themeTealLighter text-themeTeal hover:bg-white")
      }
      aria-current={active ? "page" : undefined}
    >
      {n}
    </button>
  );
}

/* ---------- row (unchanged from your mobile-friendly version) ---------- */
function ProductRow({ item, sectorsMap }: { item: ProductItem; sectorsMap: Record<number, string>; onWishlist?: (id: string) => void }) {
  const pos = item.price_change >= 0;
  const changeSign = pos ? "+" : "";
  const periodName = item.price_change_period || 'No period assigned';
  return (
    <article className="w-full rounded-xl bg-themeTealWhite p-2 md:p-3">
      <div className="flex flex-col gap-4 xl:flex-row md:items-center md:justify-between">
        <div className="flex gap-3 md:gap-4 items-center">
          <div className="h-14 w-14 md:h-20 md:w-20 shrink-0 rounded-lg bg-white grid place-items-center overflow-hidden">
            {item.logo && item.logo.trim() !== '' ? (
              <Image src={item.logo} alt={`${item.company_name} logo`} width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-semibold">
                {item.company_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 w-full">
            <h3 className="text-themeTeal font-semibold leading-tight truncate">
              <Link href={`/unlisted-company-name/${encodeURIComponent(item.company_name)}`} className="text-themeTeal font-semibold transition duration-500 hover:text-themeSkyBlue">
                {item.company_name}
              </Link>
            </h3>
            {(() => {
              let sectorName = (item.sectors && item.sectors.length > 0) ? item.sectors[0].name : (item.sector || '');
              if (!sectorName && item.sector_ids) {
                try {
                  const ids = JSON.parse(item.sector_ids);
                  if (Array.isArray(ids) && ids.length > 0) {
                    const name = sectorsMap[Number(ids[0])];
                    if (name) sectorName = name;
                  }
                } catch {}
              }
              return sectorName ? (
                <div className="mt-0.5 text-xs truncate text-themeTealLighter">{sectorName}</div>
              ) : null;
            })()}
            <p className="mt-1 text-sm text-themeTealLight line-clamp-3 md:line-clamp-1">{item.teaser}</p>

            {/* <div className="mt-2 flex justify-center md:hidden">
              <WishBtn onClick={() => onWishlist?.(item.id)} />
            </div> */}
          </div>
        </div>

        {/* <div className="hidden md:flex md:items-start md:justify-center md:flex-shrink-0">
          <WishBtn onClick={() => onWishlist?.(item.id)} />
        </div> */}

        <div className="w-full md:w-auto md:min-w-[380px] xl:min-w-[500px]">
          <div className="hidden md:grid grid-cols-3 bg-themeTeal px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-white">
            <div>Price per share</div><div>Price Change Period</div><div>Valuation (in Cr.)</div>
          </div>
          <div className="hidden md:grid grid-cols-3 items-center gap-1 bg-white px-2 py-2 text-xs font-semibold text-themeTeal">
            <div className="whitespace-nowrap">₹ {formatINR(item.price_per_share)}</div>
            <div className={pos ? "text-green-700" : "text-rose-600"}>
              {changeSign}₹{formatINR(Math.abs(item.price_change))}{pos ? <TrendingUp className="inline h-4 w-3.5 ml-1" /> : <TrendingDown className="inline h-3.5 w-3.5 ml-1" />} ({periodName})
            </div>
            <div className="whitespace-nowrap">₹ {item.valuation} Cr</div>
          </div>

          <div className="grid md:hidden grid-cols-3 gap-3 bg-white p-3 text-sm text-themeTeal">
            <MobileStat label="Price per share" value={`₹ ${formatINR(item.price_per_share)}`} />
            <MobileStat
              label="Price Change Period"
              value={<span className={pos ? "text-green-700" : "text-rose-600"}>
                {changeSign}₹{formatINR(Math.abs(item.price_change))}{pos ? <TrendingUp className="inline h-4 w-4 ml-1" /> : <TrendingDown className="inline h-4 w-4 ml-1" />} ({periodName})
              </span>}
            />
            <MobileStat label="Valuation (in Cr.)" value={`₹ ${item.valuation} Cr`} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* function WishBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full bg-themeTealLight px-3 py-1 text-xs font-medium text-themeTealWhite transition hover:bg-themeTeal cursor-pointer"
      aria-label="Add to Wishlist"
    >
      <Heart className="h-4 w-4" /> Add to Wishlist
    </button>
  );
} */
function MobileStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-themeTealLighter mb-0.5">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

/* utils */
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export default ProductList;
