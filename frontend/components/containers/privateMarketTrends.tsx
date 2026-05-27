"use client";

import Image from "next/image";
import { Button, Heading } from "@/components/ui";
import { ChevronRight } from "lucide-react";

type SideItem = {
  title: string;
  desc: string;
  href: string;
  thumbSrc: string;
  thumbAlt?: string;
};

type Props = {
  heading?: string;
  description?:string;
  feature?: {
    overlayText: string;
    imageSrc: string;
    imageAlt?: string;
    title: string;
    desc: string;
    href: string;
  };
  rightItems?: SideItem[]; // was [SideItem, SideItem]
};

export default function PrivateMarketTrends({
  heading = "Stay Ahead with Private Market Intelligence",
  description ="From IPO calendars to sector deep dives, access curated insights, proprietary data, and investor resources, all designed to give you an edge.",
  feature = {
    overlayText: "Tech IPO Calendar 2025",
    imageSrc: "/images/news1.webp",
    title: "Tech IPO calendar",
    desc:
      "Praesent id dignissim magna. Aliquam malesuada nisi ac tellus tempus, vel imperdiet erat accumsan.",
    href: "#",
  },
  rightItems = [
    {
      title: "Private market updates",
      desc:
        "Access proprietary data, trends and insights that aren’t available anywhere else.",
      href: "#",
      thumbSrc: "/images/news2.webp",
    },
    {
      title: "Private market education",
      desc: "Explore our expansive hub for news and knowledge.",
      href: "#",
      thumbSrc: "/images/news3.webp",
    },
    {
      title: "Sector deep dives",
      desc: "Long-form research and scorecards across categories.",
      href: "#",
      thumbSrc: "/images/news1.webp",
    },
    
  ],
}: Props) {
  return (
    <section>
      <div className="appContainer py-12 md:py-16">
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <Heading as="h2" className="text-themeTeal mb-3">{heading}</Heading>
          <p className="mb-5 text-themeTealLight">{description}</p>
        </div>

        {/* 1/2 | 1/2 on md+, stacked on mobile */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left feature */}
          <div>
            <div className="relative w-full overflow-hidden rounded-md">
              <div className="relative w-full h-60 sm:h-48 lg:h-60">
                <Image
                  src={feature.imageSrc}
                  alt={feature.imageAlt ?? feature.overlayText}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="mb-1 text-lg font-semibold text-themeTeal">{feature.title}</h3>
              <p className="mb-3 text-themeTealLight">{feature.desc}</p>
              <Button text='View Calendar' color="skyblue" variant="link" size="nospace" href='/' icon={ChevronRight} />
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col divide-y divide-slate-200">
            {rightItems.map((it, idx) => (
              <div key={idx} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <h4 className="mb-1 text-base font-semibold text-themeTeal">{it.title}</h4>
                  <p className="mb-2 text-sm text-themeTealLight">{it.desc}</p>
                  <Button text={idx === 0 ? "Read Reports" : "Learn More"} color="skyblue" variant="link" size="nospacesm" href='/' icon={ChevronRight} />
                </div>
                <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded sm:block">
                  <Image
                    src={it.thumbSrc}
                    alt={it.thumbAlt ?? it.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
