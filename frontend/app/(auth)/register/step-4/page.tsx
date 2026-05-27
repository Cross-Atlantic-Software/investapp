"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button, Heading } from "@/components/ui";
import { useAuth } from "@/lib/contexts/AuthContext";

function Step4Content() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("");

  const { user } = useAuth();
  const router = useRouter();

  // Get user name for personalization
  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    } else {
      // Fallback: get name from localStorage
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || '');
      }
    }
  }, [user]);

  const handleKYCStart = () => {
    setIsSubmitting(true);
    // Check if this is a stock-buy flow
    const authFlow = sessionStorage.getItem('authFlow');
    if (authFlow === 'stock-buy') {
      // Store the flow type for KYC process
      sessionStorage.setItem('kycFlow', 'stock-buy');
    }
    // Redirect to KYC process
    router.push("/kyc-process/step-1");
  };

  const handleSkipKYC = () => {
    setIsSubmitting(true);
    // Check if this is a stock-buy flow
    const authFlow = sessionStorage.getItem('authFlow');
    const returnUrl = sessionStorage.getItem('returnAfterAuth');
    
    if (authFlow === 'stock-buy' && returnUrl) {
      // Return to the stock page
      router.push(returnUrl);
      // Clean up after successful redirect
      sessionStorage.removeItem('authFlow');
      sessionStorage.removeItem('returnAfterAuth');
    } else {
      // Default redirect to invest page
      router.push("/invest");
    }
  };

  return (
    <main className="min-h-[100svh]">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL */}
        <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-themeTealWhite px-6 md:px-10 pt-6 md:pt-10">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-white.svg" alt="AltStock" width={197} height={36} />
          </div>

          <ul className="mt-10 md:mt-12 space-y-8 md:space-y-10">
            <li>
              <Link href='/register/step-1' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                    <CheckCircle className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Your details</p>
                    <p className="text-sm">Email and password set</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href='/register/step-2' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                    <CheckCircle className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Email verified</p>
                    <p className="text-sm">OTP verification complete</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href='/register/step-3' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                    <CheckCircle className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Profile completed</p>
                    <p className="text-sm">Personal details added</p>
                </div>
              </Link>
            </li>
            <li>
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-themeTeal">
                    <FileText className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">KYC Verification</p>
                    <p className="text-sm">Complete your verification</p>
                </div>
              </div>
            </li>
          </ul>

          <div className="mt-auto mb-6 md:mb-10 pt-6 text-sm leading-relaxed">
            <blockquote>
              <i>&ldquo;The best investment you can make is in yourself.&rdquo;</i>
            </blockquote>
            <figcaption className="mt-2">Warren Buffett</figcaption>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <section className="lg:col-span-8 h-full flex items-center justify-center px-4 sm:px-8 py-6 lg:py-0">
          <div className="w-full">
            <div className="text-center lg:text-start mb-10 lg:mb-0">
              <Button
                text="Back to website"
                color="themeTeal"
                variant="outline"
                size="sm"
                href="/"
                icon={ArrowLeft}
                iconPosition="left"
                className="rounded-full mb-6 w-fit"
              />
            </div>
            <div className="max-w-xl md:max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-themeTeal text-white mb-6">
                  <FileText className="h-8 w-8" />
                </div>
                <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">
                  Complete Your KYC
                </Heading>
                <p className="text-sm text-themeTealLighter">
                  {userName ? `Hi ${userName}! ` : ''}To start investing, we need to verify your identity
                </p>
              </div>

              {/* KYC Benefits */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Why Complete KYC?
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Start investing in unlisted stocks immediately</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Higher investment limits and better rates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Access to exclusive investment opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>Secure and compliant with regulatory requirements</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleKYCStart}
                  disabled={isSubmitting}
                  className={`w-full rounded-full px-6 py-4 text-white font-semibold duration-500 transition flex items-center justify-center gap-2 ${
                    !isSubmitting ? "bg-themeTeal hover:bg-themeTealDark cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Starting KYC...
                    </>
                  ) : (
                    <>
                      Complete KYC Verification
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleSkipKYC}
                  disabled={isSubmitting}
                  className={`w-full rounded-full px-6 py-4 font-semibold duration-500 transition border-2 ${
                    !isSubmitting 
                      ? "border-themeTeal text-themeTeal hover:bg-themeTeal hover:text-white cursor-pointer" 
                      : "border-themeTealLighter text-themeTealLighter cursor-not-allowed"
                  }`}
                >
                  Skip for Now - Go to Dashboard
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-xs text-themeTealLighter">
                  You can complete KYC later from your dashboard anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4"></div>
          <p className="text-themeTealLighter">Loading...</p>
        </div>
      </div>
    }>
      <Step4Content />
    </Suspense>
  );
}
