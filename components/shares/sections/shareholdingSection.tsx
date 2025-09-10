"use client";

import Image from "next/image";
import { useState } from "react";

export type CompareTile = {
  id: string;
  title: string;
  line2?: string;
  line3?: string;
};

type Props = {
  /* left */
  pieSrc?: string;
  pieHeading?: string;          // e.g., "Shareholding Snapshot"
  pieSub?: string;              // e.g., "July 2025"
  pieInfo?: string;

  /* right */
  compareHeading?: string;      // e.g., "Shareholding Compare (1% Holding)"
  compareInfo?: string;
  items?: CompareTile[];
  editable?: boolean;
  onChange?: (next: CompareTile[]) => void;
};

export default function ShareholdingSection({
  pieSrc = "/images/pie-chart.webp",
  pieHeading = "Shareholding Snapshot",
  pieSub = "",
  compareHeading = "Shareholding Compare (1% Holding)",
  items = DEFAULT_ITEMS,
  editable = false,
  onChange,
}: Props) {
  const [data, setData] = useState<CompareTile[]>(items);

  const update = (id: string, key: keyof CompareTile, val: string) => {
    const next = data.map((t) => (t.id === id ? { ...t, [key]: val } : t));
    setData(next);
    onChange?.(next);
  };

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT: PIE IMAGE */}
      <div className="rounded bg-white p-4 md:p-5">
        <div className="mb-3">
          <h3 className="text-md font-semibold text-themeTeal">
            {pieHeading}
            {pieSub ? `: ${pieSub}` : ""}
          </h3>
        </div>
        <div className="relative  w-full overflow-hidden">
          <Image
            src={pieSrc}
            alt={`${pieHeading} ${pieSub}`.trim()}
            width={500}
            height={339}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* RIGHT: TEXT TILES */}
      <div className="rounded bg-white p-4 md:p-5">
        <div className="mb-4">
          <h3 className="text-md font-semibold text-themeTeal">
            {compareHeading}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.map((t) => (
            <div
              key={t.id}
              className="rounded bg-themeTealWhite p-3"
            >
              <Editable
                text={t.title}
                editable={editable}
                onChange={(v) => update(t.id, "title", v)}
                className="text-themeTeal text-sm font-semibold leading-5"
              />
              {t.line2 !== undefined && (
                <Editable
                  text={t.line2}
                  editable={editable}
                  onChange={(v) => update(t.id, "line2", v)}
                  className="mt-2 text-themeTealLight text-sm"
                />
              )}
              {t.line3 !== undefined && (
                <Editable
                  text={t.line3}
                  editable={editable}
                  onChange={(v) => update(t.id, "line3", v)}
                  className="text-themeTealLight text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* inline editor */
function Editable({
  text,
  editable,
  onChange,
  className,
}: {
  text: string;
  editable: boolean;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent ?? "")}
      role={editable ? "textbox" : undefined}
      aria-label={editable ? "Edit text" : undefined}
    >
      {text}
    </div>
  );
}

/* sample tiles */
const DEFAULT_ITEMS: CompareTile[] = [
  { id: "m1", title: "Majority shareholders", line2: "Promoters" },
  { id: "p1", title: "Pledged Promoter Holdings", line2: "None" },
  { id: "mf1", title: "Mutual Funds", line2: "Held by 29 Schemes", line3: "(19.52%)" },

  { id: "m2", title: "Majority shareholders", line2: "Promoters" },
  { id: "p2", title: "Pledged Promoter Holdings", line2: "None" },
  { id: "mf2", title: "Mutual Funds", line2: "Held by 29 Schemes", line3: "(19.52%)" },

  { id: "m3", title: "Majority shareholders", line2: "Promoters" },
  { id: "p3", title: "Pledged Promoter Holdings", line2: "None" },
  { id: "mf3", title: "Mutual Funds", line2: "Held by 29 Schemes", line3: "(19.52%)" },
];
