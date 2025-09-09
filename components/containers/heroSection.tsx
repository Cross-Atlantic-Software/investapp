"use client";

import Image from "next/image";
import { Button, Heading, PhoneCarousel } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="bg-brandGradient overflow-hidden">
      <div className="appContainer flex flex-col md:flex-row items-center gap-10 lg:grid-cols-12 py-16">
        <div className="flex-1 text-center md:text-left">
          <Heading as="h6" base="font-sans" className="mb-3">Sign in to your Secure Wallet!</Heading>
          <Heading as="h1" className="mb-4">Private Markets, Reimagined. Invest in everything</Heading>
          <p className="text-themeTealLight">InvestApp’s market data and price discovery tools enable institutional investors, shareholders, and brokers to trade the pre-IPO asset class with more confidence.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start">
            <Button text="Sell Shares" color="themeTeal" variant="outline" size="md" href='/' />
            <Button text="Invest Now" color="themeTeal" variant="solid" size="md" href='/' />
          </div>
        </div>
        <div className="flex-1 relative">
          <div>
            <div className="w-full max-w-screen-md">
              <Image
                src="/images/hero.webp"
                alt="Hero"
                width={1887}
                height={1079}
                className="scale-125"
              />
            </div>
          </div>
          <div className="absolute xl:-right-20 -right-20 -bottom-30 w-40 lg:w-50 xl:w-60 hidden lg:block">
            <PhoneCarousel
              slides={[
                { src: "/images/slide1.webp", alt: "Chart 1" },
                { src: "/images/slide2.webp", alt: "Chart 2" },
              ]}
              // fine-tune these 4 numbers until the slides sit perfectly in your frame
              insetTopPct={7}
              insetRightPct={4.5}
              insetBottomPct={8}
              insetLeftPct={4.5}
              radiusPx={22}
            />

          </div>
        </div>
      </div>
    </section>
  )
}
