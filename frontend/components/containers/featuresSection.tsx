"use client";

import Image from "next/image";
import { Heading } from "@/components/ui";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: "/images/icons/fully-regulated-safe-and-secure.svg",
    title: "Fully regulated, safe & secure",
    description:
      "Institutional-grade custody, E2E encryption, and compliant workflows protect your assets and data.",
  },
  {
    icon: "/images/icons/transparent-fees-on-everything.svg",
    title: "Transparent fees on everything",
    description:
      "Simple, predictable pricing with no hidden spreads. See total cost before you execute.",
  },
  {
    icon: "/images/icons/insight-into-investments.svg",
    title: "Insight into investments",
    description:
      "Dashboards, alerts, and research help you evaluate pre-IPO opportunities with confidence.",
  },
];

export function FeaturesSection() {
  return (
    <section>
      <div className="appContainer py-16 md:py-20 flex flex-col gap-10 text-center">
        {/* Header */}
        <div className="max-w-3xl mx-auto">
          <Heading as="h2" className="mb-3">Power your Unlisted Shares</Heading>
          <p className="text-themeTealLight">
            Explore a dynamic range of top-performing unlisted stocks—from high-growth startups to established private giants.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex-1 rounded bg-themeTealWhite p-6 lg:p-10 group"
            >
              <div className="mb-5 inline-flex h-24 w-24 items-center justify-center rounded bg-themeTeal transition-transform duration-300 ease-out group-hover:-translate-y-2">
                <Image src={f.icon} alt={f.title} width={50} height={50} style={{ width: "auto", height: "auto" }} />
              </div>
              <h3 className="text-xl font-semibold font-serif text-themeTeal">
                {f.title}
              </h3>
              <p className="mt-2 text-themeTealLight">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
