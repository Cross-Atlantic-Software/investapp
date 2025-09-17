"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus, Minus, CircleCheck } from "lucide-react";

type InsightCard = {
  title: string;
  period?: string;
  src: string;
  alt?: string;
};

type Props = {
  cards?: InsightCard[];
};

export default function SectorOutlookSection({
  cards = [
    { title: "Sector performance", period: "Past 7 Days", src: "/images/graph1.png" },
    { title: "Sector performance vs Marketplace Average", period: "Past 6 Months", src: "/images/graph2.png" },
    { title: "Bid - Offer Ratio", period: "Past 8 Months", src: "/images/graph3.png" },
    { title: "Sector performance vs Marketplace Average", period: "Past 6 Months", src: "/images/graph4.png" },
    { title: "Total Raised to Date", src: "/images/graph5.png" },
    { title: "Employee Count", period: "Past 6 Months", src: "/images/graph6.png" },
  ],
}: Props) {
  const bullets = [
    {
      title: "Donec commodo dui sed enim commodo, nec aliquet lectus vestibulum.",
      body:
        "Vivamus rutrum metus convallis eros posuere tincidunt. Aenean venenatis rutrum metus, id cursus risus eleifend sed. Duis quis mattis nulla. Nunc fringilla fermentum fermentum. Ut orci tellus, viverra eu consequat et, porttitor eget leo. Aliquam nec erat porttitor, tempus metus quis, consequat nunc. Vivamus malesuada porttitor mattis.",
    },
    { title: "Donec commodo dui sed enim commodo, nec aliquet lectus vestibulum.", body: sample },
    { title: "Donec commodo dui sed enim commodo, nec aliquet lectus vestibulum.", body: sample },
    { title: "Donec commodo dui sed enim commodo, nec aliquet lectus vestibulum.", body: sample },
  ];

  return (
    <div className="space-y-4">
      <p className="text-themeTealLighter">
        Kraken is a crypto exchange based on euro volume and liquidity. Globally, Kraken&apos;s client base trades
        more than 100 digital assets and 8 different fiat currencies. Based in San Francisco, CA, Kraken was founded in
        2011 by Jesse Powell and was the first U.S. crypto firm to receive a state-chartered banking license, as well as
        one of the first exchanges to offer spot trading with margin, regulated derivatives and index services.
      </p>

      {/* Accordion */}
      <div className="space-y-3">
        {bullets.map((b, i) => (
          <AccordionRow key={i} title={b.title} body={b.body} defaultOpen={i === 0} />
        ))}
      </div>

      <div className="pt-1 text-themeTeal font-semibold text-lg">
        Sector and Market Insights for sophisticated investors
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => (
          <div key={`${c.title}-${i}`} className="rounded-md bg-white p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-md font-medium text-themeTeal">{c.title}</span>
              {c.period && <span className="text-themeTealLighter">{c.period}</span>}
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-white">
              <Image
                src={c.src}
                alt={c.alt ?? c.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Accordion row ---------- */

function AccordionRow({
  title,
  body,
  defaultOpen = false,
}: {
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
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
      >
        <div className="flex items-center gap-1">
          <span className="grid">
            <CircleCheck className="h-4 w-4 text-themeTeal" />
          </span>
          <span className="text-themeTeal font-medium">{title}</span>
        </div>
        {open ? <Minus className="h-5 w-5 text-themeTeal cursor-pointer" /> : <Plus className="h-5 w-5 text-themeTeal cursor-pointer" />}
      </button>

      <div
        className={[
          "overflow-hidden border-t border-themeTealLighter px-3 transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <p className="text-themeTealLighter">{body}</p>
      </div>
    </div>
  );
}

/* sample filler */
const sample =
  "Cras congue, odio non commodo iaculis, eros magna aliquet libero, eget dictum arcu mauris sed enim. Curabitur ultricies nunc quam, ac ultrices urna laoreet non.";
