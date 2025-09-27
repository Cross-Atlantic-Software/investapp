"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Video, User, MoveLeft } from "lucide-react";
import { Button, Heading } from "@/components/ui";
import { useAuth } from "@/lib/contexts/AuthContext";

function Step3Content() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);

  const { completeProfile, error: authError, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Allow access to profile completion even if not fully authenticated
  // This page is part of the registration flow

  // Load user data from Google OAuth or localStorage
  useEffect(() => {
    // Check for Google OAuth data in URL parameters
    const googleData = searchParams.get('data');
    if (googleData) {
      try {
        const userData = JSON.parse(decodeURIComponent(googleData));
        console.log('Google OAuth data received:', userData);
        
        // Pre-fill form with Google data
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        
        // Store the token for authentication
        if (userData.token) {
          localStorage.setItem('auth_token', userData.token);
          localStorage.setItem('auth_user', JSON.stringify({
            id: userData.id || '',
            email: userData.email || '',
            name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          }));
        }
        
        // Clear the URL parameters to clean up the URL
        const url = new URL(window.location.href);
        url.searchParams.delete('data');
        window.history.replaceState({}, '', url.toString());
        
      } catch (error) {
        console.error('Error parsing Google OAuth data:', error);
      }
    } else {
      // Fallback: Load email from stored user data (for regular registration flow)
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        const user = JSON.parse(userData);
        setEmail(user.email || '');
      }
    }
    
    // Debug: Check what tokens are available
    console.log('Available tokens in localStorage:');
    console.log('auth_token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
    console.log('pending_token:', localStorage.getItem('pending_token') ? 'Present' : 'Missing');
    console.log('auth_user:', localStorage.getItem('auth_user') ? 'Present' : 'Missing');
  }, [searchParams]);

  const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
  const canSubmit = firstName && lastName && emailOk && phone && source;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setError("");
    clearError();

    try {
      const response = await completeProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        source: source,
      });
      
      console.log('Complete profile response:', response);
      
      // Show welcome message instead of immediate redirect
      setProfileCompleted(true);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
      console.error('Profile completion error:', err);
      // Use the specific error message from the backend
      const errorMessage = err instanceof Error ? err.message : "Profile completion failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100svh]">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL */}
        <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-themeTealWhite px-6 md:px-10 pt-6 md:pt-10">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-white.svg" alt="Invest App" width={197} height={36} />
          </div>

          <ul className="mt-10 md:mt-12 space-y-8 md:space-y-10">
            <li>
              <Link href='/register/step-1' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                    <User className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Your details</p>
                    <p className="text-sm">Provide an email and password</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href='/register/step-2' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                    <Mail className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Verify your email</p>
                    <p className="text-sm">Enter your verification code</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href='/register/step-3' className="flex items-start gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-themeTeal">
                    <Video className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Welcome to Invest App</p>
                    <p className="text-sm">Watch intro video and create your profile</p>
                </div>
              </Link>
            </li>
          </ul>

          <figure className="mt-auto mb-6 md:mb-10 pt-6 text-sm leading-relaxed">
            <blockquote>
              <i>“My brain is only a receiver, in the Universe there is a core from which we obtain knowledge, strength and inspiration. I have not penetrated into the secrets of this core, but I know that it exists.”</i>
            </blockquote>
            <figcaption className="mt-2">Nikola Tesla</figcaption>
          </figure>
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
                icon={MoveLeft}
                iconPosition="left"
                className="rounded-full mb-6 w-fit"
              />
            </div>
            <div className="max-w-xl md:max-w-2xl mx-auto">
              {profileCompleted ? (
                // Welcome Message
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-themeTeal text-white mb-4">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <Heading as="h2" className="mb-2 text-3xl sm:text-4xl text-themeTeal">
                      Welcome to InvestApp!
                    </Heading>
                    <p className="text-lg text-themeTealLighter mb-4">
                      Your profile has been completed successfully
                    </p>
                    <p className="text-sm text-themeTealLighter">
                      Redirecting you to your dashboard in a moment...
                    </p>
                    <div className="mt-6">
                      <div className="inline-flex items-center gap-2 text-themeTeal">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-themeTeal"></div>
                        <span className="text-sm">Loading dashboard...</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Profile Form
                <>
                  <div className="text-center mb-8">
                    <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">Create your profile</Heading>
                    <p className="text-sm text-themeTealLighter">Fill all the details to proceed</p>
                  </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Error Message */}
                {(error || authError) && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error || authError}
                  </div>
                )}

                {/* Row: First & Last name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-themeTeal">First Name <span className="text-red-500">*</span></span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded border border-themeTealLighter bg-white px-4 py-3 outline-none focus:border-themeTeal"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-themeTeal">Last Name <span className="text-red-500">*</span></span>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded border border-themeTealLighter bg-white px-4 py-3 outline-none focus:border-themeTeal transition duration-500"
                    />
                  </label>
                </div>

                {/* Row: Email & Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-themeTeal">Email <span className="text-red-500">*</span></span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded border border-themeTealLighter bg-white px-4 py-3 outline-none focus:border-themeTeal transition duration-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-themeTeal">Mobile <span className="text-red-500">*</span></span>
                    <div className="flex">
                      {/* Country flag/prefix */}
                      <span className="inline-flex items-center gap-2 rounded-l border border-themeTealLighter bg-white px-3">
                        <span className="text-sm text-themeTeal">+91</span>
                      </span>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-r border border-l-0 border-themeTealLighter bg-white px-4 py-3 outline-none focus:border-themeTeal transition duration-500"
                      />
                    </div>
                  </label>
                </div>

                {/* Source select */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-themeTeal">How Did You Hear About InvestApp? <span className="text-red-500">*</span></span>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded border border-themeTealLighter bg-white px-4 py-3 outline-none focus:border-themeTeal transition duration-500"
                  >
                    <option value="">Select an option</option>
                    <option value="search">Search engine</option>
                    <option value="friend">Friend or colleague</option>
                    <option value="social">Social media</option>
                    <option value="news">News/article</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full rounded-full px-6 py-4 text-white font-semibold duration-500 transition ${
                      canSubmit && !isSubmitting ? "bg-themeSkyBlue hover:bg-themeTeal cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Details'}
                  </button>
                </div>
              </form>
                </>
              )}
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
      <Step3Content />
    </Suspense>
  );
}
