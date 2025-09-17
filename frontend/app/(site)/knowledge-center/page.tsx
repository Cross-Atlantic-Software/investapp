"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, CalendarDays, BookOpenText } from "lucide-react";
import Breadcrumbs, { type Crumb } from "@/components/subcomponents/breadcrumbs";
import { Heading } from "@/components/ui";
import Image from "next/image";

// ------ Types ------
export type Topic =
  | "All Topics"
  | "Buying & Selling"
  | "Opportunity Assessment"
  | "Risk Assessment"
  | "Private Market Education";

type ItemType = "Guide" | "Article";

export type KnowledgeItem = {
  id: string;
  type: ItemType;
  topic: Exclude<Topic, "All Topics">;
  title: string;
  dateISO: string; // YYYY-MM-DD
  image: string;
  href?: string;
};

// ------ Seed data (swap with CMS/API) ------
const SEED = (
  [
    {
      id: "1",
      type: "Guide",
      topic: "Private Market Education",
      title:
        "Investing in private company shares: A guide for new investors",
      dateISO: "2025-08-06",
      image: "/images/news1.webp",
      href: "/knowledge-center/investing-in-private-company-shares-a-guide-for-new-investors",
    },
    {
      id: "2",
      type: "Guide",
      topic: "Private Market Education",
      title:
        "An introduction to the role of a Investapp's private market specialist",
      dateISO: "2025-08-04",
      image: "/images/news2.webp",
      href: "/knowledge-center/an-introduction-to-the-role-of-a-investapps-private-market-specialist",
    },
    ...Array.from({ length: 14 }).map((_, i): KnowledgeItem => ({
      id: `${i + 3}`,
      type: "Article",
      topic:
        i % 3 === 0
          ? "Buying & Selling"
          : i % 3 === 1
          ? "Opportunity Assessment"
          : "Risk Assessment",
      title:
        "Investing in private company shares: A guide for new investors",
      dateISO: "2025-08-03",
      image:
        i % 3 === 2
          ? "/images/news1.webp"
          : "/images/news2.webp",
      href: "/knowledge-center/investing-in-private-company-shares-a-guide-for-new-investors",
    })),
  ] as KnowledgeItem[]
) satisfies KnowledgeItem[];

// ------ Constants ------
const TOPICS: Topic[] = [
  "All Topics",
  "Buying & Selling",
  "Opportunity Assessment",
  "Risk Assessment",
  "Private Market Education",
];

// Force deterministic date formatting for SSR/CSR
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

// ------ UI Parts ------
function Card({ item }: { item: KnowledgeItem }) {
  return (
    <a
      href={item.href ?? "#"}
      className="group block rounded overflow-hidden"
    >
      <div className="overflow-hidden">
        {/* Use next/image in your codebase if preferred */}
        <Image
          src={item.image}
          alt={item.title}
          width={1200}
          height={600}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
        />
      </div>
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
        <h3 className="mt-2 text-xl font-semibold text-themeTeal group-hover:text-themeSkyBlue transition duration-500">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-themeTealLighter">
          <CalendarDays className="h-3 w-3" />
          <time suppressHydrationWarning dateTime={item.dateISO}>
            {formatDate(item.dateISO)}
          </time>
        </div>
      </div>
    </a>
  );
}

// ------ Page ------
export default function KnowledgeCenterPage() {
  const [topic, setTopic] = useState<Topic>("All Topics");
  const [q, setQ] = useState("");
  const [sortLatest, setSortLatest] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 11;

  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const rows = SEED.filter((r) =>
      topic === "All Topics" ? true : r.topic === topic
    ).filter((r) =>
      words.length === 0
        ? true
        : words.every((w) =>
            [r.title, r.type, r.topic].join(" ").toLowerCase().includes(w)
          )
    );

    rows.sort((a, b) =>
      sortLatest
        ? b.dateISO.localeCompare(a.dateISO)
        : a.dateISO.localeCompare(b.dateISO)
    );

    return rows;
  }, [topic, q, sortLatest]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
    const crumbs: Crumb[] = [
        { label: "Home", href: "/" },
        { label: "Knowledge Center" }
    ];

  // Reset page when filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [topic, q, sortLatest]);

  return (
    <main className="min-h-screen">
        <div className="px-6 py-3 bg-themeTealWhite">
            <Breadcrumbs items={crumbs} />
        </div>
      {/* Controls */}
      <div className="appContainer py-10 md:py-16">
        <section className="mb-10">
            <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
                <button
                key={t}
                onClick={() => setTopic(t)}
                className={
                    "rounded border px-3 py-2 text-sm transition cursor-pointer duration-500 " +
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
                className="inline-flex items-center gap-2 rounded bg-themeTeal px-4 py-3 text-sm hover:bg-themeSkyBlue cursor-pointer transition duration-500"
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
                className="rounded bg-themeTeal px-3 py-2 text-sm hover:bg-themeSkyBlue cursor-pointer transition duration-500"
                >
                Reset
                </button>
            </div>
            </div>
        </section>

        {/* Grid */}
        <section>
            <Heading as="h4" className="mt-4 mb-4 font-semibold">Private Market Education</Heading>

            {pageItems.length === 0 ? (
            <p className="text-themeTealLighter">No results. Adjust filters.</p>
            ) : (
            <>
                {/* First row: exactly two columns */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {pageItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="col-span-1">
                    <Card item={item} />
                    </div>
                ))}
                </div>

                {/* Remaining rows: 3-up on large, 2-up on tablet, 1-up on mobile */}
                {pageItems.length > 2 && (
                <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {pageItems.slice(2).map((item) => (
                    <div key={item.id} className="col-span-1">
                        <Card item={item} />
                    </div>
                    ))}
                </div>
                )}
            </>
            )}

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between text-white">
            <p className="text-sm text-themeTealLighter">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
                <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded cursor-pointer bg-themeTeal px-3 py-2 text-sm disabled:bg-themeTealLighter disabled:cursor-not-allowed"
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
                        ? "border-themeTeal bg-themeTeal text-themeTealWhite"
                        : "border-themeTealLighter text-themeTealLighter hover:bg-themeTeal hover:text-themeTealWhite")
                    }
                >
                    {i + 1}
                </button>
                ))}
                <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md bg-themeTeal cursor-pointer px-3 py-2 text-sm disabled:bg-themeTealLighter disabled:cursor-not-allowed"
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
