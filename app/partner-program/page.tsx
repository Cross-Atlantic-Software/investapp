'use client';
import { PartnerCta, PartnerPrograms } from "@/components/containers";
import { ContactInfoBox, WhyBox } from "@/components/subcomponents";
import Breadcrumbs, { type Crumb } from "@/components/subcomponents/breadcrumbs";
import { Heading } from "@/components/ui";
import { Award, Crosshair, FileText, Handshake, IndianRupee, Mail, Phone, Users } from "lucide-react";
import PricingWhy, { type PlanItem } from "@/components/subcomponents/pricingPlans";
import HowItWorks, { type HowStep } from "@/components/subcomponents/howItWorks";

const PLANS: PlanItem[] = [
  {
    id: "ref",
    badge: "Referral Partner",
    title: "Individual Advisors",
    subtitle: "Perfect for Independent financial advisors",
    rate: "5–8%",
    bullets: ["Basic training materials", "Email support", "Monthly reporting", "Standard marketing kit"],
    ctaLabel: "Get Started",
    variant: "outline",
  },
  {
    id: "ria",
    floatingBadge: "Most Popular",
    badge: "Strategic Partner",
    badgeEmphasis: "highlight",            // <<< makes the badge pop
    title: "RIA Firms",
    subtitle: "Ideal for registered investment advisory firms",
    rate: "10–12%",
    bullets: [
      "Advanced training & certification",
      "Dedicated partner manager",
      "Custom marketing materials",
      "Priority deal access",
      "Quarterly business reviews",
    ],
    ctaLabel: "Get Started",
    variant: "primary",
  },
  {
    id: "inst",
    badge: "Institutional Partner",
    title: "Large Institutions",
    subtitle: "For banks, broker-dealers, and large firms",
    rate: "12–15%",
    bullets: [
      "White-label solutions",
      "API integration",
      "Custom reporting",
      "Exclusive deal flow",
      "Executive relationship manager",
    ],
    ctaLabel: "Contact Sales",
    variant: "outline",
  },
];

const STEPS: HowStep[] =[
    {
    id: "apply",
    title: "Apply",
    body: "Submit your application with required documentation and credentials",
    icon: FileText,
  },
  {
    id: "certified",
    title: "Get Certified",
    body: "Complete our training program and certification process",
    icon: Award,
  },
  {
    id: "refer",
    title: "Start Referring",
    body: "Begin introducing clients to our investment opportunities",
    icon: Handshake,
  },
  {
    id: "earn",
    title: "Earn Commissions",
    body: "Receive monthly commission payments for successful investments",
    icon: IndianRupee,
  },
]

export default function PartnerProgram() {
    const crumbs: Crumb[] = [
        { label: "Home", href: "/" },
        { label: "Partner Program" }
    ];

    return (
    <>
        <div className="px-6 py-3 bg-themeTealWhite">
            <Breadcrumbs items={crumbs} />
        </div>
        <section className="appContainer">
            <PartnerPrograms />
            <div className="py-16">
                <div className="max-w-3xl mx-auto text-center mb-10">
                <Heading as="h2" className="mb-3">Why Partner with Invest App?</Heading>
                <p className="text-themeTealLight">Explore a dynamic range of top-performing unlisted stocks-from high-growth startups to established private giants. These are the companies shaping the future-now just a click away.</p>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <WhyBox
                        title="Competitive Commissions"
                        description="Earn up to 15% commission on all successful investments with transparent fee structures."
                        bullets={["Tiered commission structure", "Monthly payouts", "Performance bonuses"]}
                        icon={IndianRupee}
                    />
                    <WhyBox
                        title="Comprehensive Support"
                        description="Get dedicated support, training materials, and marketing resources to succeed."
                        bullets={["Dedicated partner manager", "Training & certification", "Marketing materials"]}
                        icon={Crosshair}
                    />
                    <WhyBox
                        title="Exclusive Access"
                        description="Offer your clients access to vetted alternative investment opportunities."
                        bullets={["Pre-vetted opportunities", "Early access to deals", "Institutional-grade investments"]}
                        icon={Crosshair}
                    />
                </div>
            </div>
        </section>
        <section className="bg-themeTealWhite">
            <div className="py-16 appContainer">
                <div className="max-w-3xl mx-auto text-center mb-10">
                <Heading as="h3" className="mb-3">Partner Ties</Heading>
                <p className="text-themeTealLight">Explore a dynamic range of top-performing unlisted stocks-from high-growth startups to established private giants. These are the companies shaping the future-now just a click away.</p>
                </div>
                <PricingWhy items={PLANS}/>
            </div>
        </section>
        <div className="py-16 appContainer">
            <div className="max-w-3xl mx-auto text-center mb-10">
            <Heading as="h3" className="mb-3">How it Works?</Heading>
            <p className="text-themeTealLight">Explore a dynamic range of top-performing unlisted stocks-from high-growth startups to established private giants. These are the companies shaping the future-now just a click away.</p>
            </div>
            <HowItWorks items={STEPS} />
        </div>
        <PartnerCta primary={{ label: "Apply Now", href: "/partners/apply" }} secondary={{ label: "Download Partner Kit", href: "/partners/kit.pdf" }}/>
        <div className="py-16 appContainer">
            <div className="max-w-3xl mx-auto text-center mb-10">
            <Heading as="h3" className="mb-3">Get in Touch</Heading>
            <p className="text-themeTealLight">Here questions about our partner program? We’re here to help</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
                <ContactInfoBox
                    icon={Phone}
                    title="Phone"
                    lines={[
                    "(+91) 999 88 99999, 999 88 99999",
                    "Mon–Fri 9AM–6PM IST",
                    ]}
                    cta={{ label: "Call Us", href: "tel:+919998899999", variant: "outline" }}
                />

                <ContactInfoBox
                    icon={Mail}
                    title="Email"
                    lines={["partner@investapp.com", "Response within 24 hours"]}
                    cta={{ label: "Write to Us", href: "mailto:partner@investapp.com", variant: "outline" }}
                />

                <ContactInfoBox
                    icon={Users}
                    title="Partner Portal"
                    lines={["Access resources & support"]}
                    cta={{ label: "Login to Portal", href: "#", variant: "outline" }}
                />
                </div>
        </div>

    </>
  );
}
