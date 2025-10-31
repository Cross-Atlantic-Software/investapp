"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CheckCircle2, Landmark, CreditCard,
  FileText, MapPin, UserRoundCheck, PenLine, UploadCloud,
} from "lucide-react";
import { useKYC } from "@/contexts/KYCContext";

export default function KYCStep3Address() {
  const router = useRouter();
  const pathname = usePathname();
  const { formData, updateFormData, markStepCompleted } = useKYC();

  // ----- Aadhaar state (initialize from context)
  const [aadhaarDigits, setAadhaarDigits] = useState(formData.aadhar_number);
  const [aadharFile, setAadharFile] = useState<File | null>(formData.aadhar_file);
  const [existingAadharFile, setExistingAadharFile] = useState<string | null>(formData.existing_aadhar_file);
  const [fileError, setFileError] = useState<string>("");
  const isAadhaarValid = /^\d{12}$/.test(aadhaarDigits);

  // Update existing file when formData changes
  useEffect(() => {
    setExistingAadharFile(formData.existing_aadhar_file);
  }, [formData.existing_aadhar_file]);

  // Update context when aadhaar changes
  useEffect(() => {
    updateFormData({
      aadhar_number: aadhaarDigits,
      aadhar_file: aadharFile,
    });
  }, [aadhaarDigits, aadharFile, updateFormData]);

  const formatted = aadhaarDigits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  function handleAadhaarChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 12);
    setAadhaarDigits(digits);
  }

  // File upload handler
  const handleFileUpload = (file: File | null) => {
    setFileError("");
    if (!file) {
      setAadharFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only PDF, JPG, and PNG files are allowed.");
      setAadharFile(null);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB.");
      setAadharFile(null);
      return;
    }

    setAadharFile(file);
    // Clear existing file when new file is uploaded
    if (existingAadharFile) {
      setExistingAadharFile(null);
      updateFormData({ existing_aadhar_file: null });
    }
  };

  // File is valid if either new file is uploaded OR existing file exists
  const fileValid = (aadharFile && aadharFile.size <= 5 * 1024 * 1024) || !!existingAadharFile;
  const allValid = isAadhaarValid && fileValid;

  const handleContinue = () => {
    if (allValid) {
      markStepCompleted(3);
      router.push('/kyc-process/step-4');
    }
  };

  // ----- steps config
  const steps = useMemo(
    () => [
      { label: "Documents", icon: FileText, href: "/kyc-process/step-1" },
      { label: "PAN Validation", icon: CreditCard, href: "/kyc-process/step-2" },
      { label: "Address Verification", icon: MapPin, href: "/kyc-process/step-3" },
      { label: "Bank Proof", icon: Landmark, href: "/kyc-process/step-4" },
      { label: "Demat Account", icon: UserRoundCheck, href: "/kyc-process/step-5" },
      { label: "eSign & Consent", icon: PenLine, href: "/kyc-process/step-7" },
    ],
    []
  );
  const current = 2; // 0-based -> Step 3

  const backHandler = () => {
    const m = pathname.match(/step-(\d+)/);
    const curr = m ? Number(m[1]) : 3;
    router.push(`/kyc-process/step-${Math.max(1, curr - 1)}`);
  };

  return (
    <section className="bg-themeTealWhite py-8 sm:py-12 lg:py-16">
      <div className="appContainer bg-white p-4 sm:p-6 md:p-10 lg:p-16 rounded">
        {/* Steps with icons */}
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

                    return completed ? (
                      <Link key={label} href={href} className="focus:outline-none">{item}</Link>
                    ) : (
                      <div key={label} aria-disabled className="pointer-events-none select-none">{item}</div>
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
            Step 3: Aadhaar Number
          </h3>
          <p className="text-themeTealLighter text-xs sm:text-sm mb-6">
            Enter your 12-digit Aadhaar number for address verification
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

            {isAadhaarValid ? (
              <p className="mt-2 text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Aadhaar number format is valid.
              </p>
            ) : aadhaarDigits.length > 0 ? (
              <p className="mt-2 text-sm text-red-600">
                Please enter a valid 12-digit Aadhaar number.
              </p>
            ) : (
              <p className="mt-2 text-sm text-themeTealLighter">
                Enter your 12-digit Aadhaar number to continue.
              </p>
            )}
          </div>

          {/* Aadhar File Upload */}
          <div className="space-y-3">
            <label className="text-sm text-themeTeal">
              Upload Aadhar Document<span className="text-red-600">*</span>
            </label>
            
            <div
              className="border-2 border-dashed border-themeTealLighter bg-white p-6 text-center rounded cursor-pointer hover:border-themeTeal transition-colors"
              onClick={() => document.getElementById('aadharFileInput')?.click()}
            >
              <input
                id="aadharFileInput"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
              />
              
              {aadharFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-themeTeal">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">{aadharFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAadharFile(null);
                    }}
                    className="text-xs text-themeSkyBlue underline hover:text-themeTeal"
                  >
                    Remove file
                  </button>
                </div>
              ) : existingAadharFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-themeTeal">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Previously uploaded file</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={existingAadharFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-themeSkyBlue underline hover:text-themeTeal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View existing file
                    </a>
                    <span className="text-xs text-themeTealLighter">or</span>
                    <button
                      type="button"
                      className="text-xs text-themeSkyBlue underline hover:text-themeTeal"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('aadharFileInput')?.click();
                      }}
                    >
                      Upload new file
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-themeTealWhite text-themeTeal">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-themeTeal font-medium">Upload your Aadhar document</p>
                    <p className="text-xs text-themeTealLighter mt-1">
                      Supported formats: PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center rounded border border-themeTealLighter px-4 py-2 text-sm text-themeTeal hover:bg-themeTealWhite"
                  >
                    Choose File
                  </button>
                </div>
              )}
              
              {fileError && (
                <p className="mt-2 text-xs text-red-600">{fileError}</p>
              )}
            </div>

            {(aadharFile || existingAadharFile) && (
              <p className="text-xs text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {aadharFile ? 'New Aadhar document uploaded successfully.' : 'Existing Aadhar document found.'}
              </p>
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
            onClick={handleContinue}
            disabled={!allValid}
            className={[
              "w-full sm:w-auto px-6 py-3 rounded font-medium",
              allValid
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
