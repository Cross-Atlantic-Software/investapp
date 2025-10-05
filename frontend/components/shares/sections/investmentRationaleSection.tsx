"use client";

import { useState, useEffect } from "react";
import {
  TriangleAlert,
  AlertTriangle,
  Plus,
  Minus,
  TrendingUp,
} from "lucide-react";

interface InvestmentRationaleData {
  id: number;
  type: 'pros' | 'risks';
  title: string;
  description: string;
  order_index: number;
}

interface InvestmentRationaleSectionProps {
  stockId?: number;
}

export default function InvestmentRationaleSection({ stockId }: InvestmentRationaleSectionProps) {
  const [rationales, setRationales] = useState<{ pros: InvestmentRationaleData[]; risks: InvestmentRationaleData[] }>({
    pros: [],
    risks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRationales = async () => {
      if (!stockId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/${stockId}/investment-rationales`);
        const data = await response.json();
        
        if (data.success) {
          setRationales(data.data.rationales || { pros: [], risks: [] });
        } else {
          setError(data.message || 'Failed to fetch investment rationales');
        }
      } catch (err) {
        setError('Failed to fetch investment rationales');
        console.error('Error fetching investment rationales:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRationales();
  }, [stockId]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-4 animate-pulse">
              <div className="h-14 w-14 bg-gray-300 rounded-md"></div>
              <div className="h-6 w-32 bg-gray-300 rounded"></div>
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="border border-gray-200 rounded bg-white p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  </div>
                  <div className="w-5 h-5 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (rationales.pros.length === 0 && rationales.risks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No investment rationale data available for this stock.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* PROS */}
      {rationales.pros.length > 0 && (
        <section className="space-y-4">
          <GroupHeader
            icon={<TrendingUp className="h-6 w-6 text-emerald-700" />}
            label="Investment Rationale"
            tone="good"
          />
          {rationales.pros.map((rationale, i) => (
            <AccordionRow
              key={rationale.id}
              icon={<TriangleAlert className="h-4 w-4 text-emerald-700" />}
              title={rationale.title}
              body={rationale.description}
              defaultOpen={i === 0}
            />
          ))}
        </section>
      )}

      {/* RISKS */}
      {rationales.risks.length > 0 && (
        <section className="space-y-4">
          <GroupHeader
            icon={<TriangleAlert className="h-6 w-6 text-rose-600" />}
            label="Key Risks"
            tone="risk"
          />
          {rationales.risks.map((rationale, i) => (
            <AccordionRow
              key={rationale.id}
              icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}
              title={rationale.title}
              body={rationale.description}
              defaultOpen={i === 0}
            />
          ))}
        </section>
      )}
    </div>
  );
}

/* ---------- UI bits ---------- */

function GroupHeader({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "good" | "risk";
}) {
  const box =
    tone === "good"
      ? "bg-emerald-100/80"
      : "bg-rose-100/80";
  const text =
    tone === "good" ? "text-emerald-700" : "text-rose-600";

  return (
    <div className="flex items-center gap-4">
      <div className={`h-10 w-10 rounded-md grid place-items-center ${box}`}>
        {icon}
      </div>
      <h4 className={`text-sm font-semibold ${text}`}>{label}</h4>
    </div>
  );
}

function AccordionRow({
  icon,
  title,
  body,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded border border-themeTealLighter bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-semibold text-themeTeal">{title}</span>
        </div>
        {open ? (
          <Minus className="h-5 w-5 text-themeTeal cursor-pointer" />
        ) : (
          <Plus className="h-5 w-5 text-themeTeal cursor-pointer" />
        )}
      </button>

      <div
        className={[
          "overflow-hidden transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <p className="px-5 pb-4 text-sm text-themeTealLight leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
