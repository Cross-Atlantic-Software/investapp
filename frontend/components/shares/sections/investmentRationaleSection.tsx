"use client";

import { useState } from "react";
import {
  TriangleAlert,
  AlertTriangle,
  Plus,
  Minus,
  TrendingUp,
} from "lucide-react";

type Item = { title: string; body: string };

export default function InvestmentRationaleSection() {
  const pros: Item[] = [
    {
      title: "Strong Fundamentals",
      body:
        "Nam fermentum metus ut eleifend fermentum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec efficitur dui nec erat gravida auctor.",
    },
    { title: "Positive Performance", body: sample },
    { title: "Fair Valuation", body: sample },
    { title: "Institutional Confidence", body: sample },
  ];

  const risks: Item[] = [
    {
      title: "Market Volatility",
      body:
        "Nam fermentum metus ut eleifend fermentum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec efficitur dui nec erat gravida auctor.",
    },
    { title: "Positive Performance", body: sample },
    { title: "Fair Valuation", body: sample },
    { title: "Institutional Confidence", body: sample },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* PROS */}
      <section className="space-y-4">
        <GroupHeader
          icon={<TrendingUp className="h-8 w-8 text-emerald-700" />}
          label="Investment Rationale"
          tone="good"
        />
        {pros.map((it, i) => (
          <AccordionRow
            key={it.title}
            icon={<TriangleAlert className="h-5 w-5 text-emerald-700" />}
            title={it.title}
            body={it.body}
            defaultOpen={i === 0}
          />
        ))}
      </section>

      {/* RISKS */}
      <section className="space-y-4">
        <GroupHeader
          icon={<TriangleAlert className="h-8 w-8 text-rose-600" />}
          label="Key Risks"
          tone="risk"
        />
        {risks.map((it, i) => (
          <AccordionRow
            key={it.title}
            icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
            title={it.title}
            body={it.body}
            defaultOpen={i === 0}
          />
        ))}
      </section>
    </div>
  );
}

/* ---------- UI bits ---------- */

function GroupHeader({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "good" | "risk";
}) {
  const box =
    tone === "good"
      ? "bg-emerald-100/80"
      : "bg-rose-100/80";
  const text =
    tone === "good" ? "text-emerald-700" : "text-rose-600";

  return (
    <div className="flex items-center gap-4">
      <div className={`h-14 w-14 rounded-md grid place-items-center ${box}`}>
        {icon}
      </div>
      <h4 className={`text-lg font-semibold ${text}`}>{label}</h4>
    </div>
  );
}

function AccordionRow({
  icon,
  title,
  body,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded border border-themeTealLighter bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-lg font-semibold text-themeTeal">{title}</span>
        </div>
        {open ? (
          <Minus className="h-5 w-5 text-themeTeal cursor-pointer" />
        ) : (
          <Plus className="h-5 w-5 text-themeTeal cursor-pointer" />
        )}
      </button>

      <div
        className={[
          "overflow-hidden transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <p className="px-5 pb-4 text-themeTealLight leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/* ---------- sample text ---------- */
const sample =
  "Nam fermentum metus ut eleifend fermentum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec efficitur dui nec erat gravida auctor.";
