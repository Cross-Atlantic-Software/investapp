// components/PageTitle.tsx

"use client";

import { Heading } from "@/components/ui";
import Link from "next/link";

type PageTitleProps = {
  heading: string;
  description: string;
  linkText?: string;
  linkHref?: string;
};

export default function PageTitle({
  heading,
  description,
  linkText,
  linkHref,
}: PageTitleProps) {
  return (
    <section className="bg-themeTealWhite py-8">
        <div className="text-center">
            <Heading as="h2" className="text-themeTeal mb-3">{heading}</Heading>
            <p className="text-themeTealLighter">{description} {linkText && linkHref && ( <Link href={linkHref} className="text-themeSkyBlue hover:text-themeTeal transition duration-500"> {linkText}</Link>)}</p>
        </div>
    </section>
  );
}
