// components/marketing/WhyBox.tsx
import { CircleCheck, IndianRupee } from "lucide-react";
import React from "react";

type IconCmp = React.ComponentType<{ className?: string }>;

export default function WhyBox({
  title,
  description,
  bullets = [],
  icon: Icon = IndianRupee,
  className = "",
  iconBgClass = "bg-themeTeal",
  iconColorClass = "text-white",
}: {
  title: string;
  description?: string;
  bullets?: string[];
  icon?: IconCmp;                // pass any Lucide icon (or your own)
  className?: string;
  iconBgClass?: string;          // optional styling hooks
  iconColorClass?: string;
}) {
  return (
    <article
      className={[
        "rounded border border-themeTealLighter bg-white p-5 sm:p-8",
        className,
      ].join(" ")}
    >
      <div className="mb-4 grid place-items-center sm:place-items-start">
        <div
          className={[
            "grid h-20 w-20 place-items-center rounded-full",
            iconBgClass,
          ].join(" ")}
        >
          <Icon className={`h-8 w-8 ${iconColorClass}`} />
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-themeTeal">{title}</h3>

      {description ? (
        <p className="mt-2 text-md leading-6 text-themeTealLighter">{description}</p>
      ) : null}

      {bullets.length > 0 && (
        <ul className="mt-4 space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-themeTeal">
              <CircleCheck className="mt-1 h-4 w-4 text-themeTeal" />
              <span className="text-md">{b}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
