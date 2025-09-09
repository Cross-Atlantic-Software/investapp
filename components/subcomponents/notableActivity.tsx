// components/NotableActivity.tsx
"use client";

import { IndianRupee, Sparkles } from "lucide-react";

type Activity = {
  id: string;
  title: string;        // "Large Trade"
  description: string;  // "Institutional buy of ₹2.5M in Tech"
  timeAgo: string;      // "15 min ago"
};

export default function NotableActivity({
  items = [
    {
      id: "a1",
      title: "Large Trade",
      description: "Institutional buy of ₹2.5M in Tech",
      timeAgo: "15 min ago",
    },
    {
      id: "a2",
      title: "New Listing",
      description: "Green Energy shares now available",
      timeAgo: "1h ago",
    },
    {
      id: "a3",
      title: "High Interest",
      description: "400% spike in FinTech sector views",
      timeAgo: "2h ago",
    },
    {
      id: "a4",
      title: "Low Interest",
      description: "350% spike in FinTech sector views",
      timeAgo: "5h ago",
    },
  ],
}: { items?: Activity[] }) {
  return (
    <aside className="rounded-md border border-themeTealLighter bg-themeTealWhite p-5 md:p-6">
      <header className="mb-4 flex items-center gap-2 text-themeTeal">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-base font-semibold">Notable Activity</h3>
      </header>

      <ul className="flex flex-col gap-5">
        {items.map((x) => (
          <li key={x.id} className="flex items-start gap-3 text-left">
            <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-themeTealLighter text-md font-semibold text-themeTealWhite">
              <IndianRupee className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-md font-semibold text-themeTeal">{x.title}</p>
              <p className="text-sm text-themeTealLighter">{x.description}</p>
              <p className="mt-1 text-xs text-themeTealLighter">{x.timeAgo}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
