"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  // Close when route changes (e.g., link click)
  useEffect(() => {
    setOpen(false);
  }, [pathname]); // <-- key line

  return (
    <div className="bg-themeTealWhite p-4 sm:p-6">
      {/* mobile menu button */}
      <div className="mb-4 flex md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-themeTealLighter px-3 py-2 text-themeTeal"
        >
          <Menu className="h-5 w-5" /> Menu
        </button>
      </div>

      <div className="md:flex md:gap-6">
        {/* sidebar (desktop) */}
        <aside className="hidden shrink-0 md:block md:w-72 lg:w-80">
          <DashboardSidebar />
        </aside>

        {/* page content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-xs bg-themeTealWhite p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <span className="font-semibold text-themeTeal">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-themeTeal" />
              </button>
            </div>
            <DashboardSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
