"use client";

import { useState, FormEvent } from "react";
import { Mail } from "lucide-react";
import { Button, Heading } from "@/components/ui";

type Props = {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  onSubmit?: (email: string) => void;
};

export default function NewsletterCTA({
  title = "Exclusive Updates Await!",
  description = "Dive into the world of Invest App with our Newsletter Be the First to Know, Explore and Experience.",
  placeholder = "Your Email Address",
  buttonLabel = "Subscribe",
  onSubmit,
}: Props) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit?.(email);
    setEmail("");
  }

  return (
    <section>
      <div className="appContainer">
        <div className="rounded-md bg-themeTealWhite px-6 py-10 md:py-16">
          <div className="mx-auto max-w-xl text-center">
            <Heading as="h3" className="text-themeTeal mb-2">
              {title}
            </Heading>
            <p className="text-themeTealLight">{description}</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col items-center gap-4">
              {/* input group */}
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <div className="flex w-full max-w-lg items-center gap-2 rounded border border-themeTealLighter bg-white p-2 focus:border-themeTeal">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded bg-themeTealLighter">
                  <Mail className="h-6 w-6 text-themeTealWhite" />
                </span>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-themeTeal placeholder-themeTealLighter focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="solid"
                color="skyblue"
                size="md"
                className="w-44"
                text={buttonLabel}
                href="/"
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
