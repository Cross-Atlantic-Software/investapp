"use client";

import { Button } from "@/components/ui";
import Image from "next/image";

export type NewsItem = {
  id: string;
  title: string;
  date: string;        // e.g. "Apr 28, 2025"
  href: string;
  imgSrc: string;      // public path
  imgAlt?: string;
};

export default function NewsSection({
  items = DEMO_ITEMS,
}: {
  heading?: string;
  info?: string;
  viewAllHref?: string;
  items?: NewsItem[];
}) {
  return (
    <section className="space-y-4">

      {/* cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((n) => (
          <article
            key={n.id}
            className="rounded bg-white"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md">
              <Image
                src={n.imgSrc}
                alt={n.imgAlt ?? n.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                priority={false}
              />
            </div>

            <h4 className="text-md font-semibold leading-snug text-themeTeal p-4">
              {n.title}
            </h4>

            <div className="flex items-center px-4 justify-between p-4">
              <time className="text-themeTealLighter text-sm">{n.date}</time>
              <Button text='View Details' color="skyblue" variant="solid" size="sm" href={n.href} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* demo data */
const DEMO_ITEMS: NewsItem[] = [
  {
    id: "n1",
    title: "Q1 2025 Secondary Market Update",
    date: "Apr 28, 2025",
    href: "#",
    imgSrc: "/images/news1.webp",
  },
  {
    id: "n2",
    title:
      "How Will the Tariff Sell-Off Hit Your Private Company Portfolio",
    date: "Apr 7, 2025",
    href: "#",
    imgSrc: "/images/news2.webp",
  },
  {
    id: "n3",
    title: "Invest App Tracker: March 2025 update",
    date: "Mar 13, 2025",
    href: "#",
    imgSrc: "/images/news3.webp",
  },
];
