"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Row = {
  id: string;
  company: string;
  sector: string;
  shares: number;
  price: string;
  value: string;
  change: string; // e.g. "▲ 12.5%" or "▼ 12.5%"
  risk: "Low" | "Medium" | "High";
  action: "Buy" | "Sell";
};

type Props = {
  rows: Row[];
  pageSize?: number; // default 8
};

export default function PortfolioTable({ rows, pageSize = 8 }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  const pagesToShow = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const add = (p: number) => pages.push(p);
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++)
      add(p);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  const go = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

  return (
    <div className="overflow-hidden">
      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full text-md">
          <thead className="border-b border-themeTeal text-left font-semibold text-themeTeal">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Shares</th>
              <th className="px-4 py-3">Price per share</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3 text-center">Risk Level</th>
              <th className="px-4 py-3 text-center">Transact</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => {
              const isUp = r.change.trim().startsWith("▲");
              const clean = r.change.replace(/[▲▼]\s*/g, ""); // "12.5%"
              const rowKey = `${r.id}-${start + i}`;
              return (
                <tr key={rowKey} className="border-b border-themeTealLighter text-themeTeal">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-themeTeal">{r.company}</div>
                    <div className="text-sm text-themeTealLighter">{r.sector}</div>
                  </td>
                  <td className="px-4 py-3">{r.shares}</td>
                  <td className="px-4 py-3">{r.price}</td>
                  <td className="px-4 py-3">{r.value}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        isUp ? "text-green-600" : "text-rose-600"
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="h-4 w-4" aria-hidden />
                      ) : (
                        <TrendingDown className="h-4 w-4" aria-hidden />
                      )}
                      {clean}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        r.risk === "Low" && "bg-green-100 text-green-700",
                        r.risk === "Medium" && "bg-yellow-100 text-yellow-700",
                        r.risk === "High" && "bg-rose-100 text-rose-700",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {r.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className={[
                        "rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition duration-300",
                        r.action === "Buy"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-rose-600 text-white hover:bg-rose-700",
                      ].join(" ")}
                    >
                      {r.action}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {pagesToShow.length>6 && (
        <nav className="flex items-center justify-center gap-2  p-4">
          <button
            onClick={() => go(page - 1)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite disabled:opacity-40 transition duration-500 cursor-pointer"
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          {pagesToShow.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-themeTealLighter">
                …
              </span>
            ) : (
              <button
                key={`p-${p}`}
                onClick={() => go(p as number)}
                className={`min-w-[32px] rounded px-2 py-1 text-sm cursor-pointer transition duration-500 ${
                  p === page
                    ? "bg-themeSkyBlue text-themeTealWhite"
                    : "text-themeTeal hover:bg-themeSkyBlue hover:text-themeTealWhite"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => go(page + 1)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite disabled:opacity-40 transition duration-500 cursor-pointer"
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
