"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, CalendarDays, BookOpenText } from "lucide-react";
import Breadcrumbs, { type Crumb } from "@/components/subcomponents/breadcrumbs";
import { Heading } from "@/components/ui";
import Image from "next/image";

/* =========================
   Types
   ========================= */
export type Topic =
  | "All Topics"
  | "Market Outlook"
  | "Company Updates"
  | "Sector Trends"
  | "Policy & Rates"
  | "Private Markets";

type ItemType = "Guide" | "Article";

export type InsightItem = {
  id: string;
  type: ItemType;
  topic: Exclude<Topic, "All Topics">;
  title: string;
  dateISO: string; // YYYY-MM-DD
  image: string;
  href?: string;
  summary?: string;
};

/* =========================
   Seed (swap for CMS/API)
   ========================= */
const SEED = (
  [
    {
      id: "1",
      type: "Guide",
      topic: "Market Outlook",
      title: "How will the tariff sell-off hit private company valuations?",
      dateISO: "2025-08-20",
      image: "/images/news2.webp",
      href: "/market-insights/an-introduction-to-the-role-of-a-investapps-private-market-specialist",
    },
    {
      id: "2",
      type: "Guide",
      topic: "Private Markets",
      title: "Investing in private company shares: A guide for new investors",
      dateISO: "2025-08-06",
      image: "/images/news1.webp",
      href: "/market-insights/investing-in-private-company-shares-a-guide-for-new-investors",
      summary: "Praesent id dignissim magna. Aliquam malesuada nisi ac tellus tempus, vel imperdiet erat accumsan. Curabitur lacinia vitae sem in ornare. Vestibulum id nisi sit amet tortor condimentum laoreet et id leo. "

    },
    ...Array.from({ length: 16 }).map((_, i): InsightItem => ({
      id: `${i + 3}`,
      type: "Article",
      topic:
        i % 4 === 0
          ? "Sector Trends"
          : i % 4 === 1
          ? "Company Updates"
          : i % 4 === 2
          ? "Policy & Rates"
          : "Private Markets",
      title: "Investing in private company shares: A guide for new investors",
      dateISO: "2025-08-03",
      image: i % 2 ? "/images/news1.webp" : "/images/news2.webp",
      href: "/market-insights/investing-in-private-company-shares-a-guide-for-new-investors",
      summary: "Praesent id dignissim magna. Aliquam malesuada nisi ac tellus tempus, vel imperdiet erat accumsan. Curabitur lacinia vitae sem in ornare. Vestibulum id nisi sit amet tortor condimentum laoreet et id leo. "
    })),
  ] as InsightItem[]
) satisfies InsightItem[];

/* =========================
   Constants
   ========================= */
const TOPICS: Topic[] = [
  "All Topics",
  "Market Outlook",
  "Company Updates",
  "Sector Trends",
  "Policy & Rates",
  "Private Markets",
];

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
function formatDate(iso: string) {
  try {
    return DATE_FMT.format(new Date(`${iso}T00:00:00Z`));
  } catch {
    return iso;
  }
}

/* =========================
   UI Parts
   ========================= */
function SmallCard({ item }: { item: InsightItem }) {
  return (
    <a href={item.href ?? "#"} className="group block rounded overflow-hidden">
      <div className="aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          width={800}
          height={500}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
      </div>
      <div className="pt-3">
        <div className="text-xs uppercase tracking-wide text-themeTealLighter flex items-center gap-2">
          {item.type === "Guide" ? (
            <BookOpenText className="h-3.5 w-3.5" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          <span>{item.type}</span>
        </div>
        <h3 className="mt-1 text-base font-semibold text-themeTeal group-hover:text-themeSkyBlue transition duration-500">
          {item.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-themeTealLighter">
          <CalendarDays className="h-3 w-3" />
          <time suppressHydrationWarning dateTime={item.dateISO}>{formatDate(item.dateISO)}</time>
        </div>
      </div>
    </a>
  );
}

function GridCard({ item }: { item: InsightItem }) {
  return (
    <a href={item.href ?? "#"} className="group block rounded overflow-hidden border border-themeTealLighter/50 bg-white/5">
      <div className="aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          width={1200}
          height={600}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-4">
        <div className="text-xs uppercase tracking-wide text-themeTealLighter flex items-center gap-2">
          {item.type === "Guide" ? (
            <BookOpenText className="h-3.5 w-3.5" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          <span>{item.type}</span>
        </div>
        <h3 className="mt-2 text-base font-semibold text-themeTeal group-hover:text-themeSkyBlue transition">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-themeTealLighter">
          <CalendarDays className="h-3 w-3" />
          <time suppressHydrationWarning dateTime={item.dateISO}>{formatDate(item.dateISO)}</time>
        </div>
      </div>
    </a>
  );
}

function HeroCard({ item }: { item: InsightItem }) {
  return (
    <a href={item.href ?? "#"} className="group block rounded overflow-hidden">
        <div className="relative aspect-[16/9] w-full">
            <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width:1024px) 66vw, 100vw"
            className="object-cover"
            />
        </div>

        {/* text sits BELOW the image */}
        <div className="py-4">
            <div className="text-xs uppercase tracking-wide text-themeTealLighter flex items-center gap-2">
            {item.type === "Guide" ? (
                <BookOpenText className="h-3.5 w-3.5" />
            ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                </svg>
            )}
            <span>{item.type}</span>
            </div>

            <h3 className="mt-1 mb-2 text-2xl font-semibold text-themeTeal group-hover:text-themeSkyBlue transition line-clamp-2">{item.title}</h3>

            <p className="text-themeTealLighter mb-3">{item.summary}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-themeTealLighter">
            <CalendarDays className="h-3 w-3" />
            <time suppressHydrationWarning dateTime={item.dateISO}>
                {formatDate(item.dateISO)}
            </time>
            </div>
        </div>
        </a>

  );
}

/* =========================
   Page
   ========================= */
export default function MarketInsightsPage() {
  const [topic, setTopic] = useState<Topic>("All Topics");
  const [q, setQ] = useState("");
  const [sortLatest, setSortLatest] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Featured: top by date
  const featured = useMemo(() => {
    return [...SEED].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, 7);
  }, []);

  // Filters
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const rows = SEED.filter((r) => (topic === "All Topics" ? true : r.topic === topic)).filter((r) =>
      words.length === 0 ? true : words.every((w) => [r.title, r.type, r.topic].join(" ").toLowerCase().includes(w))
    );
    rows.sort((a, b) => (sortLatest ? b.dateISO.localeCompare(a.dateISO) : a.dateISO.localeCompare(b.dateISO)));
    return rows;
  }, [topic, q, sortLatest]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: "Market Insights" }];

  useEffect(() => {
    setPage(1);
  }, [topic, q, sortLatest]);

  return (
    <main className="min-h-screen">
        
      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-themeTealWhite">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Controls */}
      <div className="appContainer py-8 md:py-12">
        <section className="mb-8">

          {/* Topic pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={
                  "rounded border px-3 py-2 text-sm transitionduration-500 cursor-pointer " +
                  (topic === t
                    ? "border-themeTeal bg-themeTeal text-themeTealWhite"
                    : "border-themeTealLighter text-themeTealLighter hover:border-themeTeal hover:bg-themeTeal hover:text-themeTealWhite")
                }
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLight" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search here..."
                className="w-full rounded text-themeTeal pl-10 pr-3 py-2.5 outline-none ring-1 ring-themeTealLighter focus:ring-themeTeal transition duration-500"
              />
            </div>
            <div className="flex gap-2 text-white">
              <button
                onClick={() => setSortLatest((v) => !v)}
                className="inline-flex items-center gap-2 rounded bg-themeTeal px-4 py-3 text-sm hover:bg-themeSkyBlue transition duration-500 cursor-pointer"
                title="Toggle sort order"
              >
                <Filter className="h-4 w-4" />
                {sortLatest ? "Latest" : "Oldest"}
              </button>
              <button
                onClick={() => {
                  setQ("");
                  setTopic("All Topics");
                  setSortLatest(true);
                }}
                className="rounded bg-themeTeal px-3 py-2 text-sm hover:bg-themeSkyBlue transition duration-500 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Featured band */}
        <section className="mb-10">
          <Heading as="h4" className="mb-4 font-semibold">
            Featured Insights
          </Heading>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left column: two small cards */}
            <div className="lg:col-span-3 space-y-6">
              {featured.slice(0, 2).map((it) => (
                <SmallCard key={it.id} item={it} />
              ))}
            </div>

            {/* Center hero */}
            <div className="lg:col-span-6">
              {featured[2] && <HeroCard item={featured[2]} />}
            </div>

            {/* Right column: headline list */}
            <div className="lg:col-span-3 space-y-6 divide divide-y divide-themeTeal">
              {featured.slice(3).map((it) => (
                <a key={it.id} href={it.href ?? "#"} className="block pb-6 hover:border-themeTeal transition">
                  <div className="text-xs uppercase tracking-wide text-themeTealLighter">{it.type}</div>
                  <div className="mt-1 line-clamp-2 font-medium text-themeTeal hover:text-themeSkyBlue transition duration-500">{it.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-themeTealLighter">
                    <CalendarDays className="h-3 w-3" />
                    <time suppressHydrationWarning dateTime={it.dateISO}>{formatDate(it.dateISO)}</time>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* All Insights grid */}
        <section>
          <Heading as="h4" className="mb-4 font-semibold">
            All Insights
          </Heading>

          {pageItems.length === 0 ? (
            <p className="text-themeTealLighter">No results. Adjust filters.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {pageItems.map((item) => (
                <GridCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-themeTealLighter">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded cursor-pointer bg-themeTeal text-themeTealWhite hover:bg-themeTealLighter transition duration-500 px-3 py-2 text-sm disabled:bg-themeTealLighter disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={
                    "h-9 w-9 rounded border text-sm cursor-pointer transition duration-500 " +
                    (page === i + 1
                      ? "border-themeTeal bg-themeTeal text-themeTealWhite text-themeTealLighter"
                      : "border-themeTealLighter text-themeTealLighter hover:bg-themeTeal hover:text-themeTealWhite")
                  }
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded cursor-pointer bg-themeTeal text-themeTealWhite hover:bg-themeTealLighter transition duration-500 px-3 py-2 text-sm disabled:bg-themeTealLighter disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
