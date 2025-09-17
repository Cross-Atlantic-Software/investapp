"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckCircle2, Info, Landmark, CreditCard,
  FileText, MapPin, UserRoundCheck, PenLine, Video
} from "lucide-react";

type Props = {
  onContinue?: () => void;
  onBack?: () => void;
};

export default function KYCStep3Address({ onContinue, onBack }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // ----- steps config
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
  const current = 2; // 0-based -> Step 3

  // ----- Aadhaar state
  const [aadhaarDigits, setAadhaarDigits] = useState(""); // only digits
  const [verified, setVerified] = useState<null | "otp" | "digilocker">(null);
  const isAadhaarValid = /^\d{12}$/.test(aadhaarDigits);

  const formatted = aadhaarDigits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  function handleAadhaarChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 12);
    setAadhaarDigits(digits);
    if (verified) setVerified(null);
  }

  function verify(mode: "otp" | "digilocker") {
    if (!isAadhaarValid) return;
    // stub: integrate OTP/Digilocker here
    setVerified(mode);
  }

  const backHandler =
    onBack ??
    (() => {
      const m = pathname.match(/step-(\d+)/);
      const curr = m ? Number(m[1]) : 3;
      router.push(`/kyc-process/step-${Math.max(1, curr - 1)}`);
    });

  const continueHandler =
    onContinue ??
    (() => router.push("/kyc-process/step-4"));

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        {/* Steps with icons */}
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
                <Link key={s.label} href={s.href} className="focus:outline-none">
                  {item}
                </Link>
              ) : (
                <div key={s.label} aria-disabled className="pointer-events-none select-none">
                  {item}
                </div>
              );
            })}
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-center mb-2 text-themeTeal flex gap-2 items-center justify-center">
          <MapPin className="h-6 w-6 sm:h-7 sm:w-7 text-themeSkyBlue" />
          <span>Address Verification</span>
        </h2>
        <p className="text-center text-themeTealLighter mb-6 sm:mb-8">
          Verify your address using Aadhaar eKYC
        </p>

        {/* Card */}
        <div className="bg-themeTealWhite border border-themeTealLighter rounded p-4 sm:p-6 md:p-8 lg:p-10">
          <h3 className="text-themeSkyBlue font-semibold text-base sm:text-lg">
            Step 2: Aadhaar eKYC
          </h3>
          <p className="text-themeTealLighter text-xs sm:text-sm mb-6">
            Quick and secure address verification using your Aadhaar
          </p>

          <div className="space-y-3">
            <label htmlFor="aadhaar" className="text-sm text-themeTeal">
              Aadhaar Number<span className="text-red-600">*</span>
            </label>
            <input
              id="aadhaar"
              inputMode="numeric"
              autoComplete="off"
              value={formatted}
              onChange={(e) => handleAadhaarChange(e.target.value)}
              placeholder="1234 5678 9012"
              className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTeal placeholder-themeTealLighter focus:outline-none focus:border-themeTeal transition"
            />

            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                disabled={!isAadhaarValid}
                onClick={() => verify("otp")}
                className={[
                  "px-5 py-3 rounded font-medium w-full sm:w-auto",
                  isAadhaarValid
                    ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer"
                    : "bg-themeTealLighter text-white cursor-not-allowed",
                ].join(" ")}
              >
                Verify with Aadhaar OTP
              </button>

              <button
                type="button"
                disabled={!isAadhaarValid}
                onClick={() => verify("digilocker")}
                className={[
                  "px-5 py-3 rounded font-medium w-full sm:w-auto",
                  isAadhaarValid
                    ? "bg-themeTeal text-themeTealWhite cursor-pointer"
                    : "bg-themeTealLighter text-white cursor-not-allowed",
                ].join(" ")}
              >
                Verify Using Digilocker
              </button>
            </div>

            {verified ? (
              <div className="mt-6 rounded border border-emerald-600 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-md">
                  Address verified via {verified === "otp" ? "Aadhaar OTP" : "DigiLocker"}.
                </span>
              </div>
            ) : (
              <div className="mt-6 rounded border border-themeTealLighter bg-white p-4 text-themeTealLighter text-md">
                Enter your 12-digit Aadhaar number and choose a verification method.
              </div>
            )}
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
            disabled={!verified}
            className={[
              "w-full sm:w-auto px-6 py-3 rounded font-medium",
              verified
                ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer"
                : "bg-themeTealLighter text-white cursor-not-allowed",
            ].join(" ")}
          >
            Continue to Bank Proof
          </button>
        </div>
      </div>
    </section>
  );
}
