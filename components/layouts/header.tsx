"use client"

import { Button, Logo, Navigation, type MenuItem } from "@/components/ui"

const items: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Invest", href: "/invest" },
  {
    label: "Market Insights",
    children: [
      { label: "Reports", href: "/market-insights/reports" },
      { label: "News", href: "/market-insights/news" },
    ],
  },
  { label: "Knowledge Center", href: "/knowledge-center" },
  { label: "Partner Program", href: "/partner-program" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
        <Logo href="/"/>
        <Navigation items={items} />
        <div className="hidden lg:flex space-x-4">
          <Button text="Sign In" color="themeTeal" variant="outline" size="sm" href='/' />
          <Button text="Get Started" color="themeTeal" variant="solid" size="sm" href='/' />
        </div>
    </header>
  )
}
