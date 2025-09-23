"use client";

import Image from "next/image";
import { Button, Heading } from "@/components/ui";
import { ChevronRight } from "lucide-react";

type Props = {
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export function InvestappPrice({
  eyebrow = "INVESTAPP PRICE",
  title = "Invest with Clarity. Exit with Confidence.",
  description = "Unlike traditional platforms, we’re built on transparency and execution certainty—helping you trade smarter, faster, and safer.",
  ctaLabel = "Learn more",
  ctaHref = "/contact",
  imageSrc = "/images/investapp-price-hero.webp", // export your composite graphic
  imageAlt = "Private market pricing visualization",
}: Props) {
  return (
    <section className="bg-themeTeal text-themeTealWhite">
      <div className="appContainer flex flex-col md:flex-row items-center justify-between gap-10 py-16">
        {/* Copy */}
        <div className="max-w-xl text-center md:text-left">
          <p className="mb-3 text-sm tracking-wide uppercase text-themeTealWhite">{eyebrow}</p>
          <Heading as="h2" className="mb-4 text-themeTealWhite">
            {title}
          </Heading>
          <p className="mb-6 text-themeTealWhite">
            {description}
          </p>
          
          <Button text={ctaLabel} color="skyblue" variant="link" size="nospace" href={ctaHref} icon={ChevronRight} />
        </div>

        {/* Visual */}
        <div className="relative w-full aspect-[16/10]">
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            priority
            className="object-contain"
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 560px, 720px"
          />
        </div>
      </div>
    </section>
  );
}
