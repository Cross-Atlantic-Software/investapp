"use client";

import { Button, Heading } from "../ui";

type Stat = { value: string; label: string };

type Props = {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  stats?: Stat[];
};

export default function InvestmentCTA({
  title = "Ready for Your Next Big Investment?",
  description = "Join our exclusive network of institutional investors and HNIs. Get early access to premium bulk deals with minimum investments starting from ₹5 Cr.",
  primaryLabel = "Sell Shares",
  primaryHref = "#",
  secondaryLabel = "Invest Now",
  secondaryHref = "#",
  stats = [
    { value: "₹50L+", label: "Avg. Monthly Returns" },
    { value: "24–48h", label: "Deal Processing" },
    { value: "100%", label: "Transparent" },
    { value: "24/7", label: "Support" },
  ],
}: Props) {
  return (
    <section>
        <div className="rounded-md bg-themeTealWhite p-6 md:p-8 text-left">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            {/* Left copy + CTAs */}
            <div className="w-full md:w-1/2 text-center md:text-left">
                <Heading as="h4" className="mb-3 text-themeTeal font-semibold">{title}</Heading>
                <p className="mb-5 text-themeTealLight">{description}</p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start">
                    <Button text={primaryLabel} color="themeTeal" variant="outline" size="md" href={primaryHref} />
                    <Button text={secondaryLabel} color="themeTeal" variant="solid" size="md" href={secondaryHref} />
                </div>
            </div>

            {/* Right stats grid */}
            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-md bg-white px-6 py-6 text-center"
                  >
                    <div className="text-2xl font-semibold text-themeTeal">
                      {s.value}
                    </div>
                    <div className="mt-1 text-sm text-themeTealLight">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
