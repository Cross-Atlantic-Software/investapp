"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
import { Heading } from "@/components/ui";

// Swiper core
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export type RelatedItem = {
  slug: string;
  title: string;
  dateISO: string;   // YYYY-MM-DD
  hero: string;
  type: "Guide" | "Article";
};

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});
const fmt = (iso: string) => DATE.format(new Date(`${iso}T00:00:00Z`));

export default function RelatedCarousel({ items }: { items: RelatedItem[] }) {
  const unique = useMemo(() => {
    const m = new Map<string, RelatedItem>();
    for (const it of items) if (!m.has(it.slug)) m.set(it.slug, it);
    return Array.from(m.values());
  }, [items]);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <Heading as="h4" className="font-semibold">Related articles</Heading>
        <div className="flex gap-2">
          <button ref={prevRef} aria-label="Prev"
            className="rounded border border-themeTealLighter text-themeTeal w-10 h-10 hover:bg-themeTeal hover:text-themeTealWhite cursor-pointer transition duration-500 flex items-center justify-center"><ArrowLeft /></button>
          <button ref={nextRef} aria-label="Next"
            className="rounded border border-themeTealLighter text-themeTeal w-10 h-10 hover:bg-themeTeal hover:text-themeTealWhite cursor-pointer transition duration-500 flex items-center justify-center"><ArrowRight /></button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={16}
        slidesPerView={1.1}
        breakpoints={{ 640:{slidesPerView:2}, 1024:{slidesPerView:3}, 1280:{slidesPerView:4} }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(s) => {
          // attach refs after mount
          // @ts-expect-error Swiper types
          s.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error Swiper types
          s.params.navigation.nextEl = nextRef.current;
          s.navigation.init();
          s.navigation.update();
        }}
      >
        {unique.map(it => (
          <SwiperSlide key={it.slug}>
            <Link href={`/knowledge-center/${it.slug}`} className="group block overflow-hidden rounded border border-themeTealLighter">
              <div className="aspect-[16/9] overflow-hidden">
                <Image src={it.hero} alt={it.title} width={1200} height={600}
                  className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-themeTealLighter">
                  <BookOpenText className="h-3.5 w-3.5" /><span>{it.type}</span>
                </div>
                <div className="mt-1 line-clamp-2 font-medium text-themeTeal group-hover:text-themeSkyBlue transition duration-500">{it.title}</div>
                <div className="mt-1 text-xs text-themeTealLighter">{fmt(it.dateISO)}</div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
