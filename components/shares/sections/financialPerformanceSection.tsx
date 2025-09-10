"use client";

import { useState } from "react";

type FinRow = { label: string; values: (number | string)[] };

const YEARS = ["FY24", "FY23", "FY22", "FY21", "FY20", "FY19"];

const PNL_ROWS: FinRow[] = [
  { label: "Net Revenue", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
  { label: "Growth %", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
  { label: "Total Operating Expenses", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
  { label: "Operating Profit (EBITDA)", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
  { label: "Operating Profit Margin %", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
  { label: "Other Income", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
  { label: "Finance Costs", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
  { label: "Depreciation and Amortization Expense", values: [1158.42, 939.6, 502.3, 267.6, 781.3, 748.2] },
];

const BS_ROWS: FinRow[] = [
  { label: "Share Capital", values: [120.1, 118.6, 115.3, 110.4, 108.2, 100.1] },
  { label: "Reserves & Surplus", values: [890.2, 810.3, 760.1, 710.9, 650.4, 600.2] },
  { label: "Total Borrowings", values: [320.4, 300.2, 280.5, 260.1, 240.9, 210.3] },
  { label: "Fixed Assets", values: [420.6, 410.2, 395.0, 380.2, 360.4, 340.6] },
  { label: "Investments", values: [210.1, 190.3, 180.4, 170.2, 160.9, 150.2] },
  { label: "Cash & Cash Equivalents", values: [98.2, 92.5, 85.4, 80.1, 72.3, 60.7] },
  { label: "Total Assets", values: [1540.9, 1460.1, 1406.7, 1340.3, 1283.6, 1212.1] },
];

export default function FinancialPerformanceSection() {
  const [tab, setTab] = useState<"pnl" | "bs">("pnl");
  const rows = tab === "pnl" ? PNL_ROWS : BS_ROWS;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-themeTeal font-semibold text-lg">Key Financials</div>
        <div className="flex items-center justify-end gap-2">
          <TabBtn active={tab === "pnl"} onClick={() => setTab("pnl")}>
            Profit &amp; Loss
          </TabBtn>
          <TabBtn active={tab === "bs"} onClick={() => setTab("bs")}>
            Balance Sheet
          </TabBtn>
        </div>
      </div>

      <div className="overflow-x-auto rounded bg-white p-3">
        <table className="min-w-[720px] w-full text-themeTeal">
          <thead>
            <tr className="text-sm text-themeTealLight border-b border-themeTealLighter">
              <th className="text-left py-3 font-medium">(in Rs. Crore)</th>
              {YEARS.map((y) => (
                <th key={y} className="py-3 text-center text-themeTealLight font-medium">{y}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-themeTealLighter last:border-0">
                <th className="text-left font-semibold py-4">{r.label}</th>
                {r.values.map((v, i) => (
                  <td key={i} className="py-4 text-center text-themeTealLight">{formatNum(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* UI bits */
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded px-4 py-2 text-sm font-semibold cursor-pointer transition duration-500",
        active ? "bg-themeTeal text-white" : "bg-themeTealWhite text-themeTeal border border-themeTealLighter",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function formatNum(n: number | string) {
  if (typeof n === "string") return n;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
