"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveLeft, Mail, MailCheck } from "lucide-react";
import { Button, Heading } from "@/components/ui";

export default function Page() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk) return;
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.status) {
        setSent(true);
      } else {
        console.error('Forgot password error:', data.message);
        // Still show success message for security (don't reveal if email exists)
        setSent(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      // Still show success message for security
      setSent(true);
    }
  };

  return (
    <main className="min-h-[100svh]">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL (branding copy) */}
        <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-themeTealWhite px-10 py-10">
          <div className="flex items-center justify-start">
            <Image src="/images/logo-white.svg" alt="InvestApp" width={180} height={34} />
          </div>

          <div className="mt-16 text-left max-w-md">
            <Heading as="h2">Forgot your password?</Heading>
            <p className="mt-6 text-themeTealWhite">
              No stress. Enter your email and we’ll send a secure link to reset access.
            </p>
          </div>

          <figure className="mt-auto text-left max-w-lg">
            <blockquote className="italic text-themeTealWhite">
              “Security is not a product, but a process.”
            </blockquote>
            <figcaption className="mt-3">Bruce Schneier</figcaption>
          </figure>
        </aside>

        {/* RIGHT PANEL (form / success) */}
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
                {!sent ? (
                <>
                    <div className="text-center">
                        <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">Forgot Password?</Heading>
                        <p className="text-sm text-themeTealLighter">Remembered it?{" "}<Link href="/login" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">Log in</Link></p>
                    </div>

                    <form onSubmit={onSubmit} className="mt-10 space-y-6">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-themeTeal">Email</span>
                            <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLighter" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded border border-themeTealLighter bg-white pl-10 pr-4 py-3 outline-none focus:border-themeTeal transition duration-500"
                            />
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={!emailOk}
                            className={`w-full rounded-full px-6 py-4 text-white text-base font-semibold transition ${
                            emailOk
                                ? "bg-themeSkyBlue hover:bg-themeTeal cursor-pointer"
                                : "bg-themeTealLighter cursor-not-allowed"
                            }`}
                        >
                            Send reset link
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
                </>
                ) : (
                <div className="mx-auto max-w-lg text-center">
                    <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-themeTeal/10 text-themeTeal">
                        <MailCheck className="h-7 w-7" />
                    </div>
                    <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">Check your email</Heading>
                    <p className="text-sm text-themeTealLighter">We sent a reset link to <span className="font-medium text-themeTeal">{email}</span>. It expires in 30 minutes.</p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-full border border-themeTealLight px-10 py-3 hover:bg-themeTealWhite text-themeTeal transition duration-500"
                    >
                        Back to login
                    </Link>
                    <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="inline-flex items-center justify-center rounded-full bg-themeSkyBlue hover:bg-themeTeal text-themeTealWhite px-10 py-3 cursor-pointer transition duration-500"
                    >
                        Use a different email
                    </button>
                    </div>

                    <p className="mt-6 text-xs text-themeTealLighter">
                    Didn’t get it? Check spam or{" "}
                    <button type="button" className="text-themeSkyBlue hover:text-themeTeal transition duration-500 cursor-pointer">
                        resend
                    </button>
                    .
                    </p>
                </div>
                )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
