"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText, CreditCard, MapPin, Landmark, UserRoundCheck, Video, PenLine,
} from "lucide-react";

type Props = { onContinue?: () => void; onBack?: () => void };
type Demat = { type: "" | "CDSL" | "NSDL"; id: string };

export default function KYCStep5Demat({ onContinue, onBack }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // steps
  const steps = useMemo(
    () => [
      { label: "Documents", icon: FileText, href: "/kyc-process/step-1" },
      { label: "PAN Validation", icon: CreditCard, href: "/kyc-process/step-2" },
      { label: "Address Verification", icon: MapPin, href: "/kyc-process/step-3" },
      { label: "Bank Proof", icon: Landmark, href: "/kyc-process/step-4" },
      { label: "Demat Account", icon: UserRoundCheck, href: "/kyc-process/step-5" },
      { label: "Video KYC", icon: Video, href: "/kyc-process/step-6" },
      { label: "eSign & Consent", icon: PenLine, href: "/kyc-process/step-7" },
    ],
    []
  );
  const current = 4; // 0-based -> Step 5

  // form state
  const [rows, setRows] = useState<Demat[]>([{ type: "", id: "" }]);
  const MAX_ROWS = 5;

  const idOk = (v: string) => /^[A-Za-z0-9]{8,16}$/.test(v.trim());
  const rowValid = (r: Demat) => !!r.type && idOk(r.id);
  const allValid = rows.length > 0 && rows.every(rowValid);

  const addRow = () => setRows((r) => (r.length >= MAX_ROWS ? r : [...r, { type: "", id: "" }]));
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const update = (i: number, k: keyof Demat, v: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const backHandler =
    onBack ??
    (() => {
      const m = pathname.match(/step-(\d+)/);
      const curr = m ? Number(m[1]) : 5;
      router.push(`/kyc-process/step-${Math.max(1, curr - 1)}`);
    });

  const continueHandler =
    onContinue ?? (() => router.push("/kyc-process/step-6"));

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        {/* Steps */}
        <div className="-mx-4 px-4 mb-10 lg:mb-16 overflow-x-auto no-scrollbar">
          <div className="flex lg:justify-between gap-4 sm:gap-6 min-w-[680px] lg:min-w-0">
            {steps.map((s, i) => {
              const Icon = s.icon as any;
              const completed = i < current;
              const active = i === current;

              const item = (
                <div className="min-w-[88px] flex flex-col items-center text-center">
                  <div
                    className={[
                      "grid place-items-center rounded-full border-2 mb-2",
                      "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20",
                      completed
                        ? "bg-emerald-700 border-emerald-700 text-white"
                        : active
                        ? "bg-themeTeal border-themeTeal text-themeTealWhite"
                        : "bg-themeTealWhite border-themeTealLighter text-themeTealLighter opacity-50",
                    ].join(" ")}
                    aria-current={active ? "step" : undefined}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  </div>
                  <span
                    className={[
                      "text-md",
                      completed
                        ? "text-emerald-700 font-semibold"
                        : active
                        ? "text-themeTeal font-semibold"
                        : "text-themeTealLighter opacity-50",
                    ].join(" ")}
                  >
                    {s.label}
                  </span>
                </div>
              );

              return completed ? (
                <Link key={s.label} href={s.href}>{item}</Link>
              ) : (
                <div key={s.label} aria-disabled className="pointer-events-none select-none">{item}</div>
              );
            })}
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-center mb-2 text-themeTeal flex gap-2 items-center justify-center">
          <UserRoundCheck className="h-6 w-6 sm:h-7 sm:w-7 text-themeSkyBlue" />
          <span>Demat Account</span>
        </h2>
        <p className="text-center text-themeTealLighter mb-6 sm:mb-8">
          Provide your demat account details for fund settlement.
        </p>

        {/* Card */}
        <div className="bg-themeTealWhite border border-themeTealLighter rounded p-4 sm:p-6 md:p-8 lg:p-10">
          <div>
            <h3 className="text-themeSkyBlue font-semibold text-base sm:text-lg">
              Step 5: Demat Account Details
            </h3>
            <p className="text-themeTealLighter text-xs sm:text-sm mb-6">
              Enter your demat account information to verify the trading account
            </p>

            {/* Dynamic rows */}
            <div className="space-y-4">
              {rows.map((row, i) => (
                <div key={i} className="grid gap-x-4 md:grid-cols-2 items-start">
                  <div className="space-y-1">
                    <label className="text-sm text-themeTeal">
                      Demat Account Type<span className="text-red-600">*</span>
                    </label>
                    <select
                      value={row.type}
                      onChange={(e) => update(i, "type", e.target.value as Demat["type"])}
                      className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTeal focus:outline-none focus:border-themeTeal"
                    >
                      <option value="">Select Account Type</option>
                      <option value="CDSL">CDSL</option>
                      <option value="NSDL">NSDL</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-themeTeal">
                      Demat Account ID<span className="text-red-600">*</span>
                    </label>
                    <input
                      value={row.id}
                      onChange={(e) => update(i, "id", e.target.value.toUpperCase().slice(0, 16))}
                      placeholder="AAAAAAAAAAAAAAAA"
                      className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTeal placeholder-themeTealLighter focus:outline-none focus:border-themeTeal"
                    />
                    {!rowValid(row) && (row.type !== "" || row.id !== "") && (
                      <p className="text-xs text-red-600">Type required and ID must be 8–16 letters/numbers.</p>
                    )}
                  </div>

                  {rows.length > 1 && (
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-sm text-themeSkyBlue cursor-pointer hover:text-themeTeal transition duration-500 mt-2 mb-4"
                      >
                        Remove this account
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addRow}
                disabled={rows.length >= MAX_ROWS}
                className={[
                  "px-4 py-2 rounded border text-sm transition duration-500",
                  rows.length < MAX_ROWS
                    ? "border-themeTealLighter text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite cursor-pointer"
                    : "border-themeTealLighter text-themeTealLighter cursor-not-allowed",
                ].join(" ")}
              >
                Add more Demat Accounts
              </button>
              {rows.length >= MAX_ROWS && (
                <span className="ml-3 text-xs text-themeTealLighter">Max {MAX_ROWS} accounts.</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:justify-between mt-6 sm:mt-8">
          <button
            type="button"
            onClick={backHandler}
            className="w-full sm:w-auto px-5 py-3 rounded border border-themeTealLighter text-themeTealLighter cursor-pointer hover:bg-themeTeal hover:text-themeTealWhite transition duration-500"
          >
            Back
          </button>
          <button
            type="button"
            onClick={continueHandler}
            disabled={!allValid}
            className={[
              "w-full sm:w-auto px-6 py-3 rounded font-medium",
              allValid
                ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer"
                : "bg-themeTealLighter text-white cursor-not-allowed",
            ].join(" ")}
          >
            Continue to Video KYC
          </button>
        </div>
      </div>
    </section>
  );
}
