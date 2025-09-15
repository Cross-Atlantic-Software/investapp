"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import SocialIcons, { SocialItem } from "./socialIcons";
import { Heading } from "../ui";

export type ContactInfoProps = {
  heading?: string;
  blurb?: string;
  email?: string;
  phone?: string;
  location?: string;
  socials?: SocialItem[];
  className?: string;
};

export default function ContactInfo({
  heading = "Get in Touch",
  blurb = "If you have any questions, or need help, feel free to reach out to us. We usually respond within 24–48 business hours.",
  email = "support@investapp.com",
  phone = "(+91) 999 99 99999",
  location = "New Delhi, India",
  socials,
  className = "",
}: ContactInfoProps) {
  return (
    <aside className={["space-y-6", className].join(" ")}>
      <div>
        <Heading as="h4" className="font-semibold">{heading}</Heading>
        <p className="mt-2 text-sm leading-6 text-themeTealLight">{blurb}</p>
      </div>

      <ul className="space-y-4">
        <InfoRow
          icon={<Mail className="h-6 w-6 text-themeTeal" />}
          title="Email Address"
          line={email}
        />
        <InfoRow
          icon={<Phone className="h-6 w-6 text-themeTeal" />}
          title="Call us"
          line={phone}
        />
        <InfoRow
          icon={<MapPin className="h-6 w-6 text-themeTeal" />}
          title="Our Location"
          line={location}
        />
      </ul>

      <div>
        <p className="mb-3 text-md font-semibold text-themeTeal">
          Stay connected and get the latest updates
        </p>
        <SocialIcons items={socials} />
      </div>
    </aside>
  );
}

/* --- small helper --- */
function InfoRow({
  icon,
  title,
  line,
}: {
  icon: React.ReactNode;
  title: string;
  line: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-16 w-16 place-items-center rounded bg-themeTealWhite">
        {icon}
      </span>
      <div>
        <div className="text-lg font-semibold text-themeTeal">{title}</div>
        <div className="text-sm text-themeTealLight">{line}</div>
      </div>
    </li>
  );
}
