// components/marketing/PartnerCta.tsx
"use client";
import { MoveRight } from "lucide-react";
import { Button, Heading } from "../ui";

type Btn = { label: string; href?: string; onClick?: () => void };

export default function PartnerCta({
  title = "Ready to Become a Partner?",
  subtitle = "Join hundreds of successful partners who are growing their business with alternative investments.",
  primary = { label: "Apply Now", href: "#" },
  secondary = { label: "Download Partner Kit", href: "#" },
  className = "",
}: {
  title?: string;
  subtitle?: string;
  primary?: Btn;
  secondary?: Btn;
  className?: string;
}) {

  return (
    <section className={`bg-themeSkyBlue py-12 md:py-20 ${className}`}>
      <div className="appContainer text-center text-white">
            <Heading as="h3" className="mb-3 text-themeTealWhite">{title}</Heading>
            <p className="text-themeTealWhite">{subtitle}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button text={primary.label} color="themeTealWhite" variant="outline" size="md" href={primary.href} icon={MoveRight} />
            <Button text={secondary.label} color="themeTealWhite" variant="solid" size="md" href={secondary.href} />
        </div>
      </div>
    </section>
  );
}
