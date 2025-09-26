"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button, Heading } from "@/components/ui";
import { HeroPhoneCarousel } from "../subcomponents";
import { StockCarouselCard } from "@/components/ui/StockCarouselCard";

interface BannerStock {
  id: number;
  company_name: string;
  logo: string;
  price_per_share: number;
  percentage_change: number;
  valuation: string;
}

export function HeroSection() {
  const [bannerStocks, setBannerStocks] = useState<BannerStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBannerStocks();
  }, []);

  const fetchBannerStocks = async () => {
    try {
      const response = await fetch('/api/stocks/banner-display');
      const data = await response.json();
      
      if (data.success) {
        setBannerStocks(data.data.stocks);
      } else {
        console.error('API Error:', data.message);
        // Fallback: show empty state
        setBannerStocks([]);
      }
    } catch (error) {
      console.error('Error fetching banner stocks:', error);
      // Fallback: show empty state
      setBannerStocks([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform stocks to carousel slides
  const carouselSlides = bannerStocks.map(stock => ({
    component: <StockCarouselCard key={stock.id} stock={stock} />,
    alt: `${stock.company_name} Stock`
  }));

  // Fallback to static images if no banner stocks
  const fallbackSlides = [
    { src: "/images/slide1.webp", alt: "Chart 1" },
    { src: "/images/slide2.webp", alt: "Chart 2" },
  ];
  return (
    <section className="bg-brandGradient overflow-hidden relative">
      <div className="appContainer flex flex-col md:flex-row items-center gap-10 lg:grid-cols-12 py-16">
        <div className="flex-1 text-center md:text-left">
          <Heading as="h6" base="font-sans" className="mb-3">Unlisted Shares, Made Simple. Made Secure.</Heading>
          <Heading as="h1" className="mb-4">Invest in Tomorrow’s IPOs, Today</Heading>
          <p className="text-themeTealLight">Invest in pre-IPO opportunities with verified data, transparent pricing, and a secure ecosystem designed for both seasoned and first-time investors.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start">
            <Button text="Sell Shares" color="themeTeal" variant="outline" size="md" href='/contact' />
            <Button text="Invest Now" color="themeTeal" variant="solid" size="md" href='/invest' />
          </div>
        </div>
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
      </div>
      <HeroPhoneCarousel />
    </section>
  )
}
