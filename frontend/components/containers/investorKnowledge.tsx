"use client";

import { Button, Heading } from "@/components/ui";
import { ChevronRight } from "lucide-react";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  href?: string;
};

type Props = {
  eyebrow?: string;
  title?: string;
  blurb?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items?: Article[];
};

export default function InvestorKnowledge({
  eyebrow = "",
  title = "Your Learning Hub for Private Markets",
  blurb = "Before you invest, learn. Our Knowledge Centre offers simple, practical guides on private markets, so you can build confidence and protect your interests.",
  ctaLabel = "Visit our knowledge centre",
  ctaHref = "/knowledge-center",
  items = [
    {
      id: "a1",
      title: "Basics of Unlisted Investing",
      excerpt:
        "Understand what pre-IPO shares are, how they’re traded, and why they matter.",
    },
    {
      id: "a2",
      title: "Managing Risk",
      excerpt:
        "Learn how to assess your risk tolerance and diversify your portfolio.",
    },
    {
      id: "a3",
      title: "Investor Protection & Due Diligence",
      excerpt:
        "See how compliance, nominee services, and secure custody protect your interests.",
    },
    {
      id: "a4",
      title: "Tools & Insights",
      excerpt:
        "Get the most out of our dashboards, liquidity signals, and research features.",
    },
  ],
}: Props) {
  return (
    <section className="bg-themeTealWhite">
      <div className="appContainer py-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-3 md:items-center">
          {/* Left copy */}
          <div className="md:pr-8">
            {eyebrow && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-themeTealLight">
                {eyebrow}
              </p>
            )}
            <Heading as="h3" className="mb-3 text-themeTeal">
              {title}
            </Heading>
            <p className="mb-5 text-themeTealLight">{blurb}</p>
            <Button text={ctaLabel} color="skyblue" variant="link" size="nospace" href={ctaHref} icon={ChevronRight} />
          </div>

          {/* Right cards */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((it) => (
                <article
                  key={it.id}
                  className="rounded-md bg-white p-5"
                >
                  <h4 className="mb-2 text-xl font-semibold text-themeTeal">
                    {it.title}
                  </h4>
                  <p className="text-sm text-themeTealLight">{it.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
