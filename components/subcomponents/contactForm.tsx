"use client";

import { useState } from "react";

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "Retail Investor" | "Institutional Investor" | "Partner" | "Other";
  message: string;
  agree: boolean;
};

const ROLES = [
  "Retail Investor",
  "Institutional Investor",
  "Partner",
  "Other",
] as const;

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

export default function ContactForm({
  onSubmit,
  className = "",
}: {
  onSubmit?: (data: ContactFormValues) => void;
  className?: string;
}) {
  const [v, setV] = useState<ContactFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Retail Investor",
    message: "",
    agree: false,
  });

  function update<K extends keyof ContactFormValues>(
    k: K,
    val: ContactFormValues[K]
  ) {
    setV((s) => ({ ...s, [k]: val }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(v);
      }}
      className={["rounded bg-themeTealWhite p-4 sm:p-8", className].join(" ")}
    >
      <h3 className="mb-1 text-lg font-semibold text-themeTeal">
        Send us a Message
      </h3>
      <p className="mb-5 text-sm text-themeTealLight">
        Looking for quick answers? Visit our FAQ’s before submitting a request.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="First Name"
          value={v.firstName}
          onChange={(e) => update("firstName", e.target.value)}
        />
        <Input
          label="Last Name"
          value={v.lastName}
          onChange={(e) => update("lastName", e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={v.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <Input
          label="Contact Number"
          value={v.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>

      {/* role radio group */}
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

      {/* message */}
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

      {/* agree checkbox (custom) */}
      <label className="mt-4 flex items-start gap-3 select-none">
        {/* a11y checkbox */}
        <input
            type="checkbox"
            checked={v.agree}
            onChange={(e) => update("agree", e.target.checked)}
            className="peer sr-only"
        />

        {/* custom box */}
        <span
            aria-hidden
            className="
            mt-0.5 grid h-5 w-5 place-items-center rounded border bg-white
            border-themeTealLighter transition
            peer-checked:border-themeTeal peer-checked:bg-themeTeal
            peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-themeSkyBlue
            /* reveal the child SVG when the peer is checked */
            peer-checked:[&>svg]:opacity-100
            "
        >
            <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-white opacity-0 transition-opacity"
            >
            <path
                d="M20.285 6.708a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.714 10.55a1 1 0 1 1 1.414-1.414l5.05 5.05 8.485-8.485a1 1 0 0 1 1.622 1.007z"
                fill="currentColor"
            />
            </svg>
        </span>

        <span className="text-md text-themeTealLighter">
            By proceeding, I agree to{" "}
            <a href="#" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">Terms & Conditions</a>,{" "}
            <a href="#" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">Privacy Policy</a>{" "}
            and <a href="#" className="text-themeSkyBlue hover:text-themeTeal transition duration-500">Cancellation & Refund</a>.
        </span>
      </label>

      <div className="text-center">
      <button
        type="submit"
        disabled={!v.agree}
        className="mt-6 w-full rounded-full bg-themeSkyBlue px-8 py-4 font-semibold text-themeTealWhite disabled:opacity-50 sm:w-auto cursor-pointer hover:bg-themeTeal transition duration-500"
      >
        Send Message
      </button>
      </div>
    </form>
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
