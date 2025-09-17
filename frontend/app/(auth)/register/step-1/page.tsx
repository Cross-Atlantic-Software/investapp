"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Video, User, MoveLeft, Phone } from "lucide-react";
import Image from "next/image";
import { Button, Heading } from "@/components/ui";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Page() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { register, error: authError, clearError, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    clearError();

    try {
      const response = await register({ email, password });
      // Store email and token for verification step
      localStorage.setItem('pending_email', email);
      if (response.token) {
        localStorage.setItem('pending_token', response.token);
      }
      router.push("/register/step-2");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100svh]"> {/* safer on mobile chrome */}
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL */}
        <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-white px-6 md:px-10 pt-6 md:pt-10">
          <div className="flex items-center gap-3 text-themeTealWhite">
            <Image src="/images/logo-white.svg" alt="Invest App" width={197} height={36} />
          </div>

          <ul className="mt-10 md:mt-12 space-y-8 md:space-y-10">
            <li>
              <Link href='/register/step-1' className="flex items-start gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                  <User className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                  <p className="font-semibold">Your details</p>
                  <p className="text-sm text-themeTealWhite">Provide an email and password</p>
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
                  <p className="text-sm text-themeTealWhite">Enter your verification code</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href='/register/step-3' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                  <Video className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                  <p className="font-semibold">Welcome to InvestApp</p>
                  <p className="text-sm text-themeTealWhite">Complete your profile setup</p>
                </div>
              </Link>
            </li>
          </ul>

          <figure className="mt-auto mb-6 md:mb-10 pt-6 text-sm leading-relaxed text-themeTealWhite">
            <blockquote>
              <i>“My brain is only a receiver, in the Universe there is a core from which we obtain knowledge, strength and inspiration. I have not penetrated into the secrets of this core, but I know that it exists.”</i>
            </blockquote>
            <figcaption className="mt-2 text-themeTealWhite">Nikola Tesla</figcaption>
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
                className="rounded-full mb-4 sm:mb-6 w-fit"
              /> 
            </div>

            <div className="max-w-xl md:max-w-xl mx-auto">

              <div className="text-center">
                <Heading as="h2" className="mb-2 sm:mb-3 text-3xl sm:text-4xl leading-tight">
                  Request a Free Trial
                </Heading>
                <p className="text-sm sm:text-base text-themeTealLighter">
                  Already have an account?{" "}
                  <Link href="/login" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">
                    Sign in
                  </Link>
                </p>
              </div>

              <form onSubmit={onSubmit} className="mt-8 sm:mt-10 space-y-5 sm:space-y-6">
                {/* Error Message */}
                {(error || authError) && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error || authError}
                  </div>
                )}

                {/* Email */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Email / Username</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLighter" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded border border-themeTealLighter bg-themeTealWhite pl-10 pr-4 py-3 outline-none focus:border-themeTeal"
                    />
                  </div>
                </label>

                {/* Password */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLighter" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded border border-themeTealLighter bg-white pl-10 pr-11 py-3 outline-none focus:border-themeTeal"
                    />
                    <button
                      type="button"
                      aria-label={passwordVisible ? "Hide password" : "Show password"}
                      onClick={() => setPasswordVisible((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-themeTealLight"
                    >
                      {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full rounded-full px-6 py-4 text-white text-base font-semibold transition duration-500 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-themeSkyBlue hover:bg-themeTeal cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-px flex-1 bg-themeTealLighter" />
                  <span className="text-xs sm:text-sm text-themeTealLight">Or continue with</span>
                  <div className="h-px flex-1 bg-themeTealLighter" />
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-themeTealLight px-4 py-3 sm:py-4 hover:bg-themeTealWhite cursor-pointer"
                  >
                    {/* Google icon */}
                    <svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.4l-6.3-5.2C29.1 34.6 26.7 36 24 36c-5.3 0-9.6-3.4-11.3-7.9l-6.6 5.1C9.4 39.6 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.4-5.2 6-9.3 6-5.3 0-9.6-3.4-11.3-7.9l-6.6 5.1C9.4 39.6 16.1 44 24 44c8.5 0 19-6.2 19-20 0-1.3-.1-2.7-.4-3.5z"/></svg>
                    <span className="font-medium">Register with Google</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-themeTealLight px-4 py-3 sm:py-4 hover:bg-themeTealWhite cursor-pointer"
                  >
                    <Phone className="w-5 h-5 text-themeTeal" />
                    <span className="font-medium">Register with Phone</span>
                  </button>
                </div>

                <p className="text-[11px] sm:text-xs text-themeTealLighter text-center">
                  By clicking Register, you agree to our{" "}
                  <Link href="/legal/terms-of-service" className="text-themeSkyBlue hover:text-themeTeal duration-500">Terms of Service</Link> and{" "}
                  <Link href="/legal/privacy-policy" className="text-themeSkyBlue hover:text-themeTeal duration-500">Privacy Policy</Link>.
                </p>
              </form>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
