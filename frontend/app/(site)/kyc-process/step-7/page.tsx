"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText, CreditCard, MapPin, Landmark, UserRoundCheck, PenLine, CheckCircle2, UploadCloud
} from "lucide-react";
import { useKYC } from "@/contexts/KYCContext";

export default function KYCStep7ESign() {
  const router = useRouter();
  const pathname = usePathname();
  const { formData, updateFormData, markStepCompleted, submitKYC, isSubmitting } = useKYC();

  // consents + esign
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [signFile, setSignFile] = useState<File | null>(formData.signature_file);
  const [existingSignatureFile, setExistingSignatureFile] = useState<string | null>(formData.existing_signature_file);
  const [fileError, setFileError] = useState<string>("");
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const allConsented = c1 && c2 && c3;

  // Update existing file when formData changes
  useEffect(() => {
    setExistingSignatureFile(formData.existing_signature_file);
  }, [formData.existing_signature_file]);

  // Update context when signature file is uploaded
  useEffect(() => {
    updateFormData({
      signature_file: signFile,
      esign_completed: !!signFile,
    });
  }, [signFile, updateFormData]);

  const handleFileUpload = (file: File | null) => {
    setFileError("");
    if (!file) {
      setSignFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Only PDF, JPG, and PNG files are allowed.");
      setSignFile(null);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be less than 5MB.");
      setSignFile(null);
      return;
    }

    setSignFile(file);
    // Clear existing file when new file is uploaded
    if (existingSignatureFile) {
      setExistingSignatureFile(null);
      updateFormData({ existing_signature_file: null });
    }
  };

  // File is valid if either new file is uploaded OR existing file exists
  const fileValid = (signFile && signFile.size <= 5 * 1024 * 1024) || !!existingSignatureFile;

  const handleSubmit = async () => {
    console.log('KYC Submit clicked');
    console.log('All consented:', allConsented);
    console.log('Sign file:', signFile);
    console.log('Existing signature file:', existingSignatureFile);
    console.log('Is submitting:', isSubmitting);
    
    if (!allConsented || !fileValid) {
      console.log('Validation failed - allConsented:', allConsented, 'signFile:', !!signFile);
      return;
    }
    
    console.log('Starting KYC submission...');
    const result = await submitKYC();
    console.log('KYC submission result:', result);
    setSubmitResult(result);
    
    if (result.success) {
      markStepCompleted(7);
      // Redirect to success page or dashboard
      setTimeout(() => {
        router.push('/kyc-process/complete');
      }, 2000);
    }
  };

  const backHandler = () => {
    const m = pathname.match(/step-(\d+)/);
    const curr = m ? Number(m[1]) : 7;
    router.push(`/kyc-process/step-${Math.max(1, curr - 2)}`); // Go back 2 steps since we removed step 6
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
  const current = 5; // 0-based -> Step 7 (now step 6)

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
                  <span className={["text-md", completed ? "text-emerald-700 font-semibold" : active ? "text-themeTeal font-semibold" : "text-themeTealLighter opacity-50"].join(" ")}>
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
          <PenLine className="h-6 w-6 sm:h-7 sm:w-7 text-themeSkyBlue" />
          <span>eSign & Consent</span>
        </h2>
        <p className="text-center text-themeTealLighter mb-6 sm:mb-8">
          Review and digitally sign the required documents.
        </p>

        {/* Card */}
        <div className="bg-themeTealWhite border border-themeTealLighter rounded p-4 sm:p-6 md:p-8 lg:p-10">
          <h3 className="text-themeSkyBlue font-semibold text-base sm:text-lg">Step 7: Digital Signature</h3>
          <p className="text-themeTealLighter text-xs sm:text-sm mb-6">Provide consent and complete the process with eSign.</p>

          <h3 className="text-themeTeal font-semibold text-base sm:text-lg mb-4">Required Consents</h3>
        
          <div className="space-y-6">
            {/* consent 1 */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" className="peer sr-only" checked={c1} onChange={(e) => setC1(e.target.checked)} />
              <span aria-hidden className="grid h-5 w-5 place-items-center rounded border bg-white border-themeTealLighter transition peer-checked:border-themeTeal peer-checked:bg-themeTeal peer-checked:[&_svg]:opacity-100">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity"><path d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z" fill="currentColor"/></svg>
              </span>
              <span className="text-sm text-themeTealLighter">
                I agree to the <a href="#" className="text-themeSkyBlue hover:text-themeTeal duration-500 transition">terms and conditions</a> of account opening and trading services.
              </span>
            </label>

            {/* consent 2 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" className="peer sr-only" checked={c2} onChange={(e) => setC2(e.target.checked)} />
              <span aria-hidden className="grid h-5 w-5 place-items-center rounded border bg-white border-themeTealLighter transition peer-checked:border-themeTeal peer-checked:bg-themeTeal peer-checked:[&_svg]:opacity-100">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity"><path d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z" fill="currentColor"/></svg>
              </span>
              <span className="text-sm text-themeTealLighter">
                I agree to the <a href="#" className="text-themeSkyBlue hover:text-themeTeal duration-500 transition">privacy policy</a> and <a href="#" className="text-themeSkyBlue hover:text-themeTeal duration-500 transition">data processing terms</a>.
              </span>
            </label>

            {/* consent 3 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" className="peer sr-only" checked={c3} onChange={(e) => setC3(e.target.checked)} />
              <span aria-hidden className="grid h-5 w-5 place-items-center rounded border bg-white border-themeTealLighter transition peer-checked:border-themeTeal peer-checked:bg-themeTeal peer-checked:[&_svg]:opacity-100">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity"><path d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z" fill="currentColor"/></svg>
              </span>
              <span className="text-sm text-themeTealLighter">
                I understand the risks involved in trading and investment activities.
              </span>
            </label>

            <hr className="my-4 border-themeTealLighter" />

            {/* Signature File Upload */}
            <div className="space-y-3">
              <label className="text-sm text-themeTeal">
                Upload Signature Document<span className="text-red-600">*</span>
              </label>
              
              <div
                className="border-2 border-dashed border-themeTealLighter bg-white p-6 text-center rounded cursor-pointer hover:border-themeTeal transition-colors"
                onClick={() => document.getElementById('signFileInput')?.click()}
              >
                <input
                  id="signFileInput"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
                />
                
                {signFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-themeTeal">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium">{signFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSignFile(null);
                      }}
                      className="text-xs text-themeSkyBlue underline hover:text-themeTeal"
                    >
                      Remove file
                    </button>
                  </div>
                ) : existingSignatureFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-themeTeal">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium">Previously uploaded file</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={existingSignatureFile}
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
                          document.getElementById('signFileInput')?.click();
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
                      <p className="text-sm text-themeTeal font-medium">Upload your signature document</p>
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

              {(signFile || existingSignatureFile) && (
                <p className="text-xs text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {signFile ? 'New signature document uploaded successfully.' : 'Existing signature document found.'}
                </p>
              )}
            </div>

            {submitResult && (
              <div className={`mt-4 rounded border p-3 text-sm flex items-center gap-2 ${
                submitResult.success 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                  : 'border-red-600 bg-red-50 text-red-700'
              }`}>
                <CheckCircle2 className="h-4 w-4" /> {submitResult.message}
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
            onClick={handleSubmit}
            disabled={!allConsented || !fileValid || isSubmitting}
            className={[
              "w-full sm:w-auto px-6 py-3 rounded font-medium",
              allConsented && fileValid && !isSubmitting
                ? "bg-themeSkyBlue text-themeTealWhite cursor-pointer"
                : "bg-themeTealLighter text-white cursor-not-allowed",
            ].join(" ")}
          >
            {isSubmitting ? "Submitting KYC..." : "Submit KYC Application"}
          </button>
        </div>
      </div>
    </section>
  );
}
