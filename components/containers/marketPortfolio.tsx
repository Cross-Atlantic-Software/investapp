"use client";

import { Heading } from "../ui";
import { PortfolioTable } from "../subcomponents";
import PlatformFeatures, { type Feature } from "../subcomponents/platformFeatures";
import { Clipboard, TrendingUp } from "lucide-react";

/* ---------- shared shell ---------- */
const cardCls =
  "rounded-xl bg-white ring-1 ring-black/5 shadow-sm p-5 sm:p-6";

function CardHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#EFF6FB"
          strokeWidth={stroke}
          fill="none"
        />
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

/* ---------- individual cards ---------- */
function OverviewCard() {
  return (
    <div className={cardCls}>
      <CardHeader
        title="Portfolio Overview"
        right={<Clipboard className="h-5 w-5 text-themeTeal/80" />}
      />
      <div className="text-3xl font-semibold text-themeTeal">₹28.5L</div>

      <div className="mt-3 text-sm font-semibold text-emerald-600">
        ↗ +₹4.3L (17.5%)
      </div>
      <div className="mt-2 text-sm text-themeTealLighter">
        Last updated: Aug 10, 02:30 pm
      </div>
    </div>
  );
}

function RiskCard() {
  const pct = 68;
  return (
    <div className={cardCls}>
      <CardHeader
        title="Portfolio Risk"
        right={<span className="h-2.5 w-2.5 rounded-full bg-amber-500" />}
      />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-semibold text-themeTeal">6.8</div>
          <div className="mt-1 text-sm text-slate-500">Risk Score</div>
          <div className="mt-3 text-sm font-semibold text-amber-500">
            Moderate Risk
          </div>
        </div>

        <RiskRing pct={pct} />
      </div>
    </div>
  );
}

function RecoCard() {
  return (
    <div className={cardCls}>
      <CardHeader
        title="Smart Recommendations"
        right={<TrendingUp className="h-5 w-5 text-themeTeal/80" />}
      />
      <div className="text-md font-semibold text-themeTeal">
        Diversify into SaaS
      </div>
      <p className="mt-2 text-xs leading-4 text-themeTealLighter">
        Add B2B SaS companies to reduce sector concentration risk
      </p>
      <div className="mt-3 text-sm font-semibold text-themeSkyBlue">
        Potential ROI: +12%
      </div>
    </div>
  );
}

function OpportunityCard() {
  return (
    <div className={cardCls}>
      <CardHeader
        title="Opportunity Alert"
        right={<span className="h-3 w-3 rounded-full bg-emerald-600" />}
      />
      <div className="text-md font-semibold text-themeTeal">Liquidity Window</div>
      <p className="mt-2 text-xs leading-4 text-themeTealLighter">Razorpay secondary sale opportunity available</p>
      <div className="mt-3 text-sm font-semibold text-emerald-700">Est. Premium: 15–20%</div>
    </div>
  );
}

/* ---------- page ---------- */
export default function MarketPortfolio() {
  const rows = [
    { id: "r1", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▲ 12.5%", risk: "Low" as const, action: "Buy" as const },
    { id: "r2", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▼ 12.5%", risk: "High" as const, action: "Sell" as const },
    { id: "r1", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▲ 12.5%", risk: "Low" as const, action: "Buy" as const },
    { id: "r2", company: "Razorpay", sector: "Fintech", shares: 150, price: "₹8,500", value: "₹1,275,000", change: "▼ 12.5%", risk: "High" as const, action: "Sell" as const },
  ];

  const features: Feature[] = [
    { id: "f1", title: "Deeper Insights", description: "Track the value of private company stock based on recent market activity, instead of marking everything at book value." },
    { id: "f2", title: "Market Notifications", description: "Receive email alerts as soon as price movements are detected for select private issuers or target sectors." },
    { id: "f3", title: "Automated Reporting", description: "Receive a monthly digest with price movements and observed trades for a pre-selected set of issuers." },
    { id: "f4", title: "Automated Reporting", description: "Receive a monthly digest with price movements and observed trades for a pre-selected set of issuers." },
  ];

  return (
    <section className="bg-themeTeal">
      <div className="appContainer py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Heading as="h2" className="mb-3 text-themeTealWhite">
            Monitor your Private Market Portfolio
          </Heading>
          <p className="mb-6 text-themeTealWhite/90">
            Monitor a range of private market investments with our platform and comprehensive data
            reporting powered by MarketPrice.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left rail: platform features */}
          <PlatformFeatures items={features} />

          {/* Right: cards + table */}
          <div className="space-y-6">
            {/* four spec-matched cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <OverviewCard />
              <RiskCard />
              <RecoCard />
              <OpportunityCard />
            </div>

            {/* filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-themeTealWhite p-4">
                <Heading as="h5" className="text-themeTeal">Holdings</Heading>
                <div className="flex items-center gap-2">
                    <select className="rounded-sm border border-themeTealLighter text-themeTeal focus:outline-none px-3 py-2 text-sm">
                        <option>All Sectors</option>
                        <option>Fintech</option>
                        <option>SaaS</option>
                    </select>
                    <select className="rounded-sm border border-themeTealLighter text-themeTeal focus:outline-none px-3 py-2 text-sm">
                        <option>1Y</option>
                        <option>6M</option>
                        <option>3M</option>
                    </select>
                </div>
            </div>

            {/* table below */}
            {/* wrap if you want the same white card background */}
            <div className="rounded-md bg-themeTealWhite p-4">
                <PortfolioTable rows={rows} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
