// components/PrivateMarketNews.tsx
"use client";

import { Zap } from "lucide-react";

type TagVariant = "funding" | "impactHigh" | "impactMedium" | "corporate" | "product";

type NewsItem = {
  id: string;
  initials: string;          // e.g., "CL"
  title: string;             // e.g., "CloudTech raises ₹150M Series C"
  tags: { label: string; variant: TagVariant }[];
  timeAgo: string;           // "2h ago"
  highlight?: boolean;       // renders the middle white bubble
};

const tagClass: Record<TagVariant, string> = {
  funding: "bg-themeTeal text-themeTealWhite",
  impactHigh: "bg-red-800 text-themeTealWhite",
  impactMedium: "bg-themeTealLight text-themeTealWhite",
  corporate: "bg-themeSkyBlue text-themeTealWhite",
  product: "bg-themeTealLighter text-themeTealWhite",
};

export default function PrivateMarketNews({
  items = [
    {
      id: "1",
      initials: "CL",
      title: "CloudTech raises ₹150M Series C",
      tags: [
        { label: "Funding", variant: "funding" },
        { label: "High Impact", variant: "impactHigh" },
      ],
      timeAgo: "2h ago",
    },
    {
      id: "2",
      initials: "RE",
      title: "RetailCorp announces 200 layoffs",
      tags: [
        { label: "Corporate", variant: "corporate" },
        { label: "Medium Impact", variant: "impactMedium" },
      ],
      timeAgo: "4h ago",
      highlight: true,
    },
    {
      id: "3",
      initials: "NE",
      title: "AI startup launches revolutionary product",
      tags: [
        { label: "Product", variant: "product" },
        { label: "High Impact", variant: "impactHigh" },
      ],
      timeAgo: "6h ago",
    },
  ],
}: { items?: NewsItem[] }) {
  return (
    <section className="rounded-md border border-themeTealLighter bg-themeTealWhite p-5 md:p-6">
      <header className="mb-4 flex items-center gap-2 text-teal-900">
        <Zap className="h-4 w-4" />
        <h3 className="text-base font-semibold">Private Market News</h3>
      </header>

      <ul className="flex flex-col gap-4 text-left">
        {items.map((n) => (
          <li
            key={n.id}
            className={[
              "rounded-xl transition duration-500 hover:bg-white p-3 md:p-4",
              n.highlight ? "" : "",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-themeTealLighter text-md font-semibold text-themeTealWhite">
                {n.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {n.tags.map((t, i) => (
                    <span
                      key={`${n.id}-tag-${i}`}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagClass[t.variant]}`}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
                <p className="text-md font-semibold text-themeTeal">{n.title}</p>
                <p className="mt-1 text-xs text-themeTealLighter">{n.timeAgo}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
