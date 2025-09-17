"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText, CreditCard, MapPin, Landmark, UserRoundCheck, Video, PenLine,
  UploadCloud, CheckCircle2,
} from "lucide-react";

type Props = { onContinue?: () => void; onBack?: () => void };

export default function KYCStep4BankProof({ onContinue, onBack }: Props) {
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
  const current = 3; // 0-based -> Step 4

  // form
  const [acct, setAcct] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const acctDigits = acct.replace(/\D/g, "");
  const acctValid = /^\d{9,18}$/.test(acctDigits); // Indian accounts vary
  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
  const fileValid = !!file && file.size <= 5 * 1024 * 1024; // <=5MB
  const allValid = acctValid && ifscValid && fileValid;

  function onPickFile(f: File | null) {
    setErr("");
    if (!f) {
      setFile(null);
      return;
    }
    const okType = /pdf|jpg|jpeg|png/i.test(f.type) || /\.(pdf|jpg|jpeg|png)$/i.test(f.name);
    if (!okType) {
      setErr("Allowed types: PDF, JPG, PNG.");
      setFile(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErr("Max file size is 5MB.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  const backHandler =
    onBack ??
    (() => {
      const m = pathname.match(/step-(\d+)/);
      const curr = m ? Number(m[1]) : 4;
      router.push(`/kyc-process/step-${Math.max(1, curr - 1)}`);
    });

  const continueHandler =
    onContinue ?? (() => router.push("/kyc-process/step-5"));

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        {/* Steps */}
        <div className="-mx-4 px-4 mb-10 lg:mb-16 overflow-x-auto no-scrollbar">
          <div className="flex lg:justify-between gap-4 sm:gap-6 min-w-[680px] lg:min-w-0">
            {steps.map(({ label, icon: Icon, href }, i) => {
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
                    {label}
                  </span>
                </div>
              );

              return completed
                ? <Link key={label} href={href}>{item}</Link>
                : <div key={label} aria-disabled className="pointer-events-none select-none">{item}</div>;
            })}
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-center mb-2 text-themeTeal flex gap-2 items-center justify-center">
          <Landmark className="h-6 w-6 sm:h-7 sm:w-7 text-themeSkyBlue" />
          <span>Bank Account Verification</span>
        </h2>
        <p className="text-center text-themeTealLighter mb-6 sm:mb-8">
          Provide your bank account details for fund settlement.
        </p>

        {/* Card */}
        <div className="bg-themeTealWhite border border-themeTealLighter rounded p-4 sm:p-6 md:p-8 lg:p-10">
          <div>
            <h3 className="text-themeSkyBlue font-semibold text-base sm:text-lg">
              Step 4: Bank Details
            </h3>
            <p className="text-themeTealLighter text-xs sm:text-sm mb-6">
              Enter your bank account information and upload proof.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="acct" className="text-sm text-themeTeal">
                  Account Number<span className="text-red-600">*</span>
                </label>
                <input
                  id="acct"
                  inputMode="numeric"
                  value={acct}
                  onChange={(e) => setAcct(e.target.value.replace(/\s/g, ""))}
                  placeholder="XXXXXXXXXX"
                  className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTeal placeholder-themeTealLighter focus:outline-none focus:border-themeTeal transition"
                />
                {!acctValid && acct.length > 0 && (
                  <p className="text-xs text-red-600">Enter 9–18 digit account number.</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="ifsc" className="text-sm text-themeTeal">
                  IFSC Code<span className="text-red-600">*</span>
                </label>
                <input
                  id="ifsc"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="ABCD0XXXXXX"
                  className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTeal placeholder-themeTealLighter focus:outline-none focus:border-themeTeal transition"
                />
                {!ifscValid && ifsc.length > 0 && (
                  <p className="text-xs text-red-600">Format: 4 letters + 0 + 6 alphanumerics.</p>
                )}
              </div>
            </div>

            {/* Upload area */}
            <div className="mt-4">
              <label className="text-sm text-themeTeal">
                Upload Bank Proof<span className="text-red-600">*</span>
              </label>

              <div
                className="mt-2 rounded border-2 border-dashed border-themeTealLighter bg-white p-6 text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-themeTealWhite text-themeTeal">
                  <UploadCloud className="h-5 w-5" />
                </div>
                {file ? (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm text-themeTeal">{file.name}</p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs text-themeSkyBlue underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-themeTealLighter">
                      Upload cancelled cheque or bank statement
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center rounded border border-themeTealLighter px-4 py-2 text-sm text-themeTeal"
                    >
                      Choose File
                    </button>
                  </>
                )}
                {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
              </div>

              {fileValid && (
                <div className="mt-4 rounded border border-emerald-600 bg-emerald-50 p-3 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Bank proof attached.
                </div>
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
            Continue to Demat Account
          </button>
        </div>
      </div>
    </section>
  );
}
