'use client';
// components/marketing/PartnerProgram.tsx
import { MoveRight } from "lucide-react";
import { Button, Heading } from "../ui";

type CTA = { label: string; href: string };
type Stat = { value: string; label: string };

export default function PartnerProgram({
  badge = "Partner Programs",
  title = "Grow Your Business with Invest App",
  description = "Explore a dynamic range of top-performing unlisted stocks-from high-growth startups to established private giants. These are the companies shaping the future-now just a click away.",
  primary = { label: "Apply Now ", href: "/partners/apply" },
  secondary = { label: "Download Partner Kit", href: "/partners/kit" },
  stats = [
    { value: "500+", label: "Active Partners" },
    { value: "₹2.5B+", label: "Assets Under Management" },
    { value: "15%", label: "Average Commission" },
    { value: "24/7", label: "Partner Support" },
  ],
}: {
  badge?: string;
  title?: string;
  description?: string;
  primary?: CTA;
  secondary?: CTA;
  stats?: Stat[];
}) {
  return (
    <section className="py-12 md:py-16">
      <div className="appContainer text-center">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full bg-themeTealLighter px-4 py-1 text-sm font-medium text-themeTealWhite mb-4">
          {badge}
        </div>

        {/* Heading */}
        <div className="max-w-3xl mx-auto">
          <Heading as="h2" className="mb-3">{title}</Heading>
          <p className="text-themeTealLight">{description}</p>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Button text={primary.label} color="themeTeal" variant="outline" size="md" href={primary.href} icon={MoveRight} />
            <Button text={secondary.label} color="themeTeal" variant="solid" size="md" href={secondary.href} />
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-2 gap-6 md:mt-14 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={`${s.value}-${i}`} className="text-center">
              <div className="text-4xl font-bold text-themeTeal mb-2">
                {s.value}
              </div>
              <div className="text-sm text-themeTealLight">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
