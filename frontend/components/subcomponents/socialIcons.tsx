"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import type { ComponentType } from "react";

type IconLike = ComponentType<{ className?: string }>;

export type SocialItem = {
  id: string;
  href: string;
  label: string;
  icon?: IconLike;
};

const DEFAULTS: SocialItem[] = [
  { id: "fb", href: "#", label: "Facebook", icon: Facebook },
  { id: "tw", href: "#", label: "Twitter / X", icon: Twitter },
  { id: "in", href: "#", label: "LinkedIn", icon: Linkedin },
  { id: "ig", href: "#", label: "Instagram", icon: Instagram },
  { id: "yt", href: "#", label: "YouTube", icon: Youtube },
];

export default function SocialIcons({
  items = DEFAULTS,
  className = "",
}: {
  items?: SocialItem[];
  className?: string;
}) {
  return (
    <div className={["flex flex-wrap items-center gap-2", className].join(" ")}>
      {items.map((s) => {
        const Icon = s.icon ?? Linkedin;
        return (
          <Link
            key={s.id}
            href={s.href}
            aria-label={s.label}
            className="grid h-12 w-12 place-items-center rounded bg-themeTeal text-themeTealWhite transition hover:bg-themeSkyBlue"
          >
            <Icon className="h-6 w-6" />
          </Link>
        );
      })}
    </div>
  );
}

export type { SocialItem as SocialIconItem };
