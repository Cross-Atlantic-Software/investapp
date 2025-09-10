"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

type QA = { q: string; a: string; defaultOpen?: boolean };

export default function FaqSection({ items = DEFAULT_QA }: { items?: QA[] }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <FaqItem key={i} {...it} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: QA) {
  const [open, setOpen] = useState(defaultOpen);
  const [maxH, setMaxH] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) setMaxH(innerRef.current.scrollHeight);
  }, [a]);

  return (
    <div className="rounded border border-themeTealLighter bg-white">
      <button
        type="button"
        className="w-full flex items-start justify-between gap-3 px-3 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-sky-600" />
          <span className="font-semibold text-themeTeal">{q}</span>
        </div>
        {open ? (
          <Minus className="h-5 w-5 text-themeTealLight cursor-pointer" />
        ) : (
          <Plus className="h-5 w-5 text-themeTeal cursor-pointer" />
        )}
      </button>

      <div
        className="overflow-hidden border-t border-themeTealLighter transition-[max-height,opacity] duration-300 ease-out"
        style={{ maxHeight: open ? maxH : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={innerRef} className="px-3 py-3 text-themeTealLight">
          {a}
        </div>
      </div>
    </div>
  );
}

/* demo content */
const DEFAULT_QA: QA[] = [
  {
    q: "How are Invest App prices calculated?",
    a: "They reflect recent matched trades and indicative quotes from verified counterparties.",
  },
  {
    q: "What is the settlement period?",
    a: "The expected settlement date is shown on the Buy tab and depends on the company’s registrar workflow.",
  },
  {
    q: "Is there a minimum order size?",
    a: "Orders must meet both Min. Units and Lot Size shown on the trade card.",
  },
  {
    q: "Can I cancel an order?",
    a: "Open orders can be withdrawn anytime before they match. Matched trades move to settlement and cannot be cancelled.",
  },
];
