"use client";

import { Heading } from "../ui";
import PlatformFeatures, { type Feature } from "../subcomponents/platformFeatures";
import { OverviewCard, RiskCard, RecoCard, OpportunityCard, HoldingsTable } from "../dashboard";

/* ---------- page ---------- */
export default function MarketPortfolio() {
  const features: Feature[] = [
    { id: "f1", title: "Invest Early, Invest Smart", description: "Access India’s most promising pre-IPO companies before the crowd." },
    { id: "f2", title: "Liquidity, On Demand", description: "Enter and exit seamlessly with a trusted buyer–seller network. Leverage institutional-grade tools, liquidity, and intelligence." },
    { id: "f3", title: "Signals That Matter", description: "Market depth, price discovery, and trend alerts built into your dashboard to optimize risk and provide opportunities" },
    { id: "f4", title: "The Edge That Sets Us Apart", description: "Trade, learn, and grow in one secure platform. Invest smarter with demand signals that matter." },
  ];

  return (
    <section className="bg-themeTeal">
      <div className="appContainer py-12">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Heading as="h2" className="mb-3 text-themeTealWhite">Private Markets, Reimagined for Everyone</Heading>
          <p className="mb-6 text-themeTealWhite/90">InvestApp isn’t just another marketplace. It’s a future-ready ecosystem that combines discovery, risk optimization, managing liquidity, and intelligence into one seamless platform.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left rail: platform features */}
          <PlatformFeatures items={features} />

          {/* Right: cards + table */}
          <div className="space-y-6">
            {/* four spec-matched cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <OverviewCard />
              <RiskCard />
              <RecoCard />
              <OpportunityCard />
            </div>

            {/* holdings section */}
            <div className="space-y-4">
              {/* holdings header */}
              <div className="mb-4">
                <Heading as="h5" className="text-themeTeal">
                  Holdings
                </Heading>
              </div>

              {/* table: responsive with proper overflow handling */}
              <div className="overflow-x-auto rounded-md bg-themeTealWhite p-4">
                <HoldingsTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
