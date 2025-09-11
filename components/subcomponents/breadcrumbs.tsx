import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-themeTealLight text-sm">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-4 w-4 opacity-70" />}
            {c.href ? (
              <a href={c.href} className="text-themeTeal hover:text-themeSkyBlue trasnition duration-500">{c.label}</a>
            ) : (
              <span className="text-themeTealLighter">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
