"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckCircle2, Landmark, CreditCard,
  FileText, MapPin, UserRoundCheck, PenLine, Video,
} from "lucide-react";
import Link from "next/link";

type Props = {
  onContinue: () => void;
  onBack?: () => void;
};

/* ---------- tiny icons ---------- */
const SvgDot = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 8 8" aria-hidden {...props}>
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
);
const SvgCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z"
      fill="currentColor"
    />
  </svg>
);

export default function KYCStep2PanProfile({ onContinue }: Props) {
  // ---- form state
  const [pan, setPan] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [father, setFather] = useState("");
  const [residency, setResidency] = useState<"resident" | "nri">("resident");
    const router = useRouter();
    const pathname = usePathname();
    const m = pathname.match(/step-(\d+)/);
    const curr = m ? Number(m[1]) : 1;
    const onBack = () => router.push(`/kyc-process/step-${Math.max(1, curr - 1)}`);

  // ---- validation
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // PAN format
  const isPanValid = panRegex.test(pan.toUpperCase());
  const formValid = isPanValid && fullName.trim() && dob && father.trim();

  // ---- steps
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
  const current = 1; // zero-based index -> Step 2

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        {/* Top steps (icon + label). Scrollable on mobile */}
        <div className="-mx-4 px-4 mb-10 lg:mb-16 overflow-x-auto no-scrollbar">
            <div className="flex lg:justify-between gap-4 sm:gap-6 min-w-[680px] lg:min-w-0">
                {steps.map(({ label, icon: Icon, href }, i) => {
                    const completed = i < current;
                    const active = i === current;

                    const item = (
                    <div className="min-w-[88px] flex flex-col items-center text-center group">
                    <div
                        className={[
                        "grid place-items-center rounded-full border-2 mb-2",
                        "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20",
                        completed
                            ? "bg-emerald-700 border-emerald-700 text-themeTealWhite"
                            : active
                            ? "bg-themeTeal border-themeTeal text-themeTealWhite"
                            : "bg-themeTealWhite border-themeTealLighter text-themeTealLighter opacity-50",
                        ].join(" ")}
                        aria-current={active ? "step" : undefined}
                    >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    </div>
                    <span className={[
                        "text-md",
                        completed ? "text-emerald-700 font-semibold" :
                        active ? "text-themeTeal font-semibold" : "text-themeTealLighter opacity-50"
                    ].join(" ")}>
                        {label}
                    </span>
                  </div>
                );

                return completed ? (
                    <Link key={label} href={href} className="focus:outline-none">
                      {item}
                    </Link>
                  ) : (
                    <div key={label} aria-disabled className="pointer-events-none select-none">
                      {item}
                    </div>
                  );
                })}
            </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-center mb-2 text-themeTeal flex gap-2 items-center justify-center">
          <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-themeSkyBlue" />
          <span>PAN Validation & Profile</span>
        </h2>
        <p className="text-center text-themeTealLighter mb-6 sm:mb-8">
          Enter your PAN details and basic profile information.
        </p>

        {/* Card */}
        <div className="bg-themeTealWhite border border-themeTealLighter rounded p-4 sm:p-6 md:p-8 lg:p-10 space-y-6">
          <div>
            <h3 className="text-themeSkyBlue font-semibold text-base sm:text-lg mb-1">
              Step 1: PAN Validation
            </h3>
            <p className="text-xs sm:text-sm text-themeTealLighter mb-6 sm:mb-8">
              We’ll verify your PAN against official records.
            </p>

            {/* Form */}
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (formValid) onContinue();
              }}
            >
              <div className="space-y-1">
                <label htmlFor="pan" className="text-sm text-themeTeal">PAN Number<span className="text-red-600">*</span></label>
                <input
                  id="pan"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="AAAAA9999A"
                  className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTealLighter placeholder-themeTealLighter focus:outline-none focus:border-themeTeal transition duration-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="fullname" className="text-sm text-themeTeal">Full Name (as per PAN)<span className="text-red-600">*</span></label>
                <input
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTealLighter placeholder-themeTealLighter focus:outline-none focus:border-themeTeal transition duration-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="dob" className="text-sm text-themeTeal">Date of Birth<span className="text-red-600">*</span></label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTealLighter placeholder-themeTealLighter focus:outline-none focus:border-themeTeal transition duration-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="father" className="text-sm text-themeTeal">Father’s Name<span className="text-red-600">*</span></label>
                <input
                  id="father"
                  value={father}
                  onChange={(e) => setFather(e.target.value)}
                  placeholder="Father's Name"
                  className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 text-themeTealLighter placeholder-themeTealLighter focus:outline-none focus:border-themeTeal transition duration-500"
                />
              </div>

              {/* Residency Status — radio pills */}
                <fieldset className="space-y-2 mb-10" role="radiogroup" aria-labelledby="residencyLegend">
                    <legend id="residencyLegend" className="text-sm text-themeTeal">
                        Residency Status<span className="text-red-600">*</span>
                    </legend>

                    <div className="flex flex-wrap gap-3">
                        {[
                        { value: "resident", label: "Resident Indian" },
                        { value: "nri", label: "Non-Resident Indian (NRI)" },
                        ].map((opt) => {
                        const checked = residency === opt.value;
                        return (
                            <label key={opt.value} className="cursor-pointer">
                            <input
                                type="radio"
                                name="residency"
                                value={opt.value}
                                checked={checked}
                                onChange={() => setResidency(opt.value as "resident" | "nri")}
                                className="peer sr-only"
                            />
                            <span
                                className={[
                                "inline-flex items-center gap-2 rounded-full px-3 py-2 ring-1 transition",
                                "bg-white text-themeTeal ring-themeTealLighter",
                                "peer-checked:bg-themeTeal peer-checked:text-themeTealWhite peer-checked:ring-themeTeal",
                                ].join(" ")}
                            >
                                <span className="grid h-5 w-5 place-items-center">
                                {checked ? (
                                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white">
                                    <SvgCheck className="h-3.5 w-3.5 text-themeTeal" />
                                    </span>
                                ) : (
                                    <SvgDot className="h-5 w-5 text-slate-400" />
                                )}
                                </span>
                                <span className="text-sm font-medium">{opt.label}</span>
                            </span>
                            </label>
                        );
                        })}
                    </div>
                </fieldset>

              {/* Validation state */}
              {isPanValid ? (
                <div className="rounded border border-emerald-600 bg-emerald-50 p-4 text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">PAN validated successfully! All details match official format.</span>
                </div>
              ) : (
                <div className="rounded border border-red-600 bg-red-50 p-4 text-red-700 text-sm">
                  Enter PAN in format <code>AAAAA9999A</code>.
                </div>
              )}

            </form>
          </div>
        </div>
            {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:justify-between mt-6 sm:mt-8">
            <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-5 py-3 rounded border border-themeTealLighter text-themeTealLighter cursor-pointer hover:bg-themeTeal hover:text-themeTealWhite transition duration-500"
            >
                Back
            </button>
            <button type="submit" disabled={!formValid} className={[
                "w-full sm:w-auto py-3 px-6 rounded font-medium",
                formValid
                    ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer"
                    : "bg-themeTealLighter text-white cursor-not-allowed",
                ].join(" ")}
            >
                Continue to Address Verification
            </button>
        </div>
        </div>
    </section>
  );
}
