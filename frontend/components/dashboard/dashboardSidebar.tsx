// components/dashboard/DashboardSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { GROUPS } from "./nav";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function DashboardSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
    onNavigate?.();
  };

  return (
    <nav className="rounded bg-white p-3">
      {/* User Info */}
      {user && (
        <div className="mb-4 border-b border-themeTealLighter pb-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-themeTeal text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-themeTeal">{user.email}</p>
              <p className="truncate text-xs text-themeTealLighter">Welcome back!</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Logout Button */}
      <div className="mt-4 border-t border-themeTealLighter pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
