"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, AlertTriangle, FileText, Clock } from "lucide-react";

/* ---------- types ---------- */
type Method = "Demat Transfer" | "Physical Delivery";

type ReviewData = {
  company: string;
  dealType: string;
  quantity: number;
  pricePerShare: number;
  stateName: string;
  delivery: Method;
  /** ISO string to avoid hydration drift */
  acknowledgedIso: string;
  orderValue: number;        // before fees
  totalFees: number;
  totalPayable: number;
  effectivePerShare: number;
};

/* ---------- sample data (stable) ---------- */
const DEFAULT_DATA: ReviewData = {
  company: "Pine Labs",
  dealType: "Limit Order",
  quantity: 2,
  pricePerShare: 222,
  stateName: "Maharashtra",
  delivery: "Demat Transfer",
  acknowledgedIso: "2025-12-08T11:06:09.000Z",
  orderValue: 444.0,
  totalFees: 95.94,
  totalPayable: 539.94,
  effectivePerShare: 269.97,
};

/* ---------- page ---------- */
export default function OrderReviewPage({
  data = DEFAULT_DATA,
  onConfirm,
  onBack,
}: {
  data?: ReviewData;
  onConfirm?: () => void;
  onBack?: () => void;
}) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);

  const inr = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
    []
  );

  const ackStr = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date(data.acknowledgedIso)),
    [data.acknowledgedIso]
  );

  const goBack = () => (onBack ? onBack() : router.back());
  const confirm = () => (onConfirm ? onConfirm() : router.push("/disclosures-and-acknowledgements"));

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white rounded p-6 md:p-10">
        {/* Header */}
        <div className="flex gap-2 mb-6">
            <FileText className="h-6 w-6 text-themeTeal mt-1" />
            <div>
                <div className="font-semibold text-themeTeal text-xl">Order Review &amp; Confirmation</div>
                <p className="text-sm text-themeTealLighter">Please review all details carefully before confirming your order.</p>
            </div>
        </div>

        {/* Investment & Settlement */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Investment Details">
            <KV k="Company" v={data.company} />
            <KV k="Deal Type" v={<Pill>{data.dealType}</Pill>} />
            <KV k="Quantity" v={`${data.quantity} Shares`} />
            <KV k="Price per Share" v={inr.format(data.pricePerShare)} />
          </Card>

          <Card title="Settlement Details">
            <KV k="State" v={data.stateName} />
            <KV k="Delivery" v={<Pill>{data.delivery}</Pill>} />
            {/* suppressHydrationWarning for absolute safety, though value is stable */}
            <KV k="Acknowledged" v={<span suppressHydrationWarning>{ackStr}</span>} />
          </Card>
        </div>

        <div className="w-full h-[1px] bg-themeTealLighter mb-6"></div>

        {/* Financial Summary */}
        <div className="mt-6 rounded bg-themeTealWhite p-6">
          <div className="font-semibold text-themeTeal mb-4">
            Financial Summary
          </div>
          <div className="">
            <RowTwo
              label={
                <>
                  <span className="font-medium text-themeTeal">Order Value</span>
                  <span className="block text-xs text-themeTealLighter">Total Fees &amp; taxes</span>
                </>
              }
              value={
                <>
                  <span className="font-medium text-themeTeal">
                    {inr.format(data.orderValue)}
                  </span>
                  <span className="block text-xs text-themeTealLighter">
                    {inr.format(data.totalFees)}
                  </span>
                </>
              }
            />

            <div className="my-3 h-px bg-themeTealLighter" />

            <RowTwo
              label={
                <>
                  <span className="font-medium text-themeTeal">Total Payable</span>
                  <span className="block text-xs text-themeTealLighter">
                    Effective Price per Share
                  </span>
                </>
              }
              value={
                <>
                  <span className="text-xl font-semibold text-themeTeal">
                    {inr.format(data.totalPayable)}
                  </span>
                  <span className="block text-xs text-themeTealLighter">
                    {inr.format(data.effectivePerShare)}
                  </span>
                </>
              }
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 rounded bg-themeTealWhite p-6">
          <div className="flex items-center gap-2 text-themeTeal font-semibold">
            <Clock className="h-4 w-4" />
            Expected Timeline (T+X)
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stage color="slate" title="T+0 to T+2" sub="Order Matching" foot="1–2 business days" />
            <Stage color="blue" title="T+3 to T+7" sub="Documentation" foot="3–5 business days" />
            <Stage color="amber" title="T+8 to T+15" sub="eSign & Verification" foot="5–8 business days" />
            <Stage color="emerald" title="T+15 to T+30" sub="Share Transfer" foot="10–15 business days" />
          </div>
        </div>

        {/* Important notice */}
        <div className="mt-6 rounded-lg border border-themeTealLighter bg-white p-4">
          <div className="mb-1 flex items-center gap-2 text-themeSkyBlue">
            <Info className="h-4 w-4" />
            Important Notice
          </div>
          <p className="text-sm text-themeTealLighter">
            Actual times may vary depending on registrar processing, document completion, and regulatory
            approvals. You will receive updates via email/SMS.
          </p>
        </div>

        {/* Final confirmation box */}
        <div className={[
            "mt-6 rounded p-6",
            consent ? "bg-emerald-100" : "bg-rose-100",
        ].join(" ")}>
        <div className={[
            "mb-3 flex items-center gap-2 font-semibold",
            consent ? "text-emerald-700" : "text-rose-700",
            ].join(" ")}>
            <AlertTriangle className="h-6 w-6" />
            Final Confirmation Required
        </div>

        <p className={consent ? "mb-4 text-sm text-emerald-700" : "mb-4 text-sm text-rose-700"}>By confirming this order, you authorize the debit of <b>{inr.format(data.totalPayable)}</b> from your selected payment method. This action is irreversible once payment is processed.</p>

        <label
            className={[
            "block rounded border bg-themeTealWhite p-4",
            consent ? "border-emerald-600" : "border-rose-600",
            ].join(" ")}
        >
            <span className="flex items-start gap-3 select-none cursor-pointer">
            <input
                type="checkbox"
                className="peer h-6 w-6 accent-themeTeal"
                checked={consent}
                onChange={(ev) => setConsent(ev.target.checked)}
            />
            <span className="text-sm text-themeTeal">
                <div className={[ "text-md font-semibold mb-2", consent ? "text-emerald-700" : "text-rose-700", ].join(" ")}>I confirm and authorize this transaction</div>
                <p className="text-themeTealLight">I have reviewed all order details, understand the risks, timeline, and fees involved. I authorize the platform to process this order and debit the total amount from my selected payment method. I understand this creates a legally binding commitment.</p>
            </span>
            </span>
        </label>
        </div>


        {/* Actions */}
        <div className="mt-6 sm:mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="w-full sm:w-auto px-5 py-3 rounded border border-themeTealLighter text-themeTealLighter cursor-pointer hover:bg-themeTeal hover:text-themeTealWhite transition duration-500"
          >
            Back to Edit Order
          </button>
          <button
            type="button"
            disabled={!consent}
            onClick={confirm}
            className={[
              "w-full sm:w-auto px-6 py-3 rounded font-medium",
              consent ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer" : "bg-themeTealLighter text-themeTealWhite cursor-not-allowed",
            ].join(" ")}
          >
            Confirm &amp; Proceed to Payment
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- small components ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold text-themeTeal">
        {title}
      </div>
      <div className="py-4">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="mb-2 grid grid-cols-2 gap-2 text-md">
      <div className="text-themeTealLighter">{k}</div>
      <div className="text-right text-themeTeal">{v}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-themeTealLighter bg-themeTealWhite px-2 py-0.5 text-xs text-themeTeal">
      {children}
    </span>
  );
}

function RowTwo({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between">
      <div>{label}</div>
      <div className="text-right">{value}</div>
    </div>
  );
}

function Stage({
  color,
  title,
  sub,
  foot,
}: {
  color: "slate" | "blue" | "amber" | "emerald";
  title: string;
  sub: string;
  foot: string;
}) {
  const swatch =
    color === "slate"
      ? "bg-slate-200 text-slate-700"
      : color === "blue"
      ? "bg-themeSkyBlue/10 text-themeSkyBlue"
      : color === "amber"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";
  return (
    <div className={`rounded-lg p-4 text-center ${swatch}`}>
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm">{sub}</div>
      <div className="text-xs opacity-80">{foot}</div>
    </div>
  );
}
