"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Heading } from "@/components/ui";

type Props = {
  id: string;
  title: string;
  children: React.ReactNode;
  /** text or JSX shown when the info icon is clicked */
  info?: React.ReactNode;
};

export default function Section({ id, title, children, info }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id={id} className="scroll-mt-24 rounded border border-themeTealLighter bg-themeTealWhite p-6">
      <div className="mb-3 flex items-center gap-2 pb-2 border-b border-themeTealLighter">
        <Heading as="h5" className="font-semibold text-themeTeal">{title}</Heading>

        {info ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Hide info" : "Show info"}
            aria-expanded={open}
            className="outline-none cursor-pointer"
          >
            <Info className="h-5 w-5 text-amber-500" />
          </button>
        ) : null}
      </div>

      {info ? (
        <div
          className={[
            "mb-3 overflow-hidden transition-[max-height,opacity] duration-300",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
          role="region"
        >
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {info}
          </div>
        </div>
      ) : null}

      <div>{children}</div>
    </section>
  );
}
