"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Info } from "lucide-react";

type StateOpt = { code: string; name: string; stampRate: number }; // rate on order value
type Method = "Demat Transfer" | "Physical Delivery";

const STATES: StateOpt[] = [
  { code: "MH", name: "Maharashtra", stampRate: 0.002 }, // 0.200%
  { code: "DL", name: "Delhi",       stampRate: 0.0015 },
  { code: "KA", name: "Karnataka",   stampRate: 0.002 },
  { code: "GJ", name: "Gujarat",     stampRate: 0.001 },
];

export default function CartFeesCalculator() {
  // Mock cart inputs
  const [orderValue] = useState<number>(350.92);
  const [state, setState] = useState<StateOpt>(STATES[0]);
  const [method, setMethod] = useState<Method>("Demat Transfer");

  // Fees policy
  const platformFee = Math.max(50, orderValue * 0.005); // 0.5% min ₹50
  const brokerage = orderValue * 0.002;                 // 0.2%
  const stampDuty = orderValue * state.stampRate;       // by state
  const dpCharges = method === "Demat Transfer" ? 25 : 0;
  const esign = 10;
  const govtCharges = stampDuty + (platformFee + brokerage) * 0.18; // GST @18% on fees
  const processing = dpCharges + esign;
  const totalFees = platformFee + brokerage + govtCharges + processing;
  const payable = orderValue + totalFees;

  const cur = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }),
    []
  );

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white rounded p-6 md:p-10">
        {/* Top controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <label className="block text-sm text-themeTeal">State (for Stamp Duty)</label>
            <div className="relative md:inline-flex items-center">
              <select
                value={state.code}
                onChange={(e) => setState(STATES.find(s => s.code === e.target.value) ?? STATES[0])}
                className="mt-1 appearance-none outline-none rounded border border-themeTealLighter bg-white px-3 py-2 pr-8 text-themeTeal focus:border-themeTeal transition duration-500 w-full"
              >
                {STATES.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({(s.stampRate * 100).toFixed(3)}%)
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-4 h-4 w-4 text-themeTealLighter" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-themeTeal">Delivery Method</label>
            <div className="relative md:inline-flex items-center">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as Method)}
                className="mt-1 appearance-none outline-none rounded border border-themeTealLighter bg-white px-3 py-2 pr-8 text-themeTeal focus:border-themeTeal transition duration-500 w-full"
              >
                <option>Demat Transfer</option>
                <option>Physical Delivery</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-4 h-4 w-4 text-themeTealLighter" />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 rounded border border-themeTealLighter bg-themeTealWhite">
          <div className="border-b border-themeTealLighter p-4 font-semibold text-themeTeal">
            Detailed Fee Breakdown
          </div>

          <div className="p-4 md:p-6">
            {/* Order value row */}
            <div className="flex items-center justify-between text-xl">
              <span className="font-semibold text-themeTeal">Order Value</span>
              <span className="font-semibold text-themeTeal">{cur.format(350.92)}</span>
            </div>

            <hr className="my-3 border-themeTealLighter" />

            {/* line items */}
            <Row label="Platform Fee (0.5%, min ₹50)" value={platformFee} />
            <Row label="Brokerage (0.2%)" value={brokerage} />

            <hr className="my-3 border-themeTealLighter" />

            <Row label="GST (18% on fees)" value={(platformFee + brokerage) * 0.18} />
            <Row
              label={
                <>
                  Stamp Duty ({(state.stampRate * 100).toFixed(3)}%){" "}
                  <span className="ml-2 rounded-full border border-themeTealLighter px-2 py-0.5 text-xs text-themeTealLighter">
                    {state.name}
                  </span>
                </>
              }
              value={stampDuty}
            />

            <hr className="my-3 border-themeTealLighter" />

            <Row label="DP Charges (Demat)" value={dpCharges} />
            <Row label="eSign Charges" value={esign} />

            {/* totals box */}
            <div className="mt-4 rounded bg-white p-4">
              <div className="flex items-center justify-between text-sm text-themeTealLighter">
                <span>Total Fees & taxes</span>
                <span>{cur.format(totalFees)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-semibold text-themeTeal">Total Payable</span>
                <span className="text-xl font-semibold text-themeTeal">{cur.format(payable)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-themeTealLighter">
                <span>Effective Price per share</span>
                <span>{cur.format(269.97)}</span>
              </div>
              <div className="mt-1 text-xs text-themeTealLighter"></div>
            </div>

            {/* chips */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Chip label="Platform Fees" value={platformFee} />
              <Chip label="Govt. Charges" value={govtCharges} accent="sky" />
              <Chip label="Processing" value={processing} accent="amber" />
              <Chip label="Total Fees" value={totalFees} accent="emerald" />
            </div>
          </div>
        </div>

        {/* notice */}
        <div className="bg-white border border-themeTealLighter rounded p-4 sm:p-6 mt-8">
            <div className="flex items-center gap-2 text-themeSkyBlue mb-3 sm:mb-4">
              <Info size={20}/> Important Notice
            </div>
            <p className="text-themeTealLighter text-sm">Unlisted shares are high-risk investments with limited liquidity. Prices are subject to market conditions and may vary significantly. Please review all the terms before proceeding.</p>
        </div>

        {/* CTA */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-end">
          <button className="cursor-pointer gap-2 rounded bg-themeSkyBlue px-6 py-3 font-medium text-themeTealWhite">
            Continue to Disclosures
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- helpers ---------------- */

function Row({ label, value }: { label: React.ReactNode; value: number }) {
  const cur = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }),
    []
  );
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-themeTealLighter">{label}</span>
      <span className="text-themeTeal">{cur.format(value)}</span>
    </div>
  );
}

function Chip({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: number;
  accent?: "slate" | "sky" | "amber" | "emerald";
}) {
  const cur = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }),
    []
  );
  const bg =
    accent === "sky"
      ? "bg-sky-100 text-sky-700"
      : accent === "amber"
      ? "bg-amber-100 text-amber-700"
      : accent === "emerald"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-200 text-slate-700";

  return (
    <div className={`rounded-lg p-4 text-center ${bg}`}>
      <div className="text-xl font-bold">{cur.format(value)}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}
