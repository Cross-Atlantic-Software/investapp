"use client";

import { Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type TradeTabsProps = {
  company: string;            // e.g. "Pine Labs"
  priceINR: number;           // e.g. 350.92
  settlementDate: string;     // e.g. "Aug 21, 2025"
  minUnits?: number;          // e.g. 300
  lotSize?: number;           // e.g. 300
  onBuySubmit?: (p: { quantity: number; investINR: number }) => void;
  onSellSubmit?: (p: { quantity: number; sellingPriceINR: number; message?: string }) => void;
};

export default function TradeTabs({
  company,
  priceINR,
  settlementDate,
  minUnits = 0,
  lotSize = 0,
  onBuySubmit,
  onSellSubmit,
}: TradeTabsProps) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  // BUY state
  const [qty, setQty] = useState<number>(0);
  const [invest, setInvest] = useState<number>(0);
  const investFromQty = useMemo(() => round2(qty * priceINR), [qty, priceINR]);

  useEffect(() => {
    setInvest(investFromQty);
  }, [investFromQty]);

  // SELL state
  const [sellQty, setSellQty] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [sellMsg, setSellMsg] = useState("");

  return (
    <div className="rounded bg-themeTealWhite">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-themeTealLighter px-4 sm:px-5">
        <TabButton
          active={tab === "buy"}
          activeColor="emerald"
          onClick={() => setTab("buy")}
          label="Buy"
        />
        <TabButton
          active={tab === "sell"}
          activeColor="red"
          onClick={() => setTab("sell")}
          label="Sell"
        />
      </div>

      {/* BUY */}
      {tab === "buy" && (
        <form
          className="p-4 sm:p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onBuySubmit?.({ quantity: qty, investINR: investFromQty });
          }}
        >
          <HeaderRow company={company} priceINR={priceINR} />

          <MetaRow
            settlementDate={settlementDate}
            minUnits={minUnits}
            lotSize={lotSize}
            settlementInfo="Trades settle on T+7 working days. Dates may shift on market/bank holidays."
          />

          <div className="h-px bg-themeTealLighter" />

          <Field
            label="Quantity"
            input={
              <NumberInput
                value={qty}
                onChange={(v) => setQty(sanitizeInt(v))}
                placeholder="0"
              />
            }
          />

          <Field
            label="Invest"
            input={
              <CurrencyInput
                value={invest}
                readOnly
                prefix="₹"
                ariaLabel="Invest amount"
              />
            }
            hint="Auto-calculated from quantity × price"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-emerald-700 px-4 py-3 text-white font-semibold cursor-pointer hover:bg-emerald-800 transition duration-500"
          >
            Invest Now
          </button>
        </form>
      )}

      {/* SELL */}
      {tab === "sell" && (
        <form
          className="p-4 sm:p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSellSubmit?.({
              quantity: sellQty,
              sellingPriceINR: sellPrice,
              message: sellMsg.trim() || undefined,
            });
          }}
        >
          <SellHeaderRow company={company} />

          <Field
            label="Quantity*"
            input={
              <NumberInput
                value={sellQty}
                onChange={(v) => setSellQty(sanitizeInt(v))}
                placeholder="0"
                required
              />
            }
          />

          <Field
            label="Selling Price*"
            input={
              <CurrencyInput
                value={sellPrice}
                onChange={(v) => setSellPrice(sanitizeFloat(v))}
                prefix="₹"
                placeholder="0"
                required
              />
            }
          />

          <Field
            label="Message*"
            input={
              <textarea
                required
                value={sellMsg}
                onChange={(e) => setSellMsg(e.target.value)}
                className="w-full min-h-28 rounded border border-themeTealLighter bg-white px-3 py-2 outline-none"
                placeholder="Add any details for the buyer"
              />
            }
          />

          <button
            type="submit"
            className="w-full rounded-md bg-red-600 px-4 py-3 text-white font-semibold cursor-pointer hover:bg-red-700 transition duration-500"
          >
            Sell
          </button>
        </form>
      )}
    </div>
  );
}

/* ---------- subcomponents ---------- */

function TabButton({
  label,
  active,
  activeColor,
  onClick,
}: {
  label: string;
  active: boolean;
  activeColor: "emerald" | "red";
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "relative px-2 py-3 text-lg font-semibold cursor-pointer",
        active
        ? activeColor === "emerald" ? "text-emerald-600" : "text-red-600"
        : activeColor === "emerald" ? "text-themeTeal" : "text-themeTeal",
      ].join(" ")}
    >
      {label}
      {active && (
        <span
          className={`absolute inset-x-0 -bottom-[1px] h-0.5 ${
            activeColor === "emerald" ? "bg-emerald-600" : "bg-red-600"
          }`}
        />
      )}
    </button>
  );
}

function HeaderRow({ company, priceINR }: { company: string; priceINR: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-xl font-semibold text-themeTeal">{company}</h3>
      <div className="text-xl font-semibold text-themeTeal">₹ {formatINR(priceINR)}</div>
    </div>
  );
}
function SellHeaderRow({ company }: { company: string }) {
  return <h3 className="text-xl font-semibold text-themeTeal">Sell {company}</h3>;
}

/* === UPDATED: MetaRow with Info popover === */

function MetaRow({
  settlementDate,
  minUnits,
  lotSize,
  settlementInfo = "Trades settle on T+7 working days. Dates may shift on market/bank holidays.",
}: {
  settlementDate: string;
  minUnits: number;
  lotSize: number;
  settlementInfo?: string;
}) {
  return (
    <dl className="space-y-3 text-sm">
      <RowWithInfo label="Settlement Period" value={settlementDate} info={settlementInfo} />
      <RowWithInfo label="Min. Units" value={String(minUnits)} />
      <RowWithInfo label="Lot Size" value={String(lotSize)} />
    </dl>
  );
}

function RowWithInfo({
  label,
  value,
  info,
}: {
  label: string;
  value: string;
  info?: string;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative flex items-center justify-between">
      <dt className="flex items-center gap-2 text-themeTealLight">
        {label}
        {info && (
          <button
            type="button"
            aria-label={`Info about ${label}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-0.5 text-sky-600 hover:bg-sky-50 cursor-pointer"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
      </dt>

      <dd className="font-medium text-sm text-themeTealLight">{value}</dd>

      {open && info && (
        <div
          role="dialog"
          className="absolute left-0 top-full z-20 mt-2 w-72 rounded-md border border-themeTealLighter bg-white p-3 text-sm text-themeTeal shadow-lg"
        >
          {info}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  input,
  hint,
}: {
  label: string;
  input: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-themeTealLight text-base">{label}</div>
      {input}
      {hint ? <div className="mt-1 text-xs text-themeTealLight">{hint}</div> : null}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: number;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-md border border-themeTealLighter bg-white px-3 py-2 outline-none"
    />
  );
}

function CurrencyInput({
  value,
  onChange,
  prefix = "₹",
  placeholder,
  readOnly,
  ariaLabel,
  required,
}: {
  value: number;
  onChange?: (v: string) => void;
  prefix?: string;
  placeholder?: string;
  readOnly?: boolean;
  ariaLabel?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-themeTealLighter bg-white px-3 py-2">
      <span className="text-themeTealLight">{prefix}</span>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.]?[0-9]*"
        aria-label={ariaLabel}
        value={value || ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className="w-full outline-none bg-transparent"
      />
    </div>
  );
}

/* ---------- utils ---------- */
function sanitizeInt(v: string) {
  const n = parseInt(v.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}
function sanitizeFloat(v: string) {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
