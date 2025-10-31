"use client"

import { Button, Logo, Navigation, type MenuItem } from "@/components/ui"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Top navigation: Home/About/Contact and My Portfolio (when logged in)
  const topNavItems: MenuItem[] = isAuthenticated
    ? [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "My Portfolio", href: "/dashboard" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ];

  // Main navigation: core app menus; hide Home here
  const mainNavItems: MenuItem[] = [
    { label: "Invest", href: "/invest" },
    { label: "Market Insights", href: "/market-insights" },
    { label: "Knowledge Center", href: "/knowledge-center" },
  ];

  return (
    <header className="w-full border-b border-gray-200">
      {/* Two-column layout: Logo | (Upper nav + Main nav) */}
      <div className="appContainer grid grid-cols-[20%_80%] items-center py-3 gap-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Logo href={isAuthenticated ? "/invest" : "/"} />
        </div>

        {/* Right: upper nav (small) + main nav stacked */}
        <div className="hidden md:flex flex-col gap-2">
          {/* Upper nav + auth */}
          <div className="flex items-center justify-end gap-3 text-xs">
            <Navigation items={topNavItems} />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-themeTeal">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-themeTeal text-white">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-themeTeal">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-themeTealLighter">{user?.email}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-themeTealLighter hover:text-themeTeal transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button text="Sign In" color="themeTeal" variant="outline" size="sm" href='/login' />
            )}
          </div>

          {/* Main nav */}
          <div className="flex items-center">
            <Navigation items={mainNavItems} />
          </div>
        </div>
      </div>
    </header>
  )
}
