"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type Variant = "solid" | "outline" | "link";
type Size = "sm" | "md" | "nospace" | "nospacesm";
type Tone = "themeTeal" | "skyblue";
type IconPosition = "left" | "right";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string;
  variant?: Variant;
  size?: Size;
  color?: Tone;
  href?: string;           // renders <Link> when provided
  className?: string;
  icon?: LucideIcon; // add Lucide icon component here
  iconPosition?: IconPosition;
};

const base =
  "inline-flex items-center justify-center font-medium transition duration-300 " +
  "rounded-xs";

const sizes: Record<Size, string> = {
  sm: "px-5 py-3 text-sm",
  md: "px-10 py-3 text-base",
  nospace: "text-lg",
  nospacesm: "text-md",
};

const solid: Record<Tone, string> = {
  themeTeal: "bg-themeTeal text-themeTealWhite hover:bg-themeTealWhite hover:text-themeTeal border border-themeTeal",
  skyblue: "bg-themeSkyBlue text-themeTealWhite hover:bg-themeTealLight",
};

const outline: Record<Tone, string> = {
  themeTeal:
    "border border-themeTeal text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite",
  skyblue:
    "border border-themeSkyBlue text-themeSkyBlue hover:bg-themeSkyBlue hover:text-themeTealWhite",
};

const link: Record<Tone, string> = {
  themeTeal: "text-themeTeal hover:text-themeTealLight flex items-center",
  skyblue: "text-themeSkyBlue hover:text-themeTealLighter flex items-center",
};

export default function Button({
  text,
  children,
  variant = "solid",
  size = "md",
  color = "themeTeal",
  href,
  className = "",
  icon: Icon,
  iconPosition = "right",
  ...rest
}: Props) {
  let palette: string;
  if (variant === "solid") palette = solid[color];
  else if (variant === "outline") palette = outline[color];
  else palette = link[color];

  const classes = `${base} ${sizes[size]} ${palette} ${className}`.trim();

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon className="w-6 h-6" />}
      {text ?? children}
      {Icon && iconPosition === "right" && <Icon className="w-6 h-6" />}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={typeof text === "string" ? text : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}