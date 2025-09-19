"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, MoveLeft, Phone } from "lucide-react";
import { Button, Heading } from "@/components/ui";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Page() {
  const [pwVisible, setPwVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, googleAuth, error: authError, clearError, isAuthenticated } = useAuth();
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
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsGoogleLoading(true);
      setError("");
      clearError();
      await googleAuth();
    } catch {
      setError("Google authentication failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-[100svh]">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
        {/* LEFT: form */}
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
                <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">
                    Log in to your account
                </Heading>
                <p className="text-sm text-themeTealLighter">
                    Don’t have an account?{" "}
                    <Link href="/register/step-1" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">
                    Sign up
                    </Link>
                </p>
                </div>

                <form onSubmit={onSubmit} className="mt-10 space-y-6">
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
                            className="w-full rounded border border-themeTealLighter bg-white pl-10 pr-4 py-3 outline-none focus:border-themeTeal transition duration-500"
                        />
                        </div>
                    </label>

                    {/* Password */}
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium">Password</span>
                        <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themeTealLighter" />
                        <input
                            type={pwVisible ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                    </label>

                    <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-themeSkyBlue hover:text-themeTeal transition duration-500">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full rounded-full px-6 py-4 text-white text-base font-semibold transition duration-500 ${
                            isSubmitting 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-themeSkyBlue hover:bg-themeTeal cursor-pointer'
                        }`}
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-themeTealLighter" />
                        <span className="text-xs text-themeTealLight">Or continue with</span>
                        <div className="h-px flex-1 bg-themeTealLighter" />
                    </div>

                    {/* Social */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading}
                        className={`inline-flex items-center justify-center gap-2 rounded-full border border-themeTealLight px-4 py-4 hover:bg-themeTealWhite transition duration-500 ${
                          isGoogleLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 16.3 4 9.6 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.4l-6.3-5.2C29.1 34.6 26.7 36 24 36c-5.3 0-9.6-3.4-11.3-7.9l-6.6 5.1C9.4 39.6 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.4-5.2 6-9.3 6-5.3 0-9.6-3.4-11.3-7.9l-6.6 5.1C9.4 39.6 16.1 44 24 44c8.5 0 19-6.2 19-20 0-1.3-.1-2.7-.4-3.5z"/></svg>

                        <span className="font-medium">
                          {isGoogleLoading ? 'Connecting...' : 'Login with Google'}
                        </span>
                        </button>

                        <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-themeTealLight px-4 py-4 hover:bg-themeTealWhite transition duration-500 cursor-pointer"
                        >
                        <Phone className="w-5 h-5 text-themeTeal" />
                        <span className="font-medium">Login with Phone</span>
                        </button>
                    </div>

                    <p className="text-[11px] sm:text-xs text-themeTealLighter text-center">
                        By clicking Login, you agree to our{" "}
                        <Link href="/legal/terms-of-service" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">Terms of Service</Link>{" "}
                        and{" "}
                        <Link href="/legal/privacy-policy" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">Privacy Policy</Link>.
                    </p>
                </form>
            </div>

          </div>
        </section>

        {/* RIGHT: teal welcome */}
        <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-themeTealWhite px-10 py-10">
          <div className="flex items-center justify-start">
            <Image src="/images/logo-white.svg" alt="InvestApp" width={180} height={34} />
          </div>

          <div className="mt-16 text-center">
            <Heading as="h2" className="text-themeTealWhite">Welcome Back</Heading>
            <p className="mt-6 max-w-md mx-auto text-themeTealWhite">
              Invest APP is a platform that provides Unlisted Share trading opportunities for informational purposes only.
            </p>
          </div>

          <figure className="mt-auto text-left max-w-lg">
            <blockquote className="italic text-themeTealWhite">
              “You can’t connect the dots looking forward; you can only connect them looking backward.
              So you have to trust that the dots will somehow connect in your future.”
            </blockquote>
            <figcaption className="mt-3">Steve Jobs</figcaption>
          </figure>
        </aside>
      </div>
    </main>
  );
}
