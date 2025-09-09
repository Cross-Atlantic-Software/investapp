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
    { title: "Sector performance", period: "Past 7 Days", src: "/images/graph1.png" },
    { title: "Sector performance vs Marketplace Average", period: "Past 6 Months", src: "/images/graph2.png" },
    { title: "Bid - Offer Ratio", period: "Past 8 Months", src: "/images/graph3.png" },
    { title: "Sector performance vs Marketplace Average", period: "Past 6 Months", src: "/images/graph4.png" },
    { title: "Total Raised to Date", src: "/images/graph5.png" },
    { title: "Employee Count", period: "Past 6 Months", src: "/images/graph6.png" },
  ],
}: Props) {
  return (
    <section>
      <div className="appContainer py-12 md:py-16">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-5xl text-center">
          <Heading as="h2" className="mb-3 text-themeTeal">
            Sector and Market Insights for sophisticated investors
          </Heading>
          <p className="text-themeTealLight">
            Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to
            established private giants. These are the companies shaping the future—now just a click away.
          </p>
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
