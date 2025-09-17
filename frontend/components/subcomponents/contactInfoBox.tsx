// components/partner/ContactInfoBox.tsx
"use client";

import * as React from "react";
import type { LucideProps } from "lucide-react";
import { Button } from "../ui";

type CTA = {
  label: string;
  href: string;
  target?: "_blank" | "_self";
  rel?: string;
  variant?: "solid" | "outline";
};

type Props = {
  icon: React.ComponentType<LucideProps>;
  title: string;
  lines?: Array<string | React.ReactNode>;
  cta?: CTA;
  className?: string;
};

export default function ContactInfoBox({
  icon: Icon,
  title,
  lines = [],
  cta,
  className = "",
}: Props) {
  return (
    <section
      className={[
        "rounded border border-themeTealLighter p-6 sm:p-8 text-center",
        className,
      ].join(" ")}
    >
      {/* big circular icon */}
      <div className="mx-auto mb-6 grid h-28 w-28 place-items-center rounded-full bg-themeTeal text-white sm:h-26 sm:w-26">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
      </div>

      <h3 className="text-xl font-semibold text-themeTeal">{title}</h3>

      <div className="mt-3 space-y-2 text-base leading-5 text-themeTealLight m-4">
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {cta && (
        <Button text={cta.label} color="themeTeal" variant="outline" size="sm" href={cta.href} />
      )}
    </section>
  );
}
