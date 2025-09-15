"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Video, User, MoveLeft } from "lucide-react";
import { Button, Heading } from "@/components/ui";

export default function Page() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("dineshsharma@gmail.com");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");

  const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
  const canSubmit = firstName && lastName && emailOk && phone && source;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: wire API
    console.log({ firstName, lastName, email, phone, source });
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
              <div className="text-center mb-8">
                <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">Create your profile</Heading>
                <p className="text-sm text-themeTealLighter">Fill all the details to proceed</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Row: First & Last name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-themeTeal">First Name</span>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded border border-themeTealLighter bg-white px-4 py-3 outline-none focus:border-themeTeal"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-themeTeal">Last Name</span>
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
                    <span className="mb-2 block text-sm font-medium text-themeTeal">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded border border-themeTealLighter bg-white px-4 py-3 outline-none focus:border-themeTeal transition duration-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-themeTeal">Mobile</span>
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
                  <span className="mb-2 block text-sm font-medium text-themeTeal">How Did You Hear About Caplight?</span>
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
                    disabled={!canSubmit}
                    className={`w-full rounded-full px-6 py-4 text-white font-semibold duration-500 transition ${
                      canSubmit ? "bg-themeSkyBlue hover:bg-themeTeal cursor-pointer" : "bg-themeTealLighter cursor-not-allowed"
                    }`}
                  >
                    Submit Details
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
