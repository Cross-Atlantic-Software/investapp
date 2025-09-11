// components/marketing/PricingPlans.tsx
"use client";
import { CircleCheck } from "lucide-react";

export type PlanItem = {
  id: string;
  badge?: string;
  /** makes the badge visually highlighted */
  badgeEmphasis?: "default" | "highlight";
  floatingBadge?: string;
  title: string;
  subtitle?: string;
  rate: string;
  rateNote?: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref?: string;
  variant?: "primary" | "outline";
};

export default function PricingPlans({
  items,
  className = "",
}: {
  items: PlanItem[];
  className?: string;
}) {
  return (
    <section className={`grid gap-5 md:grid-cols-3 text-center ${className}`}>
      {items.map((p) => (
        <article
          key={p.id}
          className="relative rounded-xl border border-themeTealLighter bg-white p-5 md:p-7"
        >
          {p.floatingBadge && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-themeSkyBlue px-3 py-1 text-sm font-semibold text-white shadow">
              {p.floatingBadge}
            </div>
          )}

          {p.badge && (
            <div
              className={[
                "mb-5 inline-block rounded-full px-3 py-1 text-sm font-semibold",
                p.badgeEmphasis === "highlight"
                  ? "bg-themeSkyBlue text-white"
                  : "bg-themeTealWhite text-themeTeal",
              ].join(" ")}
            >
              {p.badge}
            </div>
          )}

          <h3 className="text-2xl font-semibold text-themeTeal">{p.title}</h3>
          {p.subtitle && (
            <p className="mt-1 text-themeTealLighter">{p.subtitle}</p>
          )}

          <div className="mt-6 text-3xl font-semibold text-themeSkyBlue">
            {p.rate}
          </div>
          <div className="mt-1 text-themeTealLighter">
            {p.rateNote ?? "Commission Rate"}
          </div>

          <ul className="mt-8 space-y-4">
            {p.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-themeTeal">
                <CircleCheck className="mt-1 h-5 w-5 text-emerald-600" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <a
            href={p.ctaHref ?? "#"}
            className={[
              "mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-base font-semibold cursor-pointer transition duration-500",
              p.variant === "primary"
                ? "bg-themeSkyBlue text-themeTealWhite hover:bg-themeTeal"
                : "border border-themeTealLighter text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite",
            ].join(" ")}
          >
            {p.ctaLabel}
          </a>
        </article>
      ))}
    </section>
  );
}
