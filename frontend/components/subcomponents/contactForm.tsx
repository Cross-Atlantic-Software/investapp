"use client";

import { useRef, useState } from "react";

/* ---------- types ---------- */
export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "Retail Investor" | "Institutional Investor" | "Partner" | "Other";
  message: string;
  agree: boolean;
};

const ROLES = ["Retail Investor", "Institutional Investor", "Partner", "Other"] as const;

/* ---------- tiny icons ---------- */
const SvgDot = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 8 8" aria-hidden {...props}>
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
);
const SvgCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z"
      fill="currentColor"
    />
  </svg>
);

/* ---------- OTP group ---------- */
function OTPGroup({
  length = 6,
  value,
  onChange,
}: {
  length?: number;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setAt = (i: number, d: string) => {
    const next = [...value];
    next[i] = d;
    onChange(next);
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    const next = [...value];
    for (let k = 0; k < text.length && i + k < length; k++) next[i + k] = text[k]!;
    onChange(next);
    refs.current[Math.min(i + text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center gap-3">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[idx] ?? ""}
          onChange={(e) => {
            const d = e.target.value.replace(/[^0-9]/g, "").slice(-1);
            setAt(idx, d);
            if (d && idx < length - 1) refs.current[idx + 1]?.focus();
          }}
          onKeyDown={(e) => onKeyDown(idx, e)}
          onPaste={(e) => onPaste(idx, e)}
          className="w-12 h-12 text-3xl text-themeTeal rounded border border-themeTealLighter bg-white text-center outline-none focus:border-themeTeal"
        />
      ))}
    </div>
  );
}

/* ---------- form ---------- */
export default function ContactForm({
  onSubmit,
  className = "",
}: {
  onSubmit?: (data: ContactFormValues) => void;
  className?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [v, setV] = useState<ContactFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Retail Investor",
    message: "",
    agree: false,
  });

  function update<K extends keyof ContactFormValues>(k: K, val: ContactFormValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  const submitEnquiry = async (formData: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          company: formData.role,
          subject: `Contact from ${formData.role}`,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        // Reset form
        setV({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          role: "Retail Investor",
          message: "",
          agree: false,
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  type Phase = "form" | "otp";
  const [phase, setPhase] = useState<Phase>("form");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpFilled = otp.join("").length === 6;
  const [verified, setVerified] = useState(false);

  return phase === "form" ? (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitEnquiry(v);
      }}
      className={["rounded bg-themeTealWhite p-4 sm:p-8", className].join(" ")}
    >
      <h3 className="mb-1 text-lg font-semibold text-themeTeal">Send us a Message</h3>
      <p className="mb-5 text-sm text-themeTealLight">
        Looking for quick answers? Visit our FAQ's before submitting a request.
      </p>

      {submitStatus === 'success' && (
        <div className="mb-4 rounded bg-green-100 border border-green-400 text-green-700 px-4 py-3">
          Thank you! Your message has been sent successfully. We'll get back to you soon.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 rounded bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          Sorry, there was an error sending your message. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="First Name" value={v.firstName} onChange={(e) => update("firstName", e.target.value)} />
        <Input label="Last Name" value={v.lastName} onChange={(e) => update("lastName", e.target.value)} />
        <Input label="Email" type="email" value={v.email} onChange={(e) => update("email", e.target.value)} />
        <Input label="Contact Number" value={v.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm text-themeTealLight">I’m a</legend>
        <div className="flex flex-wrap gap-3">
          {ROLES.map((r) => {
            const checked = v.role === r;
            return (
              <label key={r} className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={checked}
                  onChange={() => update("role", r)}
                  className="peer sr-only"
                />
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 ring-1 transition",
                    "bg-white text-themeTeal ring-themeTealLighter",
                    "peer-checked:bg-themeTeal peer-checked:text-themeTealWhite peer-checked:ring-themeTeal",
                  ].join(" ")}
                >
                  <span className="grid h-5 w-5 place-items-center">
                    {checked ? (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-white">
                        <SvgCheck className="h-3.5 w-3.5 text-themeTeal" />
                      </span>
                    ) : (
                      <SvgDot className="h-5 w-5 text-slate-400" />
                    )}
                  </span>
                  <span className="text-sm font-medium">{r}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-4 block">
        <div className="mb-1 text-sm text-themeTealLight">Message</div>
        <textarea
          value={v.message}
          onChange={(e) => update("message", e.target.value)}
          rows={5}
          className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 outline-none transition duration-500 focus:border-themeTeal"
          placeholder="How can we help?"
        />
      </label>

      <label className="mt-4 flex items-start gap-3 select-none">
        <input
          type="checkbox"
          checked={v.agree}
          onChange={(e) => update("agree", e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="mt-0.5 grid h-5 w-5 place-items-center rounded border bg-white border-themeTealLighter transition peer-checked:border-themeTeal peer-checked:bg-themeTeal peer-checked:[&>svg]:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white opacity-0 transition-opacity">
            <path
              d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="text-md text-themeTealLighter">
          By proceeding, I agree to{" "}
          <a href="#" className="text-themeSkyBlue transition duration-500 hover:text-themeTeal">
            Terms & Conditions
          </a>
          ,{" "}
          <a href="#" className="text-themeSkyBlue transition duration-500 hover:text-themeTeal">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="text-themeSkyBlue transition duration-500 hover:text-themeTeal">
            Cancellation & Refund
          </a>
          .
        </span>
      </label>

      <div className="text-center">
        <button
          type="submit"
          disabled={!v.agree || isSubmitting}
          className="mt-6 w-full sm:w-auto rounded-full bg-themeSkyBlue transition duration-500 cursor-pointer px-8 py-4 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-themeTeal"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  ) : (
    <div className={["rounded flex flex-col justify-center bg-themeTealWhite p-4 sm:p-8", className].join(" ")}>
      <h3 className="text-2xl font-semibold text-themeTeal">Verify your Phone Number</h3>
      <p className="mt-2 text-themeTealLight">
        We send a code to <span className="font-semibold text-themeTeal">{v.phone || "+91 999 99 99999"}</span>
      </p>

      <div className="mt-6 flex items-center gap-3">
        <OTPGroup value={otp} onChange={setOtp} />
        <button
          type="button"
          disabled={!otpFilled}
          onClick={() => setVerified(true)} // TODO: call verify API with otp.join("")
          className={`rounded px-6 py-3 text-white font-medium transition duration-500 ${
            otpFilled ? "bg-themeTeal hover:bg-themeSkyBlue cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
          }`}
        >
          Verify
        </button>
      </div>

      <p className="mt-4 text-themeTealLight">
        Didn’t get a code?{" "}
        <button type="button" className="text-themeSkyBlue hover:text-themeTeal transition duration-500 cursor-pointer">
          Click to resend
        </button>
      </p>

      <div className="mt-8">
        <button
          type="button"
          disabled={!verified}
          onClick={() => onSubmit?.(v)}
          className={`w-full sm:w-auto rounded-full px-8 py-4 font-semibold text-white transition duration-500 ${
            verified ? "bg-themeSkyBlue hover:bg-themeTeal cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
          }`}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}

/* --- tiny input helper --- */
function Input({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-themeTealLight">{label}</div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded border border-themeTealLighter bg-white px-3 py-2 outline-none transition duration-500 focus:border-themeTeal"
      />
    </label>
  );
}
