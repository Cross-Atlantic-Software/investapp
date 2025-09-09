// components/ScrollToTop.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop({ threshold = 200 }: { threshold?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      aria-label="Scroll to top"
      onClick={toTop}
      className={`fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-themeSkyBlue text-themeTealWhite hover:bg-themeTealLight focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer transition duration-500 ${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
}
