"use client";

import { Heading } from "@/components/ui";
import type { LucideIcon } from "lucide-react";
import { IndianRupee, Building2, TrendingUp, Users } from "lucide-react";
import InvestmentCTA from "../subcomponents/investmentCTA";

type Stat = { icon: LucideIcon; value: string; label: string };
type Props = {
  eyebrow?: string;
  title?: string;
  description?: string;
  stats?: Stat[];
};

export default function BulkDeals({
  eyebrow = "Institutional Grade Opportunities",
  title = "Bulk Deals Corner",
  description = "Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants. These are the companies shaping the future—now just a click away.",
  stats = [
    { icon: IndianRupee, value: "₹2,500+ Cr", label: "Total Deal Value" },
    { icon: Building2, value: "150+", label: "Active Institutions" },
    { icon: TrendingUp, value: "₹180 Cr", label: "Avg. Deal Size" },
    { icon: Users, value: "94%", label: "Success Rate" },
  ],
}: Props) {
  return (
    <section>
      <div className="appContainer py-12 md:py-16 flex flex-col items-center gap-8 text-center">
        {/* Eyebrow */}
        <span className="inline-flex items-center rounded-full bg-themeTealLighter px-3 py-1 text-sm font-medium text-themeTealWhite">
          {eyebrow}
        </span>

        {/* Title + copy */}
        <div className="max-w-3xl">
          <Heading as="h2" className="mb-3 text-themeTeal">
            {title}
          </Heading>
          <p className="text-themeTealLight">{description}</p>
        </div>

        {/* Stats */}
        <div className="grid w-full max-w-5xl grid-cols-2 gap-10 md:grid-cols-4 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-md bg-themeTealWhite mb-3">
                <s.icon className="h-10 w-10 text-themeTeal" aria-hidden />
              </div>
              <div className="text-2xl font-bold text-themeTeal mb-0">{s.value}</div>
              <div className="text-sm text-themeTealLight">{s.label}</div>
            </div>
          ))}
        </div>

        <InvestmentCTA />
      </div>
    </section>
  );
}
