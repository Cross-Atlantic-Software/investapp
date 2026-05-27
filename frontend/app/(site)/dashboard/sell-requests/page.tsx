"use client";

import { Heading } from "@/components/ui";
import BuyRequestsTable from "@/components/dashboard/BuyRequestsTable";

export default function SellRequests() {
  return (
    <section>
      {/* header */}
      <div className="mb-4 flex flex-col gap-3 rounded bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading as="h5" className="font-semibold">
          Buy Requests
        </Heading>
      </div>

      {/* buy requests table - full width */}
      <section className="rounded bg-white p-4">
        <div className="mb-4">
          <Heading as="h5" className="text-themeTeal">
            Your Buy Requests
          </Heading>
        </div>

        {/* table: responsive with proper overflow handling */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <BuyRequestsTable />
          </div>
        </div>
      </section>
    </section>
  );
}
