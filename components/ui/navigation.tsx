// components/ui/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./logo";
import Button from "./button";

export type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

export default function Navigation({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // lock scroll + ESC to close
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const active = (href?: string) =>
    href && pathname?.startsWith(href) ? "text-themeTeal" : "text-ink-heading";

  return (
    <div className="relative">
      {/* Desktop */}
      <nav className="hidden md:block">
        <ul className="flex items-center gap-5 xl:gap-8">
          {items.map((it, i) =>
            !it.children ? (
              <li key={i}>
                <Link
                  href={it.href ?? "#"}
                  className={`font-medium text-sm xl:text-base text-themeTeal hover:text-themeSkyBlue transition duration-300 ${active(it.href)}`}
                >
                  {it.label}
                </Link>
              </li>
            ) : (
              <li key={i} className="relative group">
                <button
                  className="flex items-center gap-1 font-medium text-sm xl:text-base text-themeTeal hover:text-themeSkyBlue transition duration-300"
                  aria-haspopup="menu"
                >
                  {it.label}
                  <ChevronDown size={18} className="transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* animated hover dropdown */}
                <div
                  className="pointer-events-none absolute left-0 top-full z-50 w-56 pt-4
                             opacity-0 translate-y-1 transition duration-200 ease-out
                             group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                >
                  <ul role="menu" className="bg-themeTealWhite p-2 rounded-sm">
                    {it.children.map((c, j) => (
                      <li key={j}>
                        <Link
                          role="menuitem"
                          href={c.href}
                          className="block rounded-sm px-3 py-2 text-sm xl:text-base text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          )}
        </ul>
      </nav>

      {/* Mobile toggle */}
      <div className="flex items-center justify-end md:hidden">
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-themeTeal text-themeTealWhite"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Off-canvas (mobile) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => {
            setOpen(false);
            setOpenIdx(null);
          }}
        />

        {/* Drawer */}
        <aside
          className={`absolute left-0 top-0 h-full w-[min(90vw,320px)] bg-themeTealWhite
                      border-r border-black/5 shadow-2xl transition-transform duration-300 ease-out
                      ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-full flex-col">
            {/* header */}
            <div className="flex items-center justify-between border-b border-themeTeal/20 px-4 py-3">
              <Logo href="/" />
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-themeTeal"
              >
                <X size={30} />
              </button>
            </div>

            {/* scrollable nav */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="p-2">
                {items.map((it, i) =>
                  !it.children ? (
                    <li key={i}>
                      <Link
                        href={it.href ?? "#"}
                        onClick={() => setOpen(false)}
                        className={`block px-3 py-4 text-lg font-medium text-themeTeal hover:bg-themeTealWhite ${active(it.href)}`}
                      >
                        {it.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={i}>
                      <button
                        className="flex w-full items-center justify-between px-3 py-4 text-left text-lg font-medium text-themeTeal"
                        onClick={() => setOpenIdx((v) => (v === i ? null : i))}
                        aria-expanded={openIdx === i}
                        aria-controls={`mobile-sub-${i}`}
                      >
                        <span>{it.label}</span>
                        <ChevronDown
                          size={20}
                          className={`${openIdx === i ? "rotate-180" : ""} transition-transform duration-300`}
                        />
                      </button>

                      {/* animated accordion */}
                      <div
                        id={`mobile-sub-${i}`}
                        className={`grid overflow-hidden transition-all duration-300 ease-out ${
                          openIdx === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <ul className="min-h-0">
                          {it.children.map((c, j) => (
                            <li key={j}>
                              <Link
                                href={c.href}
                                onClick={() => {
                                  setOpen(false);
                                  setOpenIdx(null);
                                }}
                                className="block px-4 mx-2 py-2 text-lg font-medium text-themeTeal bg-themeTeal/10"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* bottom CTAs */}
            <div className="mt-auto space-y-3 p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button text="Sign In" color="themeTeal" variant="outline" size="sm" href="/login" className="w-full" />
              <Button text="Get Started" color="themeTeal" variant="solid" size="sm" href="/register/step-1" className="w-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
