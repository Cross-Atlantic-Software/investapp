// components/dashboard/AuditTrailTable.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Download,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type AuditRow = {
  id: string;
  date: string;
  time?: string;
  description: string;
  account: string;
  debit?: number;
  credit?: number;
  balance?: number;
  status: "Completed" | "Failed" | "Processing";
};

export default function AuditTrailTable({
  rows = SAMPLE_ROWS,
  heading = "Audit Trail",
  pageSize = 5,
}: {
  rows?: AuditRow[];
  heading?: string;
  pageSize?: number;
}) {
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("Month");
  const [year, setYear] = useState("Year");
  const [page, setPage] = useState(1);

  // filter
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.description.toLowerCase().includes(s) ||
        r.account.toLowerCase().includes(s) ||
        r.date.toLowerCase().includes(s)
    );
  }, [q, rows]);

  // paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const pagesToShow = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let p = Math.max(2, page - 1);
      p <= Math.min(totalPages - 1, page + 1);
      p++
    )
      pages.push(p);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  const go = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

  return (
    <section className="rounded bg-white p-3 sm:p-4">
      {/* header */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-themeTeal">{heading}</h3>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {/* search */}
          <label className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-themeTealLighter" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1); // reset page on search
              }}
              placeholder="Search here..."
              className="w-full rounded border border-themeTealLighter pl-8 pr-3 py-2 text-sm outline-none"
            />
          </label>

          {/* downloads */}
          <div className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4 text-themeTeal/80" />
            <span className="text-themeTealLighter">Download</span>
            <a className="text-themeTeal hover:underline" href="#">PDF</a>
            <span className="text-themeTealLighter">or</span>
            <a className="text-themeTeal hover:underline" href="#">ELSX</a>
            <span className="text-themeTealLighter">|</span>
            <a className="text-themeTeal hover:underline" href="#">CSV</a>
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="mb-3 flex flex-row gap-2 items-center justify-between">
        <p className="text-themeTeal font-semibold">Transactions</p>
        <div className="flex items-center gap-2">
          <Select
            value={month}
            onChange={(v) => {
              setMonth(v);
              setPage(1); // reset page on filter
            }}
            options={["Month", "Jan", "Feb", "Mar", "Apr"]}
          />
          <Select
            value={year}
            onChange={(v) => {
              setYear(v);
              setPage(1); // reset page on filter
            }}
            options={["Year", "2025", "2024", "2023"]}
          />
        </div>
      </div>

      {/* table */}
      <div className="-mx-2 overflow-x-auto sm:mx-0">
        <table className="min-w-[880px] w-full text-left">
          <thead>
            <tr className="border-b text-themeTealLight">
              <Th>Date/Time</Th>
              <Th>Description</Th>
              <Th>Account</Th>
              <Th className="text-right">Debit</Th>
              <Th className="text-right">Credit</Th>
              <Th className="text-right">Balance</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <Td>
                  <div>{r.date}</div>
                  {r.time && (
                    <div className="text-xs text-themeTealLighter">{r.time}</div>
                  )}
                </Td>
                <Td className="text-themeTeal">{r.description}</Td>
                <Td>{r.account}</Td>
                <Td className="text-right">
                  {r.debit ? `₹${fmt(r.debit)}` : "-"}
                </Td>
                <Td className="text-right">
                  {r.credit ? `₹${fmt(r.credit)}` : "-"}
                </Td>
                <Td className="text-right">
                  {r.balance ? `₹${fmt(r.balance)}` : "-"}
                </Td>
                <Td>
                  <StatusPill status={r.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <nav className="flex items-center justify-center gap-2 p-4">
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
    </section>
  );
}

/* helpers */
function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th className={["px-3 py-3 text-sm font-medium", className].join(" ")}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td className={["px-3 py-4 text-sm text-themeTeal", className].join(" ")}>
      {children}
    </td>
  );
}
function StatusPill({ status }: { status: AuditRow["status"] }) {
  const map = {
    Completed: "bg-emerald-700 text-themeTealWhite",
    Failed: "bg-rose-700 text-themeTealWhite",
    Processing: "bg-amber-500 text-themeTealWhite",
  } as const;
  return (
    <span
      className={[
        "inline-flex items-center rounded px-2 py-1 text-xs font-semibold",
        map[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}
function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded border border-themeTealLighter bg-white px-3 py-2 pr-8 text-sm text-themeTeal outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLighter" />
    </div>
  );
}
function fmt(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

/* sample rows */
const SAMPLE_ROWS: AuditRow[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `row-${i + 1}`,
  date: "Aug 12, 2025",
  time: "14:30:00",
  description: "Purchase of 100 Shares - Pine Labs",
  account: "Investment Securities",
  debit: 275000,
  credit: 0,
  balance: 275000,
  status: (["Completed", "Failed", "Processing"] as const)[i % 3],
}));
