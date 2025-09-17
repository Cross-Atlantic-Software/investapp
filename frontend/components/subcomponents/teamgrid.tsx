// components/about/TeamGrid.tsx
"use client";

import Image from "next/image";
import { Linkedin } from "lucide-react";
import { Heading } from "../ui";

export type TeamMember = {
  id?: string;
  name: string;
  role: string;
  img: string;
  alt?: string;
  linkedin?: string;
};

export default function TeamGrid({
  items,
  className = "",
}: {
  items: TeamMember[];
  heading?: string;
  className?: string;
}) {
  return (
    <section className={className}>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m, i) => (
          <article
            key={m.id ?? `${m.name}-${i}`}
            className="overflow-hidden rounded"
          >
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={m.img}
                alt={m.alt ?? m.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 25vw"
                priority={i < 2}
              />
              
            </div>

            <div className="flex items-center justify-between py-2 text-left">
                <div>
                    <Heading as="h5" className="font-semibold">{m.name}</Heading>
                    <div className="text-sm text-themeTealLight">{m.role}</div>
                </div>
                <div>
                    {m.linkedin && (
                        <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${m.name}'s LinkedIn`}
                        className="grid h-10 w-10 place-items-center rounded bg-themeTeal text-white hover:bg-themeSkyBlue transition duration-500"
                        >
                        <Linkedin className="h-5 w-5" />
                        </a>
                    )}
                </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
