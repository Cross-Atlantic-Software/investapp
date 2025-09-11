"use client";

import { useMemo } from "react";
import { Clipboard, TrendingUp, Download } from "lucide-react";
import { PortfolioTable } from "@/components/dashboard";
import UpdatesListing, { type UpdateItem } from "@/components/dashboard/updatesListing";
import { Button, Heading } from "@/components/ui";

/* ---------- shared shell ---------- */
const cardCls = "rounded bg-white p-4 sm:p-6";

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-[15px] font-semibold text-themeTeal">{title}</p>
      {right}
    </div>
  );
}

/* ---------- circular gauge for Risk ---------- */
function RiskRing({ pct }: { pct: number }) {
  const size = 72;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EFF6FB" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#F2B705"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-base font-semibold text-[#F2B705]">{pct}%</span>
      </div>
    </div>
  );
}

/* ---------- cards ---------- */
function OverviewCard() {
  return (
    <div className={cardCls}>
      <CardHeader title="Portfolio Overview" right={<Clipboard className="h-5 w-5 text-themeTeal/80" />} />
      <div className="text-3xl font-semibold text-themeTeal">₹28.5L</div>
      <div className="mt-3 text-sm font-semibold text-emerald-600">↗ +₹4.3L (17.5%)</div>
      <div className="mt-2 text-sm text-themeTealLighter">Last updated: Aug 10, 02:30 pm</div>
    </div>
  );
}
function RiskCard() {
  const pct = 68;
  return (
    <div className={cardCls}>
      <CardHeader title="Portfolio Risk" right={<span className="h-2.5 w-2.5 rounded-full bg-amber-500" />} />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-semibold text-themeTeal">6.8</div>
          <div className="mt-1 text-sm text-slate-500">Risk Score</div>
          <div className="mt-3 text-sm font-semibold text-amber-500">Moderate Risk</div>
        </div>
        <RiskRing pct={pct} />
      </div>
    </div>
  );
}
function RecoCard() {
  return (
    <div className={cardCls}>
      <CardHeader title="Smart Recommendations" right={<TrendingUp className="h-5 w-5 text-themeTeal/80" />} />
      <div className="text-md font-semibold text-themeTeal">Diversify into SaaS</div>
      <p className="mt-2 text-xs leading-4 text-themeTealLighter">Add B2B SaS companies to reduce sector concentration risk</p>
      <div className="mt-3 text-sm font-semibold text-themeSkyBlue">Potential ROI: +12%</div>
    </div>
  );
}
function OpportunityCard() {
  return (
    <div className={cardCls}>
      <CardHeader title="Opportunity Alert" right={<span className="h-3 w-3 rounded-full bg-emerald-600" />} />
      <div className="text-md font-semibold text-themeTeal">Liquidity Window</div>
      <p className="mt-2 text-xs leading-4 text-themeTealLighter">Razorpay secondary sale opportunity available</p>
      <div className="mt-3 text-sm font-semibold text-emerald-700">Est. Premium: 15–20%</div>
    </div>
  );
}

/* ---------- page ---------- */
export default function DashboardPage() {
  const rows = useMemo(
    () => [
      { id: "r1", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▲ 12.5%", risk: "Low" as const, action: "Buy" as const },
      { id: "r2", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▼ 12.5%", risk: "High" as const, action: "Sell" as const },
      { id: "r3", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▲ 12.5%", risk: "Low" as const, action: "Buy" as const },
      { id: "r4", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▼ 12.5%", risk: "High" as const, action: "Sell" as const },
      { id: "r5", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▲ 12.5%", risk: "Low" as const, action: "Sell" as const },
      { id: "r6", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▼ 12.5%", risk: "High" as const, action: "Sell" as const },
      { id: "r7", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▲ 12.5%", risk: "Low" as const, action: "Sell" as const },
      { id: "r8", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▼ 12.5%", risk: "High" as const, action: "Sell" as const },
    ],
    []
  );

  const updates: UpdateItem[] = [
    { id: "u1", title: "Razorpay shares up 12.5% today", time: "2 hours ago", state: "live", href: "#" },
    { id: "u2", title: "Swiggy sell requests pending approval", time: "6 hours ago", state: "live", href: "#" },
    { id: "u3", title: "New liquidity window available for OLA Electric", time: "1 day ago", state: "muted", href: "#" },
    { id: "u4", title: "Swiggy sell requests pending approval", time: "6 hours ago", state: "muted", href: "#" },
  ];

  return (
    <section>
      {/* header */}
      <div className="mb-4 flex flex-col gap-3 rounded bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading as="h5" className="font-semibold">
          Portfolio Dashboard
        </Heading>
        <Button
          text="Download Snapshot"
          color="themeTeal"
          variant="outline"
          size="sm"
          href="/"
          icon={Download}
          iconPosition="left"
        />
      </div>

      {/* top summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard />
        <RiskCard />
        <RecoCard />
        <OpportunityCard />
      </div>

      {/* holdings + updates */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* holdings */}
        <section className="min-w-0 rounded bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <Heading as="h5" className="text-themeTeal">
              Holdings
            </Heading>
            <div className="flex items-center gap-2">
              <select className="rounded-sm border border-themeTealLighter px-3 py-2 text-sm text-themeTeal focus:outline-none">
                <option>All Sectors</option>
                <option>Fintech</option>
                <option>SaaS</option>
              </select>
              <select className="rounded-sm border border-themeTealLighter px-3 py-2 text-sm text-themeTeal focus:outline-none">
                <option>1Y</option>
                <option>6M</option>
                <option>3M</option>
              </select>
            </div>
          </div>

          {/* table: scroll on small screens */}
          <div className="-mx-2 overflow-x-auto sm:mx-0">
            <div className="min-w-[720px] sm:min-w-0">
              <PortfolioTable rows={rows} />
            </div>
          </div>
        </section>

        {/* updates (right column) */}
        <aside className="space-y-4 lg:sticky lg:top-4">
          <UpdatesListing items={updates} heading="Recent Activities" className="p-2" />
          <UpdatesListing items={updates} heading="Upcoming Opportunities & Events" className="p-2" />
        </aside>
      </div>
    </section>
  );
}
