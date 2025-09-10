"use client";

import { ChevronRight, ArrowRight, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "../ui";

type FilterProps = { title: string; items: string[] };

const FilterItem = ({ title, items }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="py-3 mx-4 border-b border-themeTealLighter last:border-0 text-themeTeal">
      <button
        type="button"
        className="w-full flex justify-between items-center cursor-pointer"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronRight className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <ul className="py-2 pl-1">
            {items.map((item, i) => (
              <li key={i} className="py-1 flex items-center">
                <ArrowRight className="inline relative -top-[2px]" size={14} /> {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function Filters() {
  const [collapsed, setCollapsed] = useState(false);
  const bodyId = useId();

  const filterData = [
    { title: "Investment Solutions", items: ["Option 1", "Option 2", "Option 3"] },
    { title: "Availability Status", items: ["Available", "Unavailable"] },
    { title: "Latest Valuation", items: ["Above $1M", "Below $1M"] },
    { title: "Share Class", items: ["Class A", "Class B"] },
    { title: "Investment Size", items: ["$1M - $5M", "$5M - $10M"] },
    { title: "Industry Groups", items: ["Technology", "Healthcare"] },
    { title: "Industries", items: ["Finance", "Retail"] },
    { title: "Themes", items: ["Growth", "Sustainability"] },
    { title: "VC Investors", items: ["Investor 1", "Investor 2"] },
  ];

  return (
    <aside
      className={[
        "rounded bg-themeTealWhite overflow-hidden transition-[width] duration-300",
        "w-full",
        collapsed ? "lg:w-12" : "lg:w-[clamp(260px,28vw,300px)]",
      ].join(" ")}
    >
      {/* header */}
      <div className="justify-between items-center p-4 hidden md:flex">
        <h3 className={collapsed ? "sr-only" : "text-lg font-semibold text-themeTeal"} id={`${bodyId}-label`}>
          Filters
        </h3>
        <button
          type="button"
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? "Expand filters" : "Collapse filters"}
          aria-controls={bodyId}
          aria-expanded={!collapsed}
          className="p-1.5 rounded hover:bg-slate-100 cursor-pointer"
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5 stroke-themeTeal" /> : <PanelLeftClose className="h-5 w-5 stroke-themeTeal" />}
        </button>
      </div>

      <div className="hidden md:block bg-themeTeal h-px" />

      {/* collapsible body that the header button controls */}
      <div id={bodyId} aria-labelledby={`${bodyId}-label`} hidden={collapsed}>
        {filterData.map((f, i) => (
          <FilterItem key={i} title={f.title} items={f.items} />
        ))}

        <div className="flex justify-between items-center p-4">
          <Button text="Clear All" color="themeTeal" variant="outline" size="sm" href="/" />
          <Button text="Filter Result" color="themeTeal" variant="solid" size="sm" href="/" />
        </div>
      </div>
    </aside>
  );
}
