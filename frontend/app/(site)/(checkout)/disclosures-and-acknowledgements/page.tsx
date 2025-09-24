"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, ShieldAlert, Clock3, Check,
} from "lucide-react";

type Disclosure = {
  id: string;
  title: string;
  body: string;
  mandatory?: boolean;
};

const DISCLOSURES: Disclosure[] = [
  {
    id: "risk",
    title: "Invest APP Risk",
    body:
      "I understand that Invest APP are high-risk investments with limited liquidity, no regulatory oversight for pricing, and potential for significant capital loss. These securities are not traded on recognized exchanges and may be difficult to sell.",
    mandatory: true,
  },
  {
    id: "price",
    title: "Price Discovery Limitations",
    body:
      "I acknowledge that pricing for Invest APP is based on limited market data, private transactions, and may not reflect true market value. Price discovery is subjective and may vary significantly between transactions.",
    mandatory: true,
  },
  {
    id: "settlement",
    title: "Off-Market Settlement (DIS/eDIS)",
    body:
      "I understand that settlement will occur off-market through Delivery Instruction Slip (DIS) or electronic DIS (eDIS). This involves manual processing and may take longer than exchange-traded securities.",
    mandatory: true,
  },
  {
    id: "tat",
    title: "Transfer Timeline (TAT)",
    body:
      "I acknowledge that share transfer may take 15–30 business days from payment confirmation, subject to company registrar processing, documentation verification, and regulatory compliance. Delays may occur due to incomplete documentation.",
    mandatory: true,
  },
  {
    id: "refund",
    title: "Refund & Expiry Policy",
    body:
      "I understand that if shares are not allocated within 45 days, full refund will be processed within 7 business days. Orders expire after 60 days if unmatched. Partial allocations may result in proportional refunds.",
    mandatory: true,
  },
  {
    id: "kyc",
    title: "KYC & Compliance",
    body:
      "I confirm that my KYC documents are updated and I comply with all regulatory requirements for Invest APP trading. I understand that non-compliance may result in order cancellation.",
    mandatory: true,
  },
];

export default function DisclosuresPage({
  onProceed,
}: { onProceed?: () => void }) {
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  const [finalConsent, setFinalConsent] = useState(false);

  const requiredCount = useMemo(
    () => DISCLOSURES.filter((d) => d.mandatory).length,
    []
  );
  const acknowledgedCount = DISCLOSURES.reduce(
    (n, d) => n + (acks[d.id] ? 1 : 0),
    0
  );
  const allRequiredChecked =
    DISCLOSURES.every((d) => !d.mandatory || !!acks[d.id]) && finalConsent;

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">

        {/* Banners */}
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-6 w-6" />
            Mandatory Disclosures & Acknowledgements
          </div>
          <p className="mt-1 text-sm">
            Please read and acknowledge all disclosures before proceeding with your order.
          </p>
        </div>
        <div className="mb-6 rounded border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-6 w-6" />
            High Risk Investment
          </div>
          <p className="mt-1 text-sm">
            Invest APP carry significant investment risks.
          </p>
        </div>

        {/* Disclosures list */}
        <div className="space-y-6">
          {DISCLOSURES.map((d) => {
            const checked = !!acks[d.id];
            return (
              <div
                key={d.id}
                className="rounded border border-themeTealLighter bg-themeTealWhite"
              >
                <div className="flex items-start gap-3 p-6">
                    <AlertTriangle className="h-6 w-6 text-rose-800" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-themeTeal">{d.title}</h3>
                      {d.mandatory && (
                        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-themeTealLighter">{d.body}</p>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 border-t border-themeTealLighter px-6 py-4 select-none">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={(e) =>
                      setAcks((s) => ({ ...s, [d.id]: e.target.checked }))
                    }
                  />
                  <span
                    aria-hidden
                    className="grid h-5 w-5 place-items-center rounded border bg-white border-themeTealLighter transition
                               peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:[&_svg]:opacity-100"
                  >
                    <Check className="h-3.5 w-3.5 text-white opacity-0 transition-opacity" />
                  </span>
                  <span className="text-sm text-themeTeal">
                    I have <b>read and acknowledge</b> the above disclosure
                  </span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="mt-6 rounded bg-themeSkyBlue">
          <div className="flex items-center justify-center lg:justify-start pt-4 pl-4 gap-2 text-themeTealWhite font-semibold">
            <Clock3 className="h-6 w-6" />
            Expected Timeline
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <TimelineCell title="T-0 to T+2" desc="Order Matching" />
            <TimelineCell title="T+3 to T+15" desc="Documentation & Verification" />
            <TimelineCell title="T+15 to T+30" desc="Share Transfer Completion" />
          </div>
        </div>

        {/* Final consent */}
        <div className="mt-6 rounded border border-themeTealLighter bg-themeTealWhite p-6">
          <label className="flex items-start gap-3 select-none cursor-pointer">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={finalConsent}
              onChange={(e) => setFinalConsent(e.target.checked)}
            />
            <span aria-hidden className="mt-1 grid h-5 w-5 place-items-center rounded border bg-white border-themeTealLighter transition peer-checked:border-themeTeal peer-checked:bg-themeTeal peer-checked:[&_svg]:opacity-100">
              <Check className="h-4 w-4 shrink-0 text-white opacity-0 transition-opacity" />
            </span>
            <span className="text-sm text-themeTeal">
              <div className="font-semibold text-lg mb-2">Final Consent & Authorization</div>
              <p className="text-themeTealLight mb-2">By proceeding, I confirm that I have read, understood, and agree to all the above disclosures, terms and conditions. I authorize the platform to process my order and execute the transaction on my behalf. I understand this is a legally binding agreement.</p>
              <span className="mt-1 block text-sm text-themeTealLighter">
                Timestamp will be recorded upon confirmation for regulatory compliance.
              </span>
            </span>
          </label>
        </div>

        {/* Footer actions */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-themeTealLighter">
            Acknowledged: {acknowledgedCount} of {requiredCount}
          </span>
          <span className="text-amber-600">Pending Acknowledgements</span>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="w-full sm:w-auto px-5 py-3 rounded border border-themeTealLighter text-themeTealLighter cursor-pointer hover:bg-themeTeal hover:text-themeTealWhite transition duration-500"
          >
            Download Disclosures (PDF)
          </button>

          <button
            type="button"
            disabled={!allRequiredChecked}
            onClick={() => onProceed?.()}
            className={[
              "w-full sm:w-auto px-6 py-3 rounded font-medium",
              allRequiredChecked
                ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer"
                : "bg-themeTealLighter text-themeTealWhite cursor-not-allowed",
            ].join(" ")}
          >
            I Acknowledge & Proceed
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */

function TimelineCell({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="grid place-items-center gap-1 text-center p-6">
      <div className="text-xl font-bold text-themeTealWhite">{title}</div>
      <div className="text-sm text-themeTealWhite">{desc}</div>
    </div>
  );
}
