"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Video, User, MoveLeft } from "lucide-react";
import { Button, Heading } from "@/components/ui";

// Reusable OTP input group
function OTPGroup({
  length = 6,
  value,
  onChange,
  onFilled,
}: {
  length?: number;
  value: string[];
  onChange: (next: string[]) => void;
  onFilled?: (code: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setAt = (i: number, v: string) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/[^0-9]/g, "").slice(-1);
    if (!digit && value[i] === "") return; // no-op
    setAt(i, digit);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();

    const code = (digit ? [...value.slice(0, i), digit, ...value.slice(i + 1)] : value).join("");
    if (onFilled && code.length === length) onFilled(code);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setAt(i - 1, "");
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    const next = [...value];
    for (let k = 0; k < length && i + k < length; k++) next[i + k] = text[k] ?? next[i + k] ?? "";
    onChange(next);
    const filled = next.join("");
    if (onFilled && filled.length === length) onFilled(filled);
    refs.current[Math.min(i + text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center gap-3">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => void (refs.current[idx] = el)}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[idx] ?? ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={(e) => handlePaste(idx, e)}
          className="w-10 h-10 md:w-12 md:h-12 text-2xl md:text-3xl text-themeTeal rounded-md border border-themeTealLighter bg-themeTealWhite text-center outline-none focus:border-themeTeal"
        />
      ))}
    </div>
  );
}

export default function Page() {
  // Demo state
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(""));
  const [phoneOtp, setPhoneOtp] = useState<string[]>(Array(6).fill(""));
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const emailFilled = emailOtp.join("").length === 6;
  const phoneFilled = phoneOtp.join("").length === 6;
  const canContinue = emailVerified && phoneVerified;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // noop; wire to API
  };

  return (
    <main className="min-h-[100svh]">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL */}
        <aside className="hidden lg:flex lg:col-span-4 h-full flex-col bg-themeTeal text-themeTealWhite px-6 md:px-10 pt-6 md:pt-10">
          <div className="flex items-center gap-3 text-themeTealWhite">
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
                    <p className="text-sm text-themeTealWhite">Provide an email and password</p>
                </div>
              </Link>
            </li>
            <li className="flex items-start gap-4">
              <Link href='/register/step-2' className="flex items-start gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-themeTeal">
                    <Mail className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Verify your email</p>
                    <p className="text-sm text-themeTealWhite">Enter your verification code</p>
                </div>
              </Link>
            </li>
            <li className="flex items-start gap-4 opacity-50">
              <Link href='/register/step-3' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
                    <Video className="h-5 w-5 text-themeTeal" />
                </span>
                <div>
                    <p className="font-semibold">Welcome to Invest App</p>
                    <p className="text-sm text-themeTealWhite">Watch intro video and create your profile</p>
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
                className="rounded-full mb-6 w-fit"
              />
            </div>
            <div className="max-w-xl md:max-w-2xl mx-auto">
                <form onSubmit={onSubmit} className="space-y-12">
                {/* Email verify */}
                <div className="text-center">
                    <Heading as="h2" className="mb-1 text-3xl sm:text-4xl">Verify your email</Heading>
                    <p className="text-sm text-themeTealLighter">
                    We send a code to <span className="font-semibold text-themeSkyBlue">dineshsharma@gmail.com</span>
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3">
                    <OTPGroup value={emailOtp} onChange={setEmailOtp} />
                    <button
                        type="button"
                        disabled={!emailFilled}
                        onClick={() => setEmailVerified(true)}
                        className={`rounded px-5 py-3 text-white font-medium duration-500 transition ${
                        emailFilled ? "bg-themeTeal cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
                        }`}
                    >
                        Verify
                    </button>
                    </div>

                    <p className="mt-4 text-sm text-themeTealLight">
                    Didn’t get a code? <Link href="#" className="text-themeSkyBlue transition duration-500 hover:text-themeTeal">Click to resend</Link>
                    </p>
                </div>

                {/* Phone verify */}
                <div className="text-center">
                    <Heading as="h2" className="mb-1 text-3xl sm:text-4xl">Verify your Phone Number</Heading>
                    <p className="text-sm text-themeTealLighter">
                    We send a code to <span className="font-semibold text-themeSkyBlue">+91 999 99 99999</span>
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3">
                    <OTPGroup value={phoneOtp} onChange={setPhoneOtp} />
                    <button
                        type="button"
                        disabled={!phoneFilled}
                        onClick={() => setPhoneVerified(true)}
                        className={`rounded px-5 py-3 text-white font-medium duration-500 transition ${
                        phoneFilled ? "bg-themeTeal cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
                        }`}
                    >
                        Verify
                    </button>
                    </div>

                    <p className="mt-4 text-sm text-themeTealLight">
                    Didn’t get a code? <Link href="#" className="text-themeSkyBlue transition duration-500 hover:text-themeTeal">Click to resend</Link>
                    </p>
                </div>

                <div className="pt-2">
                    <button
                    type="submit"
                    disabled={!canContinue}
                    className={`w-full rounded-full px-6 py-4 text-themeTealWhite font-semibold transition ${
                        canContinue ? "bg-themeSkyBlue hover:bg-themeTeal cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
                    }`}
                    >
                    Continue
                    </button>
                </div>
                </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
