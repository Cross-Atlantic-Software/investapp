"use client";

import Image from "next/image";
import { TrendingUp, TrendingDown, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

/* ---------- types ---------- */
export type ProductItem = {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  description: string;
  logoUrl?: string;
  priceINR: number;
  changePct: number;
  volumeThousands?: number;
  graphImg?: string;
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

  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const start = (pageSafe - 1) * pageSize;
  const view = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);

  if (!items?.length) return null;

  return (
    <div className="space-y-3">
      {view.map((p) => (
        <ProductRow key={p.id} item={p} onWishlist={onWishlist} />
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
function ProductRow({ item, onWishlist }: { item: ProductItem; onWishlist?: (id: string) => void }) {
  const pos = item.changePct >= 0;
  const changeSign = pos ? "+" : "";
  return (
    <article className="w-full rounded-xl bg-themeTealWhite p-2 md:p-3">
      <div className="flex flex-col gap-4 xl:flex-row md:items-center md:justify-between">
        <div className="flex gap-3 md:gap-4 items-center">
          <div className="h-14 w-14 md:h-20 md:w-20 shrink-0 rounded-lg bg-white grid place-items-center overflow-hidden">
            {item.logoUrl ? (
              <Image src={item.logoUrl} alt={`${item.name} logo`} width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              <span className="text-base md:text-xl font-semibold">{abbr(item.name)}</span>
            )}
          </div>

          <div className="min-w-0 w-full">
            <h3 className="text-themeTeal font-semibold leading-tight truncate">
              {item.name} <span className="text-themeTeal font-normal">({item.symbol})</span>
            </h3>
            <div className="text-xs text-themeTealLighter">{item.sector}</div>
            <p className="mt-1 text-sm text-themeTealLight line-clamp-3 md:line-clamp-1">{item.description}</p>

            <div className="mt-2 flex justify-center md:hidden">
              <WishBtn onClick={() => onWishlist?.(item.id)} />
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:items-start md:justify-center md:flex-shrink-0">
          <WishBtn onClick={() => onWishlist?.(item.id)} />
        </div>

        <div className="w-full md:w-auto md:min-w-[350px] lg:min-w-full xl:min-w-[400px]">
          <div className="hidden md:grid grid-cols-4 bg-themeTeal px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white">
            <div>Price</div><div>Change</div><div>Graph</div><div>Volume (’000)</div>
          </div>
          <div className="hidden md:grid grid-cols-4 items-center gap-2 bg-white px-3 py-2 text-sm font-semibold text-themeTeal">
            <div className="whitespace-nowrap">₹ {formatINR(item.priceINR)}</div>
            <div className={pos ? "text-green-700" : "text-rose-600"}>
              {changeSign}{item.changePct.toFixed(2)}%{pos ? <TrendingUp className="inline h-4 w-4 ml-1" /> : <TrendingDown className="inline h-4 w-4 ml-1" />}
            </div>
            <div className="flex justify-start">
              <Image src={item.graphImg || "/images/price-up-graph.svg"} alt="Graph" width={60} height={24} className="object-contain" />
            </div>
            <div>{item.volumeThousands?.toLocaleString("en-IN") ?? "—"}</div>
          </div>

          <div className="grid md:hidden grid-cols-2 gap-3 bg-white p-3 text-sm text-themeTeal">
            <MobileStat label="Price" value={`₹ ${formatINR(item.priceINR)}`} />
            <MobileStat
              label="Change"
              value={<span className={pos ? "text-green-700" : "text-rose-600"}>
                {changeSign}{item.changePct.toFixed(2)}%{pos ? <TrendingUp className="inline h-4 w-4 ml-1" /> : <TrendingDown className="inline h-4 w-4 ml-1" />}
              </span>}
            />
            <MobileStat
              label="Graph"
              value={<Image src={item.graphImg || "/images/price-up-graph.svg"} alt="Graph" width={72} height={22} className="object-contain" />}
            />
            <MobileStat label="Volume (’000)" value={item.volumeThousands?.toLocaleString("en-IN") ?? "—"} />
          </div>
        </div>
      </div>
    </article>
  );
}

function WishBtn({ onClick }: { onClick: () => void }) {
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
}
function MobileStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-themeTealLighter mb-0.5">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

/* utils */
function abbr(name: string) {
  const p = name.split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export default ProductList;
