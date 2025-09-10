"use client";

import { useState } from "react";
import { Button, Heading } from "../ui";

export default function RegisterCard({
  onSubmit,
}: {
  onSubmit?: (email: string) => void;
}) {
  const [email, setEmail] = useState("");

  return (
    <aside className="rounded-md bg-white p-5">
      <Heading as="h5" className="mb-3 leading-6 text-themeTeal font-semibold text-center">Register to buy and sell private company shares</Heading>
      <p className="mt-2 text-themeTealLighter text-center text-sm">For more details on private stock price information, financing and valuation, register or log in.</p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(email);
        }}
      >
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-themeTealLighter bg-white px-3 py-2 outline-none"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-themeTeal px-4 py-2 font-semibold text-white transition duration-500 hover:bg-themeSkyBlue cursor-pointer"
        >
          Register
        </button>
      </form>

      <p className="mt-3 text-sm text-themeTealLighter text-center">By registering, you agree to Invest App&apos;s <Button text='Terms of Use' color="skyblue" variant="link" size="nospacesm" href='/' /> Already registered?  <Button text='Log in' color="skyblue" variant="link" size="nospacesm" href='/' /></p>
    </aside>
  );
}
