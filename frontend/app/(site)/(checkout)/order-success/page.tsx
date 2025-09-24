// app/(site)/(checkout)/order-success/page.tsx
"use client";

import { Suspense } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Page() {
  return (
    <Suspense fallback={<div className="appContainer py-16 text-themeTealLighter">Loading…</div>}>
      <OrderSuccessInner />
    </Suspense>
  );
}

function OrderSuccessInner() {
  const qp = useSearchParams(); // safe inside Suspense
  const orderId   = qp.get("orderId")   ?? "ORD123";
  const paymentId = qp.get("paymentId") ?? "PAY987";
  const amount    = qp.get("amount")    ?? "₹539.94";
  const method    = qp.get("method")    ?? "UPI";

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer">
        <div className="mx-auto max-w-4xl rounded bg-white p-6 sm:p-10">
          <h1 className="text-center text-2xl font-semibold text-themeTeal">Invest APP Order Placement</h1>
          <p className="mt-1 text-center text-themeTealLighter">
            Place your order for Invest APP with transparent pricing and instant calculations
          </p>

          <div className="mt-8 rounded bg-emerald-50 p-6 sm:p-10">
            <div className="flex flex-col items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-600">
                <Check className="h-12 w-12 text-white" />
              </span>
              <p className="mt-4 text-lg font-semibold text-emerald-700">Payment Successful!</p>
            </div>

            <div className="mt-6 rounded border border-emerald-700 bg-white">
              <div className="grid grid-cols-1 gap-y-4 p-5">
                <KV k="Order ID" v={orderId} />
                <KV k="Payment ID" v={paymentId} />
                <KV k="Amount Paid" v={amount} />
                <KV k="Payment Method" v={method} />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-emerald-700">Your payment has been processed successfully. Order is now active in Deal Room.</p>
              <p className="text-sm text-emerald-700">You will receive email confirmation and regular updates on order status.</p>
            </div>

            <div className="mt-6">
              <Link
                href="/orders/status"
                className="block w-full rounded bg-emerald-700 px-6 py-3 text-center font-medium text-white transition hover:bg-emerald-800"
              >
                View Order Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-2 items-start gap-2 text-sm">
      <div className="text-themeTeal">{k}</div>
      <div className="text-right text-themeTeal">{v}</div>
    </div>
  );
}
