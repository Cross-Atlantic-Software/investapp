"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText, CreditCard, MapPin, Landmark, UserRoundCheck, PenLine, UploadCloud, CheckCircle2,
} from "lucide-react";
import { useKYC } from "@/contexts/KYCContext";

type Demat = { 
  type: "" | "Individual" | "Joint" | "NRI(repatriable)" | "Non-repatriable NRI" | "Corporate" | "Minor" | "HUF" | "Trust/Society/Partnership"; 
  id: string 
};

export default function KYCStep5Demat() {
  const router = useRouter();
  const pathname = usePathname();
  const { formData, updateFormData, markStepCompleted } = useKYC();

  // form state (initialize from context)
  const [rows, setRows] = useState<Demat[]>([
    { type: formData.demat_type as Demat["type"] || "", id: formData.demat_account_id }
  ]);
  const [dematFile, setDematFile] = useState<File | null>(formData.demat_file);
  const [fileError, setFileError] = useState<string>("");
  const MAX_ROWS = 5;

  // Update context when form data changes
  useEffect(() => {
    if (rows.length > 0 && rows[0].type && rows[0].id) {
      updateFormData({
        demat_type: rows[0].type,
        demat_account_id: rows[0].id,
        demat_file: dematFile,
      });
    }
  }, [rows, dematFile, updateFormData]);

  const idOk = (v: string) => /^[A-Za-z0-9]{8,16}$/.test(v.trim());
  const rowValid = (r: Demat) => !!r.type && idOk(r.id);
  const fileValid = !!dematFile && dematFile.size <= 5 * 1024 * 1024;
  const allValid = rows.length > 0 && rows.every(rowValid) && fileValid;

  // File upload handler
  const handleFileUpload = (file: File | null) => {
    setFileError("");
    if (!file) {
      setDematFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only PDF, JPG, and PNG files are allowed.");
      setDematFile(null);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB.");
      setDematFile(null);
      return;
    }

    setDematFile(file);
  };

  const addRow = () => setRows((r) => (r.length >= MAX_ROWS ? r : [...r, { type: "", id: "" }]));
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const update = (i: number, k: keyof Demat, v: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  const handleContinue = () => {
    if (allValid) {
      markStepCompleted(5);
      router.push('/kyc-process/step-7');
    }
  };

  // steps
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
  const current = 4; // 0-based -> Step 5

  const backHandler = () => {
    const m = pathname.match(/step-(\d+)/);
    const curr = m ? Number(m[1]) : 5;
    router.push(`/kyc-process/step-${Math.max(1, curr - 1)}`);
  };

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
                      <option value="">Select Demat Account Type</option>
                      <option value="Individual">Individual</option>
                      <option value="Joint">Joint</option>
                      <option value="NRI(repatriable)">NRI (Repatriable)</option>
                      <option value="Non-repatriable NRI">Non-repatriable NRI</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Minor">Minor</option>
                      <option value="HUF">HUF</option>
                      <option value="Trust/Society/Partnership">Trust/Society/Partnership</option>
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

            {/* Demat File Upload */}
            <div className="space-y-3">
              <label className="text-sm text-themeTeal">
                Upload Demat Document<span className="text-red-600">*</span>
              </label>
              
              <div
                className="border-2 border-dashed border-themeTealLighter bg-white p-6 text-center rounded cursor-pointer hover:border-themeTeal transition-colors"
                onClick={() => document.getElementById('dematFileInput')?.click()}
              >
                <input
                  id="dematFileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
                />
                
                {dematFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-themeTeal">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium">{dematFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDematFile(null);
                      }}
                      className="text-xs text-themeSkyBlue underline hover:text-themeTeal"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-themeTealWhite text-themeTeal">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-themeTeal font-medium">Upload your Demat document</p>
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

              {dematFile && (
                <p className="text-xs text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Demat document uploaded successfully.
                </p>
              )}
            </div>

            {/* <div className="mt-4">
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
            </div> */}
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
            Continue to eSign & Consent
          </button>
        </div>
      </div>
    </section>
  );
}
