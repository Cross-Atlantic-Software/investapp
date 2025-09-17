// components/dashboard/RecentTransactions.tsx
import { ArrowDownLeft, ArrowUpLeft } from "lucide-react";

export type RecentTxn = {
  id: string;
  company: string;
  side: "buy" | "sell";
  shares: number;
  date: string;                 // already formatted (e.g., "Aug 13, 2025")
  pricePerShareINR: number;     // e.g., 450
  feesINR: number;              // e.g., 20
  amountINR: number | string;   // e.g., 2850000 or "₹28.5L"
  status?: "Completed" | "Pending" | "Failed";
  txnId: string;
};

export default function RecentTransactions({
  items = [],
  className = "",
}: {
  heading?: string;
  items: RecentTxn[];
  className?: string;
}) {
  return (
    <section className={["", className].join(" ")}>

      <ul>
        {items.map((t) => (
          <li key={t.id}>
            <article className="flex items-start justify-between gap-4 rounded bg-white p-4 rounded mb-4">
              {/* LEFT: icon + title + subtitle + meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className={[
                      "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full",
                      t.side === "buy" ? "bg-emerald-50" : "bg-rose-50",
                    ].join(" ")}
                  >
                    {t.side === "buy" ? (
                      <ArrowUpLeft className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-rose-600" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="truncate text-themeTeal text-lg font-semibold">{t.company}</div>
                    <div className="text-sm text-themeTealLight">
                      {t.side === "buy" ? "Purchase" : "Sale"} of {t.shares} shares
                    </div>
                  </div>
                </div>

                {/* meta */}
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-themeTealLight sm:grid-cols-3">
                  <Meta label="Date" value={t.date} />
                  <Meta label="Price/Share" value={`₹${formatINR(t.pricePerShareINR)}`} />
                  <Meta label="Fees" value={`₹${formatINR(t.feesINR)}`} />
                </div>
              </div>

              {/* RIGHT: amount + status + id */}
              <div className="shrink-0 text-right">
                <div className="text-themeTeal font-semibold">
                  {typeof t.amountINR === "number" ? `₹${formatINR(t.amountINR)}` : t.amountINR}
                </div>

                {t.status && (
                  <span
                    className={[
                      "mt-2 inline-flex rounded px-2 py-1 text-xs font-semibold text-themeTealWhite",
                      t.status === "Completed" && "bg-emerald-700",
                      t.status === "Pending" && "bg-amber-500",
                      t.status === "Failed" && "bg-rose-700",
                    ].join(" ")}
                  >
                    {t.status}
                  </span>
                )}

                <div className="mt-2 text-xs text-themeTealLighter">
                  Transaction ID: {t.txnId}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-themeTealLighter sm:block">{label}:</span> <span className="sm:block">{value}</span>
    </div>
  );
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
