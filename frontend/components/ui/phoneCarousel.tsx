"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";
import "swiper/css";

type Slide = { 
  src?: string; 
  alt?: string; 
  component?: React.ReactNode;
};

type Props = {
  slides: Slide[];
  frameSrc?: string;      // phone mock frame
  // tweak these to match your frame screen cutout
  insetTopPct?: number;   // % from top
  insetRightPct?: number; // % from right
  insetBottomPct?: number;// % from bottom
  insetLeftPct?: number;  // % from left
  radiusPx?: number;      // screen corner radius
};

export default function PhoneCarousel({
  slides,
  insetTopPct = 7,      // adjust if needed
  insetRightPct = 4.5,
  insetBottomPct = 8,
  insetLeftPct = 4.5,
  radiusPx = 22,
}: Props) {
  return (
    <div className="relative w-full aspect-[9/19]">
      {/* Exact Figma-style phone frame */}
      <div className="absolute inset-0 bg-white rounded-[4rem] shadow-xl">
        {/* Thin notch like Figma */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-gray-200 rounded-full"></div>
        {/* Thin home indicator like Figma */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gray-200 rounded-full"></div>
      </div>

      {/* screen area clipped inside the frame */}
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          top: `${insetTopPct}%`,
          right: `${insetRightPct}%`,
          bottom: `${insetBottomPct}%`,
          left: `${insetLeftPct}%`,
          borderRadius: `${radiusPx}px`,
        }}
      >
        <Swiper
          modules={[Autoplay, A11y]}
          slidesPerView={1}
          autoplay={{ 
            delay: 3000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: false
          }}
          loop={true}
          className="h-full w-full"
        >
          {slides.map((s, i) => (
            <SwiperSlide key={i} className="h-full">
              <div className="relative h-full w-full">
                {s.component ? (
                  <div className="h-full w-full p-2">
                    {s.component}
                  </div>
                ) : (
                  <Image
                    src={s.src!}
                    alt={s.alt ?? ""}
                    fill
                    sizes="(max-width: 1024px) 160px, (max-width: 1280px) 240px, 288px"
                    className="object-cover"
                    priority={i === 0}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
