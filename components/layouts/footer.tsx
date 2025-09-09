"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "../ui";

type LinkItem = { label: string; href: string };
type LinkGroup = { title: string; items: LinkItem[] };

const groups: LinkGroup[] = [
  {
    title: "Products",
    items: [
      { label: "InvestApp Marketplace", href: "#" },
      { label: "InvestApp Pro", href: "#" },
      { label: "InvestApp Data", href: "#" },
      { label: "Custom Index", href: "#" },
    ],
  },
  {
    title: "Featured Insights",
    items: [
      { label: "Private Market Education", href: "#" },
      { label: "Private Market Updates", href: "#" },
      { label: "Investment Outlook", href: "#" },
      { label: "2025 Tech IPO Calendar", href: "#" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Press Releases", href: "#" },
      { label: "In the News", href: "#" },
      { label: "Careers", href: "#" },
      { label: "FAQs", href: "#" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Disclaimers & Disclosures", href: "#" },
      { label: "Form CRS", href: "#" },
      { label: "Terms of Use", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Cookies Settings", href: "#" },
    ],
  },
];

export default function Footer() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <footer className="bg-themeTeal text-themeTealWhite">
      <div className="appContainer py-12 md:py-16">
        <p className="mb-6 text-lg font-medium">Find your next potential opportunity</p>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {groups.map((g, i) => (
            <nav key={g.title} className="border-b border-white/10 pb-3 lg:border-0 lg:pb-0">
              <button
                type="button"
                className="flex w-full items-center justify-between lg:cursor-default"
                aria-expanded={open === i}
                aria-controls={`footer-col-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <h4 className="py-1 text-lg font-medium">{g.title}</h4>
                <span className="lg:hidden">
                  {open === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
              </button>

              {/* animated open/close */}
              <div
                id={`footer-col-${i}`}
                className={[
                  "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300",
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  "lg:grid-rows-[1fr] lg:opacity-100",
                ].join(" ")}
              >
                <ul className="min-h-0 mt-2 space-y-3 text-sm">
                  {g.items.map((it) => (
                    <li key={it.label}>
                      <Link
                        href={it.href}
                        className="transition-colors duration-200 hover:text-themeTealLight"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          ))}

          {/* 5th column: Social + CTA */}
          <div>
            <div className="mb-4 flex gap-3">
              {[Facebook, Twitter, Linkedin, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors duration-200 hover:bg-white/30"
                  aria-label="social"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <h4 className="text-lg font-medium">We’d love to hear from you</h4>
            <p className="mt-1 mb-3 text-sm">
              Our team is ready to guide you through the next steps towards accessing the private market.
            </p>
            <Button type="submit" variant="solid" color="skyblue" size="sm" text="Contact Us" href="/" />
          </div>
        </div>

        <div className="my-8 h-px w-full bg-white/20" />

        <div className="flex justify-between">
          <p className="mb-6 text-sm">&copy; Copyright Invest App, 2025. All rights reserved.</p>
          <p className="mb-6 text-sm">Developed by <Link href='https://www.crossatlanticsoftware.com/' target="_blank" className="transition duration-500 hover:text-themeTealLighter">Cross Atlantic Software</Link></p>
        </div>

        <div className="space-y-4 text-sm">
          <h5 className="font-medium">Disclaimer</h5>
          <p className="text-xs">
            All investments involve risk, including the risk of loss of principal. You should carefully consider your
            investment objectives, risks, transaction costs and other expenses before deciding to invest in options,
            swaps or other investments.
          </p>
          <p className="text-xs">
            This does not constitute an offer by Invest App to sell, or a solicitation of an offer to buy, any securities
            and may not be used or relied upon in connection with any offer or sale of securities. An offer or solicitation
            can be made only through the delivery of final offering document(s) and purchase agreement(s), and will be
            subject to the terms and conditions and risks delivered in such documents. Any securities offered are offered
            through Invest App, member FINRA/SIPC.
          </p>
        </div>
      </div>
    </footer>
  );
}