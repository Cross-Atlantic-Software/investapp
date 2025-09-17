"use client";

import { useState } from "react";
import {
  CheckCircle2, Info, Landmark, CreditCard,
  FileText, MapPin, UserRoundCheck, PenLine, Video,
} from "lucide-react";

export default function KYCStep1Documents({ onContinue }: { onContinue: () => void }) {
  const [acknowledged, setAcknowledged] = useState(false);

  const steps = [
    { label: "Documents", icon: FileText },
    { label: "PAN Validation", icon: CreditCard },
    { label: "Address Verification", icon: MapPin },
    { label: "Bank Proof", icon: Landmark },
    { label: "Demat Account", icon: UserRoundCheck },
    { label: "Video KYC", icon: Video },
    { label: "eSign & Consent", icon: PenLine },
  ];

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        {/* Step Navigation with Icons */}
        <div className="-mx-4 px-4 mb-10 lg:mb-16 overflow-x-auto no-scrollbar">
          <div className="flex lg:justify-between gap-4 sm:gap-6 min-w-[680px] lg:min-w-0">
            {steps.map(({ label, icon: Icon }, idx) => { // <-- no any
              const active = idx === 0;
              return (
                <div key={label} className="min-w-[88px] flex flex-col items-center text-center group">
                  <div
                    className={[
                      "grid place-items-center rounded-full border-2 mb-2",
                      "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20",
                      active
                        ? "bg-themeTeal border-themeTeal text-themeTealWhite cursor-pointer"
                        : "bg-themeTealWhite border-themeTealLighter text-themeTealLighter opacity-50",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  </div>
                  <span className={active ? "text-themeTeal font-semibold text-md" : "text-themeTealLighter sm:text-md opacity-50"}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold font-serif text-center mb-2 text-themeTeal flex gap-2 items-center justify-center">
          <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-themeSkyBlue" />
          <span>Document Requirements</span>
        </h2>
        <p className="text-center text-themeTealLighter mb-6 sm:mb-8">
          Please ensure you have the following documents ready before proceeding
        </p>

        {/* Content */}
        <div className="bg-themeTealWhite border border-themeTealLighter rounded p-4 sm:p-6 md:p-8 lg:p-10 space-y-6">
          <div>
            <h3 className="text-themeSkyBlue text-lg sm:text-xl font-semibold mb-2">Required Documents Checklist</h3>
            <p className="text-xs sm:text-sm text-themeTealLighter mb-6 sm:mb-8">
              (All documents must be clear, valid, and in acceptable formats: PDF, JPG, PNG)
            </p>

            <div className="grid gap-y-8 gap-x-8 md:grid-cols-2 md:gap-x-12 lg:gap-x-16">
              <div>
                <h4 className="font-medium mb-3 sm:mb-4 text-lg sm:text-xl text-themeTeal flex items-center gap-2 border-b border-themeTealLighter pb-2 sm:pb-3">
                  Identity Proof
                </h4>
                <ul className="space-y-2 text-sm sm:text-base text-themeTealLight">
                  <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={16}/> PAN Card (Mandatory)</li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-500 mt-0.5" size={16}/>
                    <span>
                      Aadhaar Card
                      <span className="text-[11px] sm:text-xs text-themeTealLighter block">(Ensure PAN–Aadhaar linking is completed)</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3 sm:mb-4 text-lg sm:text-xl text-themeTeal flex items-center gap-2 border-b border-themeTealLighter pb-2 sm:pb-3">
                  Address Proof
                </h4>
                <ul className="space-y-2 text-sm sm:text-base text-themeTealLight">
                  <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={16}/> Aadhaar Card (Preferred)</li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-500 mt-0.5" size={16}/>
                    <span>
                      Utility Bill
                      <span className="text-[11px] sm:text-xs text-themeTealLighter block">(if different address)</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3 sm:mb-4 text-lg sm:text-xl text-themeTeal flex items-center gap-2 border-b border-themeTealLighter pb-2 sm:pb-3">
                  Bank Proof
                </h4>
                <ul className="space-y-2 text-sm sm:text-base text-themeTealLight">
                  <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={16}/> Cancelled Cheque</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={16}/> Bank Statement (Latest 3 months)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3 sm:mb-4 text-lg sm:text-xl text-themeTeal flex items-center gap-2 border-b border-themeTealLighter pb-2 sm:pb-3">
                  Additional Requirements
                </h4>
                <ul className="space-y-2 text-sm sm:text-base text-themeTealLight">
                  <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={16}/> Webcam/Camera for Video KYC</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={16}/> Aadhaar for eSign</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={16}/> Demat ID (If any)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-themeTealLighter rounded p-4 sm:p-6">
            <div className="flex items-center gap-2 text-themeSkyBlue mb-3 sm:mb-4">
              <Info size={20}/> Important Guidelines
            </div>
            <ul className="text-sm text-themeTealLighter list-disc pl-5 space-y-2">
              <li>All documents must be original and clearly visible</li>
              <li>Ensure good lighting when capturing document photos</li>
              <li>File size should not exceed 5MB per document</li>
              <li>Documents should be less than 6 months old (except PAN/Aadhaar)</li>
            </ul>
          </div>

          <label className="mt-2 sm:mt-4 flex items-center gap-3 select-none cursor-pointer">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span
              aria-hidden="true"
              className="grid h-5 w-5 place-items-center rounded border bg-white border-themeTealLighter transition
                         peer-checked:border-themeTeal peer-checked:bg-themeTeal peer-checked:[&_svg]:opacity-100"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity">
                <path d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z" fill="currentColor"/>
              </svg>
            </span>
            <span className="text-sm sm:text-base text-themeTealLight">
              I confirm that I have the required documents ready.
            </span>
          </label>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-end">
          <button
            disabled={!acknowledged}
            onClick={onContinue}
            className={[
              "w-full sm:w-auto py-3 px-6 rounded font-medium",
              acknowledged ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer" : "bg-themeTealLighter text-white cursor-not-allowed",
            ].join(" ")}
          >
            I Have All Documents – Continue
          </button>
        </div>
      </div>
    </section>
  );
}
