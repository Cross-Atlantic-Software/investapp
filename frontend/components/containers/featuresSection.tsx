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
    title: "Regulated. Encrypted. Trusted.",
    description:
      "Institutional-grade custody, end-to-end encryption, and SEBI-compliant workflows safeguard your assets and data at every step.",
  },
  {
    icon: "/images/icons/transparent-fees-on-everything.svg",
    title: "No Hidden Fees, Ever.",
    description:
      "Transparent, predictable pricing with complete cost visibility before you execute. No hidden spreads, no surprises.",
  },
  {
    icon: "/images/icons/insight-into-investments.svg",
    title: "Data That Drives Smarter Investments",
    description:
      "Dashboards, alerts, and research-backed insights to help you identify tomorrow’s winners, today. Evaluate pre-IPO opportunities with confidence.",
  },
  {
    icon: "/images/icons/liquidity-when-you-need-it.svg",
    title: "Liquidity When You Need It",
    description:
      "Plan exits with ease. Our platform connects you to a trusted network of buyers and sellers, backed by real-time demand–supply transparency.",
  },
];

export function FeaturesSection() {
  return (
    <section>
      <div className="appContainer py-16 md:py-20 flex flex-col gap-10 text-center">
        {/* Header */}
        <div className="max-w-3xl mx-auto">
          <Heading as="h2" className="mb-3">Your Edge in the Private Market</Heading>
          <p className="text-themeTealLight">Invest smarter with security, transparency, and data-driven insights at the core.</p>
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
