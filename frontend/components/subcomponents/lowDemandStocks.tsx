"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";
import { ArrowDown, TrendingDown } from "lucide-react";
import "swiper/css";

type Share = {
  id: string;
  name: string;
  logo: string;        // /public path or remote (allow in next.config.js)
  changeINR: string;
  changePct: string;   // like "66% ↑"
  price: string;
  valuation: string;
};

type Props = {
  title?: string;
  items: Share[];
  autoplayMs?: number;
};

function Logo({ name, src }: { name: string; src: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-gray-600">
        {name.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  return (
    <div>
      <Image
        src={src.startsWith("/") ? src : `/${src.replace(/^\/+/, "")}`}
        alt={`${name} logo`}
        width={100}
        height={50}
        className="object-contain"
        onError={() => setErr(true)}
      />
    </div>
  );
}

export default function LowDemandStocks({
  title = "Low Demand Stocks",
  items,
  autoplayMs = 5000,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!items?.length) return null;

  return (
    <section>
      <div>
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-themeTeal">
            <TrendingDown className="stroke-themeTealLighter" />
            {title}
          </h3>
          <span className="rounded-full bg-themeTealLighter px-2 py-0.5 text-xs text-themeTealWhite">
            {items.length} Stocks
          </span>
        </div>

        {/* Carousel */}
        {mounted && (
          <Swiper
            modules={[Autoplay, A11y]}
            autoplay={{ delay: autoplayMs, disableOnInteraction: false }}
            slidesPerView={1.05}
            spaceBetween={12}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 2.5, spaceBetween: 18 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 22 },
            }}
          >
            {items.map((s, i) => (
              <SwiperSlide key={`${s.id}-${i}`} className="h-auto">
                <article className="h-full rounded-md border border-themeTealLighter bg-brandGradient p-5">
                  {/* Top */}
                  <div className="mb-5 flex items-center gap-3">
                    <Logo name={s.name} src={s.logo} />
                    <p className="font-semibold text-themeTeal">{s.name}</p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-left text-sm">
                    <div>
                      <p className="text-themeTealLighter">₹ Change</p>
                      <p className="flex items-center gap-1 font-semibold text-red-800">
                        {s.changeINR} <TrendingDown className="h-3.5 w-3.5" />
                      </p>
                    </div>
                    <div>
                      <p className="text-themeTealLighter">% Change</p>
                      <p className="font-semibold text-red-800 flex gap-1 items-center">{s.changePct}% <ArrowDown size={16} /></p>
                    </div>
                    <div>
                      <p className="text-themeTealLighter">Price Per Share</p>
                      <p className="font-semibold text-themeTeal">{s.price}</p>
                    </div>
                    <div>
                      <p className="text-themeTealLighter">Valuation</p>
                      <p className="font-semibold text-themeTeal">{s.valuation}</p>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
