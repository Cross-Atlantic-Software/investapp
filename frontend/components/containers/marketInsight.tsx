"use client";

import Image from "next/image";
import { Heading } from "@/components/ui";

type InsightCard = {
  title: string;
  period?: string;
  src: string;   // public path e.g. /images/insights/sector-performance.webp
  alt?: string;
};

type Props = {
  cards?: InsightCard[];
};

export function MarketInsight({
  cards = [
    { title: "Fastest-Growing Sectors", period: "Past 7 Days", src: "/images/graph1.png" },
    { title: "Sector vs. Market Benchmark", period: "Past 6 Months", src: "/images/graph2.png" },
    { title: "Demand–Supply Dynamics", period: "Past 8 Months", src: "/images/graph3.png" },
    { title: "Valuation Trends by Funding", period: "Past 6 Months", src: "/images/graph4.png" },
    { title: "Capital Raised So Far", src: "/images/graph5.png" },
    { title: "Workforce as Growth Signal", period: "Past 6 Months", src: "/images/graph6.png" },
  ],
}: Props) {
  return (
    <section>
      <div className="appContainer py-12 md:py-16">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center">
          <Heading as="h2" className="mb-3 text-themeTeal">Your Data-Driven Edge in Private Markets</Heading>
          <p className="text-themeTealLight">Go beyond prices. Explore sector momentum, valuation shifts, funding patterns, and demand–supply ratios, all transformed into actionable insights you can trust.</p>
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c, i) => (
            <div key={`${c.title}-${i}`} className="rounded-md bg-themeTealWhite p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-md font-medium text-themeTeal">{c.title}</span>
                {c.period && <span className="text-themeTealLighter">{c.period}</span>}
              </div>

              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-white">
                <Image
                  src={c.src}
                  alt={c.alt ?? c.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
