// components/subcomponents/galleryCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import type React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, A11y, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type GalleryImage = { src: string; alt?: string };

export default function GalleryCarousel({
  images,
}: {
  images: GalleryImage[];
  heading?: string;
}) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // lock scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  // Typed CSS var styles (avoid ts-ignore)
  const thumbStyles: React.CSSProperties & Record<string, string> = {
    "--swiper-pagination-color": "#0B4B62",
    paddingBottom: "40px",
  };
  const lightboxStyles: React.CSSProperties & Record<string, string> = {
    "--swiper-navigation-color": "#ffffff",
  };

  return (
    <section>
      {/* Thumbnails */}
      <div className="relative">
        <Swiper
          modules={[Pagination, A11y]}
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          pagination={{ clickable: true }}
          style={thumbStyles}
        >
          {images.map((img, i) => (
            <SwiperSlide key={`${img.src}-${i}`}>
              <button
                type="button"
                onClick={() => openAt(i)}
                className="group relative block aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100"
              >
                <Image
                  src={img.src}
                  alt={img.alt ?? `Gallery image ${i + 1}`}
                  fill
                  sizes="(max-width:768px) 90vw, (max-width:1280px) 45vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  priority={i < 2}
                />
                <span className="pointer-events-none absolute inset-0 border-2 border-transparent transition group-hover:border-white/60" />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 grid place-items-center p-3">
            <div className="relative w-full max-w-6xl">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute -top-10 right-0 z-10 rounded bg-themeTealWhite p-2 text-themeTeal hover:bg-themeTealLighter hover:text-themeTealWhite transition duration-500 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>

              <Swiper
                modules={[Navigation, Keyboard, A11y, Pagination]}
                initialSlide={idx}
                onSlideChange={(s) => setIdx(s.activeIndex)}
                navigation
                keyboard={{ enabled: true }}
                pagination={{ clickable: true }}
                style={lightboxStyles}
              >
                {images.map((img, i) => (
                  <SwiperSlide key={`full-${img.src}-${i}`}>
                    <div className="relative mx-auto aspect-[16/10] w-full max-h-[80vh]">
                      <Image
                        src={img.src}
                        alt={img.alt ?? `Image ${i + 1}`}
                        fill
                        sizes="100vw"
                        className="object-contain rounded"
                        priority={i === idx}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
