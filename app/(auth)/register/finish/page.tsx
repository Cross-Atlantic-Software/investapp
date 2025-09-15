"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Video, User, MoveLeft } from "lucide-react";
import { Button, Heading } from "@/components/ui";

export default function Page() {
  const [showVideo, setShowVideo] = useState(false);

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
              <Link href='/register/step-3' className="flex items-start gap-4 opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-themeTealWhite">
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
        <section className="lg:col-span-8 h-full flex items-center justify-center px-4 sm:px-8 py-4 sm:py-6 lg:py-0">
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
            <div className="max-w-full sm:max-w-xl md:max-w-2xl mx-auto">
              <div className="text-center">
                <Heading as="h2" className="mb-2 text-3xl sm:text-4xl">Welcome to Invest App</Heading>
                <p className="text-sm text-themeTealLighter">Watch the intro video and create your profile</p>
              </div>

              {/* Video block */}
              <div className="mt-5 sm:mt-8 rounded-lg sm:rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden">
                <div className="aspect-video w-full grid place-items-center">
                  {/* Placeholder with logo. Replace with your real video/iframe below. */}
                  <Image src="/images/logo.svg" alt="InvestApp" width={220} height={44} />
                </div>
              </div>
            </div>

            {/* Action row */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full sm:w-auto rounded-full bg-themeSkyBlue hover:bg-themeTeal text-white font-semibold px-6 py-3 sm:px-8 sm:py-4"
              >
                Finish up
              </button>
            </div>

            {/* Optional modal for real video */}
            {showVideo && (
              <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" role="dialog" aria-modal>
                <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                      title="InvestApp Intro"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4 flex justify-end">
                    <button onClick={() => setShowVideo(false)} className="px-4 py-2 rounded bg-themeTeal text-white">Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
