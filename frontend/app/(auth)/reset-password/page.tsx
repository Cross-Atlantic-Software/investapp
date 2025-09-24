"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, MoveLeft, CheckCircle } from "lucide-react";
import { Button, Heading } from "@/components/ui";

export default function Page() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/forgot-password');
    }
  }, [token, router]);

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 6;
  const formValid = passwordValid && passwordsMatch;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || !token) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password 
        }),
      });

      const data = await response.json();
      
      if (data.status) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-[100svh]">
        <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
          {/* LEFT PANEL (branding copy) */}
          <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-themeTealWhite px-10 py-10">
            <div className="flex items-center justify-start">
              <Image src="/images/logo-white.svg" alt="InvestApp" width={180} height={34} />
            </div>

            <div className="mt-16 text-left max-w-md">
              <Heading as="h2">Password Reset Complete</Heading>
              <p className="mt-6 text-themeTealWhite">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
            </div>

            <figure className="mt-auto text-left max-w-lg">
              <blockquote className="italic text-themeTealWhite">
                &ldquo;Security is not a product, but a process.&rdquo;
              </blockquote>
              <figcaption className="mt-3">Bruce Schneier</figcaption>
            </figure>
          </aside>

          {/* RIGHT PANEL (success message) */}
          <section className="lg:col-span-8 flex items-center justify-center px-4 sm:px-8 py-6 lg:py-0">
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
              <div className="max-w-xl md:max-w-xl mx-auto">
                <div className="mx-auto max-w-lg text-center">
                  <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">Password Reset Complete</Heading>
                  <p className="text-sm text-themeTealLighter">Your password has been successfully updated. Redirecting to login...</p>

                  <div className="mt-8">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-full bg-themeSkyBlue hover:bg-themeTeal text-white px-10 py-3 cursor-pointer transition duration-500"
                    >
                      Go to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh]">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL (branding copy) */}
        <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-themeTealWhite px-10 py-10">
          <div className="flex items-center justify-start">
            <Image src="/images/logo-white.svg" alt="InvestApp" width={180} height={34} />
          </div>

          <div className="mt-16 text-left max-w-md">
            <Heading as="h2">Reset your password</Heading>
            <p className="mt-6 text-themeTealWhite">
              Enter your new password below. Make sure it&apos;s secure and easy to remember.
            </p>
          </div>

          <figure className="mt-auto text-left max-w-lg">
            <blockquote className="italic text-themeTealWhite">
              &ldquo;Security is not a product, but a process.&rdquo;
            </blockquote>
            <figcaption className="mt-3">Bruce Schneier</figcaption>
          </figure>
        </aside>

        {/* RIGHT PANEL (form) */}
        <section className="lg:col-span-8 flex items-center justify-center px-4 sm:px-8 py-6 lg:py-0">
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
            <div className="max-w-xl md:max-w-xl mx-auto">
              <div className="text-center">
                <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">Reset Password</Heading>
                <p className="text-sm text-themeTealLighter">Remembered it?{" "}<Link href="/login" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">Log in</Link></p>
              </div>

              <form onSubmit={onSubmit} className="mt-10 space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* New Password */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-themeTeal">New Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLighter" />
                    <input
                      type={pwVisible ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded border border-themeTealLighter bg-white pl-10 pr-11 py-3 outline-none focus:border-themeTeal transition duration-500"
                    />
                    <button
                      type="button"
                      aria-label={pwVisible ? "Hide password" : "Show password"}
                      onClick={() => setPwVisible((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTealLight"
                    >
                      {pwVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password && !passwordValid && (
                    <p className="mt-1 text-xs text-red-600">Password must be at least 6 characters long</p>
                  )}
                </label>

                {/* Confirm Password */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-themeTeal">Confirm Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLighter" />
                    <input
                      type={confirmPwVisible ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded border border-themeTealLighter bg-white pl-10 pr-11 py-3 outline-none focus:border-themeTeal transition duration-500"
                    />
                    <button
                      type="button"
                      aria-label={confirmPwVisible ? "Hide password" : "Show password"}
                      onClick={() => setConfirmPwVisible((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTealLight"
                    >
                      {confirmPwVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={!formValid || isSubmitting}
                  className={`w-full rounded-full px-6 py-4 text-white text-base font-semibold transition duration-500 ${
                    formValid && !isSubmitting
                      ? 'bg-themeSkyBlue hover:bg-themeTeal cursor-pointer'
                      : 'bg-themeTealLighter cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <p className="text-[11px] sm:text-xs text-themeTealLighter text-center">
                  By continuing, you agree to our{" "}
                  <Link href="/terms-of-service" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">
                    Privacy Policy
                  </Link>.
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
