// components/dashboard/DashboardSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GROUPS } from "./nav";

export default function DashboardSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();

  return (
    <nav className="rounded bg-white p-3">
      {GROUPS.map((g) => (
        <div key={g.title} className="mb-4">
          <div className="py-2 text-xs uppercase tracking-wide text-themeTealLight">{g.title}</div>
          <div className="space-y-1">
            {g.items.map((it) => {
              const isExact = pathname === it.href;
              const isPrefix = pathname.startsWith(it.href + "/");
              const active = it.href === "/dashboard" ? isExact : isExact || isPrefix;
              const Icon = it.icon;

              return (
                <Link
                  key={it.id}
                  href={it.href}
                  onClick={onNavigate}                     // <<< close drawer on click
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    active ? "bg-themeTealWhite text-themeTeal" : "text-themeTeal hover:bg-themeTealWhite",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 text-themeTealLighter" />
                  <span className="truncate">{it.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
