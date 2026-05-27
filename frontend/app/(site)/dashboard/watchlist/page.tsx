"use client";

import { Heading } from "@/components/ui";
import WatchlistTable from "@/components/dashboard/WatchlistTable";

export default function Watchlist() {
  return (
    <section>
      {/* header */}
      <div className="mb-4 flex flex-col gap-3 rounded bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading as="h5" className="font-semibold">
          Watchlist
        </Heading>
      </div>

      {/* watchlist table - full width */}
      <section className="rounded bg-white p-4">
        <div className="mb-4">
          <Heading as="h5" className="text-themeTeal">
            Your Watchlist
          </Heading>
        </div>

        {/* table: responsive with proper overflow handling */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <WatchlistTable />
          </div>
        </div>
      </section>
    </section>
  );
}
