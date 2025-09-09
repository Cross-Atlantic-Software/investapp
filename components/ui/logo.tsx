"use client"

import Image from "next/image"
import Link from "next/link"

type Props = {
  src?: string          // defaults to /logo.svg
  alt?: string          // defaults to "Logo"
  href?: string         // wrap in <Link> if provided
  width?: number        // default 140
  height?: number       // default 40
  className?: string
  priority?: boolean
}

export default function Logo({
  src = "/images/logo.svg",
  alt = "Logo",
  href,
  width = 140,
  height = 40,
  className,
  priority,
}: Props) {
  const img = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ width: "auto", height: "auto" }}
    />
  )
  return href ? <Link href={href} aria-label={alt}>{img}</Link> : img
}
