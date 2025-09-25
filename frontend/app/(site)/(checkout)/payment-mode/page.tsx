"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Landmark,
  CreditCard,
  Wallet,
  Globe,
  Shield,
} from "lucide-react";

/* ------------ types ------------ */
type MethodKey = "upi" | "netbanking" | "card" | "wallet";

type Method = {
  key: MethodKey;
  name: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  speed: string; // rhs top
  feeNote: string; // rhs bottom
  surcharge: number; // added to payable
};

/* ------------ data ------------ */
const ORDER_ID = "UHUHIUJJONMLK45875";
const ORDER_VALUE = 444.0; // base (without fees)
const BASE_PAYABLE = 539.94; // from previous step (includes fees & taxes except method surcharge)

const METHODS: Method[] = [
  {
    key: "upi",
    name: "UPI",
    desc: "Pay using UPI ID or scan QR code",
    icon: Globe,
    speed: "Instant",
    feeNote: "No Fees",
    surcharge: 0,
  },
  {
    key: "netbanking",
    name: "Net Banking",
    desc: "Pay directly from your bank account",
    icon: Landmark,
    speed: "2–5 minutes",
    feeNote: "No Fees",
    surcharge: 0,
  },
  {
    key: "card",
    name: "Credit/Debit Card",
    desc: "Visa, Mastercard, RuPay accepted",
    icon: CreditCard,
    speed: "Instant",
    feeNote: "+₹10.80",
    surcharge: 10.8,
  },
  {
    key: "wallet",
    name: "Digital Wallet",
    desc: "PayTM, PhonePe, Amazon Pay",
    icon: Wallet,
    speed: "Instant",
    feeNote: "No Fees",
    surcharge: 0,
  },
];

/* ------------ page ------------ */
export default function PaymentModePage() {
  const [selected, setSelected] = useState<MethodKey>("upi");
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
    []
  );

  const method = METHODS.find((m) => m.key === selected)!;
  const finalPayable = BASE_PAYABLE + method.surcharge;

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white rounded p-6 md:p-10">
        {/* Header */}
        <div className="flex justify-between mb-6 items-center">
            <div>
                <div className="mb-1 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-themeSkyBlue" />
                    <span className="font-semibold text-themeTeal">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <p className="text-sm text-themeTealLighter">256-bit SSL encrypted payment gateway</p>
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between">
                <Link
                    href="/order-review-and-confirmation"
                    className="inline-flex text-sm font-semibold items-center gap-1 text-themeTeal hover:text-themeSkyBlue transition duration-500"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Review
                </Link>
                </div>
            </div>
        </div>

        {/* Order summary ribbon */}
        <div className="mb-6 rounded border border-themeTealLighter bg-themeTealWhite">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm text-themeTeal mb-1"><span className="font-medium">Order ID:</span> {ORDER_ID}</div>
              <div className="text-xs text-themeTealLighter">Invest APP Share Purchase</div>
            </div>
            <div className="text-emerald-700 font-semibold text-lg">
              {fmt.format(ORDER_VALUE)}
            </div>
          </div>
        </div>

        {/* Methods */}
        <div className="rounded border border-themeTealLighter bg-themeTealWhite p-4">
          <div className="text-themeTeal font-medium mb-4">
            Select Payment method
          </div>
          <div className="space-y-3">
            {METHODS.map((m) => (
              <label
                key={m.key}
                className={[
                  "flex cursor-pointer items-center justify-between rounded border p-4 transition",
                  "border-themeTealLighter hover:border-themeTeal bg-white",
                  selected === m.key ? "border-themeTeal" : " ",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment-method"
                    className="sr-only peer"
                    checked={selected === m.key}
                    onChange={() => setSelected(m.key)}
                  />
                  <span
                    className={[
                      "grid h-4 w-4 place-items-center rounded-full ring-1",
                      selected === m.key
                        ? "ring-themeTeal bg-themeTeal"
                        : "ring-themeTealLighter bg-white",
                    ].join(" ")}
                    aria-hidden
                  />
                  <span className="grid gap-0.5">
                    <span className="flex items-center gap-2 text-themeTeal font-medium">
                      <m.icon className="h-4 w-4 text-themeTealLighter" />
                      {m.name}
                    </span>
                    <span className="text-xs text-themeTealLighter">{m.desc}</span>
                  </span>
                </span>

                <span className="text-right">
                  <div className="text-xs text-themeTeal">{m.speed}</div>
                  <div
                    className={[
                      "text-xs",
                      m.surcharge > 0 ? "text-rose-600" : "text-emerald-600",
                    ].join(" ")}
                  >
                    {m.feeNote}
                  </div>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 rounded border border-themeTealLighter bg-themeTealWhite p-4">
          <div className="mb-1 flex items-center gap-2 text-emerald-700 font-medium">
            <ShieldCheck className="h-4 w-4" />
            Secure Payment Gateway
          </div>
          <p className="text-sm text-themeTealLighter">
            Your payment is protected by bank-grade security. We never store your payment details. All
            transactions are processed through PCI DSS compliant payment gateways.
          </p>
        </div>
      </div>

      {/* Sticky pay bar */}
      <div className="sticky bottom-0 mt-6 z-10 bg-themeTealWhite backdrop-blur">
        <div className="appContainer py-3 flex justify-center">
          <button
            className="cursor-pointer rounded bg-themeSkyBlue px-6 py-3 font-medium justify-center text-white flex gap-3 items-center"
            onClick={() => alert(`Paying ${fmt.format(finalPayable)} via ${method.name}`)}
          >
            <Lock className="h-6 w-6 text-themeTealWhite" /> Pay {fmt.format(finalPayable)}
          </button>
        </div>
      </div>
    </section>
  );
}
