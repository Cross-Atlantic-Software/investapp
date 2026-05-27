"use client";

import { LucideIcon, BarChart2, Bell, FileText, ChartBar } from "lucide-react";
import { Heading } from "../ui";

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon?: LucideIcon;
};

export default function PlatformFeatures({ items }: { items: Feature[] }) {
  const fallbackIcons: LucideIcon[] = [BarChart2, Bell, FileText, ChartBar]; // optional

  return (
    <aside>
      <ul className="divide-y divide-themeTealLighter">
        {items.map((f, i) => {
          const Icon = f.icon ?? fallbackIcons[i % fallbackIcons.length];
          return (
            <li key={f.id} className="py-8 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3 text-themeTealWhite">
                {/* optional icon */}
                <span className="mt-1 flex-none grid aspect-square w-10 place-items-center rounded-sm bg-themeTealWhite text-themeTeal leading-none">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <Heading as="h5" className="mb-2 text-themeTealWhite">
                    {f.title}
                  </Heading>
                  <p className="text-sm leading-5">{f.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
