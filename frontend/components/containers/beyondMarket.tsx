"use client";

import { Heading } from "@/components/ui";
import { Clock } from "lucide-react";
import { HighDemandStocks, LowDemandStocks, NotableActivity, PrivateMarketNews } from "../subcomponents";

export function BeyondMarket() {
  return (
    <section className="">
      <div className="appContainer py-16 md:py-20 flex flex-col gap-6 text-center">
        {/* Header */}
        <div className="max-w-3xl mx-auto">
          <Heading as="h2" className="mb-3">
            Discover the Market Beyond the Market
          </Heading>
          <p className="text-themeTealLight">
            Explore a dynamic range of top-performing unlisted stocks—from
            high-growth startups to established private giants. These are the
            companies shaping the future—now just a click away.
          </p>
        </div>

        {/* Status bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-base text-themeTealLight gap-4">
          {/* Left: label + badges */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-themeTeal">
              What’s Going on Today
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-800" />
              Live
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-red-800" />
              Offline
            </span>
          </div>

          {/* Right: last updated */}
          <div className="flex items-center gap-2 text-sm text-themeTealLighter">
            <Clock className="w-4 h-4" />
            <span>Last updated: 2 minutes ago</span>
          </div>
        </div>

        <HighDemandStocks
          items={[
            { id: "tcs", name: "", logo: "/images/logos/tcs.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "jio", name: "", logo: "/images/logos/jio.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "airtel", name: "", logo: "/images/logos/airtel.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "tata", name: "", logo: "/images/logos/tata.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "tcs1", name: "", logo: "/images/logos/tcs.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "jio1", name: "", logo: "/images/logos/jio.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "airtel1", name: "", logo: "/images/logos/airtel.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "tata1", name: "", logo: "/images/logos/tata.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
          ]}
          autoplayMs={8000}
        />

        <LowDemandStocks
          items={[
            { id: "tcs", name: "", logo: "/images/logos/tcs.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "jio", name: "", logo: "/images/logos/jio.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "airtel", name: "", logo: "/images/logos/airtel.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "tata", name: "", logo: "/images/logos/tata.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "tcs1", name: "", logo: "/images/logos/tcs.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "jio1", name: "", logo: "/images/logos/jio.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "airtel1", name: "", logo: "/images/logos/airtel.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
            { id: "tata1", name: "", logo: "/images/logos/tata.webp", changeINR: "290.58", changePct: "66", price: "350.92", valuation: "840.52B" },
          ]}
          autoplayMs={8000}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <PrivateMarketNews />
          </div>
          <div>
            <NotableActivity />
          </div>
        </div>

      </div>
    </section>
  );
}
