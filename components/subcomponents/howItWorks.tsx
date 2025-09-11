// components/marketing/HowItWorks.tsx
"use client";
import type { ComponentType } from "react";
import { FileText, Award, Handshake, IndianRupee } from "lucide-react";

export type HowStep = {
  id: string;
  title: string;      // e.g. "Apply" (numbering is added automatically)
  body: string;       // short description
  icon?: ComponentType<{ className?: string }>;
};

export default function HowItWorks({
  items = DEFAULT_STEPS,
  className = "",
}: {
  items?: HowStep[];
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => {
          const Icon = s.icon ?? FileText;
          return (
            <article key={s.id} className="text-center">
              <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-white shadow-sm ring-1 ring-themeTealLighter">
                <Icon className="h-10 w-10 text-themeTeal" />
              </div>
              <h3 className="text-xl font-semibold text-themeTeal">
                {i + 1}. {s.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-md leading-snug text-themeTealLighter">
                {s.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const DEFAULT_STEPS: HowStep[] = [
  {
    id: "apply",
    title: "Apply",
    body: "Submit your application with required documentation and credentials",
    icon: FileText,
  },
  {
    id: "certified",
    title: "Get Certified",
    body: "Complete our training program and certification process",
    icon: Award,
  },
  {
    id: "refer",
    title: "Start Referring",
    body: "Begin introducing clients to our investment opportunities",
    icon: Handshake,
  },
  {
    id: "earn",
    title: "Earn Commissions",
    body: "Receive monthly commission payments for successful investments",
    icon: IndianRupee,
  },
];
