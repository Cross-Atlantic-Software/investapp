"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, A11y } from "swiper/modules";
// If CSS-in-component fails in your setup, move these two lines into globals.css instead.
import "swiper/css";
import "swiper/css/pagination";

/**
 * HeroPhoneCarousel
 * - Responsive mobile-phone mockup with a Swiper-powered carousel inside the screen.
 * - Next.js 15 + Tailwind CSS.
 * - Pass `slides` to override demo data.
 */

export type Slide = {
  logo?: string; // logo URL
  title: string;
  highlight?: string; // e.g., HIGH DEMAND
  description?: string;
  price?: string; // e.g., ₹ 290.58 ↑
  changePct?: string; // e.g., 66% ↑
  pps?: string; // Price Per Share
  valuation?: string; // Valuation
};

// API Response Types
interface ApiStock {
  id: number;
  company_name: string;
  logo: string;
  price: string;
  price_change: string;
  teaser: string;
  short_description: string;
  analysis: string;
  demand: string;
  homeDisplay: string;
  bannerDisplay: string;
  valuation: string;
  price_per_share: string;
  percentage_change: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    stocks: ApiStock[];
    totalCount: number;
  };
}

// API fetch function
async function fetchBannerStocks(): Promise<Slide[]> {
  try {
    const response = await fetch('http://localhost:3000/api/stocks/banner-display');
    if (!response.ok) {
      throw new Error('Failed to fetch banner stocks');
    }
    
    const apiData: ApiResponse = await response.json();
    
    if (!apiData.success || !apiData.data.stocks) {
      throw new Error('Invalid API response');
    }
    
    // Map API data to Slide format - only using fields that were already displayed in UI
    return apiData.data.stocks.map((stock: ApiStock): Slide => {
      const priceChange = parseFloat(stock.price_change);
      const percentageChange = parseFloat(stock.percentage_change);
      
      return {
        logo: stock.logo,
        title: stock.company_name,
        highlight: undefined, // Keep undefined since we're not using API demand field
        description: stock.teaser,
        price: `₹ ${stock.price} ${priceChange >= 0 ? '↑' : '↓'}`,
        changePct: `${percentageChange >= 0 ? '+' : ''}${stock.percentage_change}% ${percentageChange >= 0 ? '↑' : '↓'}`,
        pps: `₹ ${stock.price_per_share}`,
        valuation: `₹ ${stock.valuation}B`,
      };
    });
  } catch (error) {
    console.error('Error fetching banner stocks:', error);
    // Return empty array if API fails
    return [];
  }
}

const demoSlides: Slide[] = [
  {
    logo: "/images/logos/tcs.webp",
    title: "TATA Consultancy Services",
    highlight: "HIGH DEMAND",
    description:
      "At Pine Labs, we’re proud of the way our merchant platform makes an impact on our customers’ lives.",
    price: "₹ 290.58 ↑",
    changePct: "66% ↑",
    pps: "₹ 350.92",
    valuation: "₹ 840.52B",
  },
  {
    logo: "/images/logos/airtel.webp",
    title: "Airtel",
    highlight: "TRENDING",
    description: "Global consulting and IT services leader delivering next‑gen solutions.",
    price: "₹ 1,540.20 ↑",
    changePct: "1.8% ↑",
    pps: "₹ 1,540.20",
    valuation: "₹ 6.4T",
  },
  {
    logo: "/images/logos/tata.webp",
    title: "TATA Motors",
    highlight: "WATCHLIST",
    description: "India’s leading private bank with consistent growth and strong fundamentals.",
    price: "₹ 1,647.35 ↓",
    changePct: "-0.6% ↓",
    pps: "₹ 1,647.35",
    valuation: "₹ 12.2T",
  },
];

function Logo({ title, src }: { title: string; src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={`${title} logo`} className="h-16 w-auto mx-auto object-contain" />;
  }
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="h-8 w-8 rounded-md bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
      {initials}
    </div>
  );
}

export default function HeroPhoneCarousel(){
  const [apiSlides, setApiSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBannerStocks = async () => {
      try {
        setLoading(true);
        const fetchedSlides = await fetchBannerStocks();
        setApiSlides(fetchedSlides);
      } catch (error) {
        console.error('Failed to load banner stocks:', error);
        setApiSlides([]);
      } finally {
        setLoading(false);
      }
    };

    loadBannerStocks();
  }, []);

  return (
    <section className="absolute hidden lg:block right-10 bottom-10">
      <div className="">
        <div className="flex justify-center lg:justify-end">
          <PhoneFrame>
            <Swiper
            modules={[Autoplay, Pagination, A11y]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop
            className="h-full
             [--swiper-pagination-color:#0b4b62]
             [--swiper-pagination-bullet-inactive-color:#558191]
             [--swiper-pagination-bullet-inactive-opacity:1]
             [--swiper-pagination-bullet-size:8px]">
              {apiSlides.map((s, i) => (
                <SwiperSlide key={i} className="h-full">
                  <Card slide={s} />
                </SwiperSlide>
              ))}
            </Swiper>
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  /**
   * Responsive device mockup
   * - Uses aspect-ratio wrapper + absolute fill so Swiper always gets height.
   */
  return (
    <div className="relative xl:w-[min(92vw,240px)] w-[min(92vw,220px)]">
      {/* Outer shadowed shell */}
      <div className="relative rounded-[2.2rem] bg-gray-900 p-1 shadow-2xl">
        {/* Inner bezel */}
        <div className="rounded-[1.9rem] bg-black p-1">
          {/* Status notch */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-40 -translate-x-1/2 rounded-b-2xl bg-black" />
          {/* Screen */}
          <div className="relative rounded-[1.5rem] bg-white overflow-hidden">
            {/* Aspect keeper */}
            <div className="relative w-full aspect-[9/18]">
              {/* Safe area fill */}
              <div className="absolute inset-0 pt-6">
                <div className="h-full">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center text-center rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold text-themeTealWhite">
      {label}
    </span>
  );
}

function StatRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-themeTealLight text-xs">{label}</span>
      <span className="text-themeTeal font-semibold text-xs">{value ?? "—"}</span>
    </div>
  );
}

function Card({ slide }: { slide: Slide }) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col p-2">
        {/* Header */}
        <div className="text-center">
          <Logo title={slide.title} src={slide.logo} />
          <div className="min-w-0">
            <p className="text-sm font-medium mb-2 text-themeTeal leading-tight truncate">{slide.title}</p>
            <Pill label={slide.highlight} />
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-xs text-themeTealLighter text-center leading-4">
          {slide.description}
        </p>

        {/* Stats */}
        <div className="mt-4 rounded bg-themeTealWhite p-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <StatRow label="₹ Price" value={slide.price} />
            <StatRow label="% Change" value={slide.changePct} />
            <StatRow label="PPS" value={slide.pps} />
            <StatRow label="Valuation" value={slide.valuation} />
          </div>
        </div>

        <div className="flex-1" />
      </div>
    </div>
  );
}
