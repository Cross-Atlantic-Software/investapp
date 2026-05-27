// components/faq/Faq.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Heading } from "../ui";

export type FaqItem = {
  id?: string;                 // optional stable id (nice to have)
  q: string;
  a: React.ReactNode;
};

export default function Faq({
  items,
  heading = "Frequently Asked Questions",
  intro = "Find quick answers to the most common questions about orders, shipping, returns, and more.",
  className = "",
  allowMultiple = true,
}: {
  items: FaqItem[];
  heading?: string;
  intro?: string;
  className?: string;
  /** if false, opening one closes others */
  allowMultiple?: boolean;
}) {
  // Split into two columns deterministically
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  // Track open items by a UNIQUE id we construct as `${col}-${idx}` (or provided id)
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpen(prev => {
      if (!allowMultiple) return new Set(prev.has(id) ? [] : [id]);

      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderItem = (it: FaqItem, idx: number, col: "L" | "R") => {
    const uid = it.id ?? `${col}-${idx}`; // ← unique across columns
    const isOpen = open.has(uid);

    return (
      <div key={uid} className="rounded border border-themeTealLighter bg-white">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => toggle(uid)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-themeTeal hover:bg-themeTealWhite/60"
        >
          <span className="font-medium">{it.q}</span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-themeTealLight transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className="px-4 text-themeTealLight"
          style={{
            maxHeight: isOpen ? 600 : 0,
            overflow: "hidden",
            transition: "max-height 240ms ease",
          }}
        >
          <div className="pb-4 pt-2">{it.a}</div>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-10 bg-themeTealWhite md:py-16 ${className}`}>
        <div className="appContainer">
            <div className="mx-auto max-w-6xl text-center">
                <Heading as="h2" className="">{heading}</Heading>
                {intro && <p className="mt-3 text-themeTealLight">{intro}</p>}
            </div>

            <div className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-2">
                <div className="space-y-4">{left.map((it, i) => renderItem(it, i, "L"))}</div>
                <div className="space-y-4">{right.map((it, i) => renderItem(it, i, "R"))}</div>
            </div>
        </div>
    </section>
  );
}
