"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { id: string; label: string; sub?: string };

export default function SectionNav({
  items,
  offset = 88,
}: {
  items: Item[];
  offset?: number;
}) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: `-${offset + 8}px 0px -70% 0px`, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items, offset]);

  const onJump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const cols = useMemo(() => Math.min(6, Math.max(3, items.length)), [items.length]);

  return (
    <div className="sticky top-0 z-30 rounded border border-themeTealLighter bg-themeTealWhite">
      {/* desktop / tablet: text row like in mock */}
      <div
        className="hidden md:flex items-center justify-between gap-0"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
      >
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onJump(it.id)}
              className={[
                "shrink-0 p-3 text-sm transition-colors transition duration-500 cursor-pointer font-medium",
                isActive ? "bg-themeTeal text-themeTealWhite" : "text-themeTealLight hover:text-themeTeal",
              ].join(" ")}
              aria-current={isActive ? "true" : undefined}
            >
              {it.label}
            </button>
          );
        })}
      </div>

      {/* mobile: horizontal chips */}
      <div className="md:hidden overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onJump(it.id)}
                className={[
                  "whitespace-nowrap px-3 py-2 text-sm",
                  isActive
                    ? "bg-themeTeal text-themeTealWhite"
                    : "text-themeTeal border-themeTealLighter",
                ].join(" ")}
                aria-current={isActive ? "true" : undefined}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
