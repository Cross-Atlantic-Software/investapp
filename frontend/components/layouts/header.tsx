"use client"

import { Button, Logo, Navigation, type MenuItem } from "@/components/ui"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleUserClick = () => {
    router.push('/dashboard/settings')
  }

  // Top navigation: Home/About/Contact (when logged in, hide Home)
  const topNavItems: MenuItem[] = isAuthenticated
    ? [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ];

  // Main navigation: core app menus; include My Portfolio when logged in
  const mainNavItems: MenuItem[] = [
    { label: "Invest", href: "/invest" },
    { label: "Market Insights", href: "/market-insights" },
    { label: "Knowledge Center", href: "/knowledge-center" },
    ...(isAuthenticated ? [{ label: "My Portfolio", href: "/dashboard" }] : []),
  ];

  const isActive = (href?: string) => {
    if (!href || !pathname) return false
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }

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
          <div className="flex items-center justify-end gap-4 pt-2">
            {/* Top nav items - manually rendered to control font weight */}
            <nav>
              <ul className="flex items-center gap-3 xl:gap-4">
                {topNavItems.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={item.href ?? "#"}
                      className={`font-medium text-sm transition duration-300 ${
                        isActive(item.href)
                          ? "text-themeSkyBlue"
                          : "text-themeTeal hover:text-themeSkyBlue"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUserClick}
                  className="flex items-center gap-2 text-themeTeal hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-themeTeal text-white flex-shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-themeTeal leading-tight">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    {/* <span className="text-xs text-themeTealLighter">{user?.email}</span> */}
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-themeTealLighter hover:text-themeTeal transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button text="Sign In" color="themeTeal" variant="outline" size="sm" href='/login' className="px-2 py-1 text-xs" />
            )}
          </div>

          {/* Main nav */}
          <div className="flex items-center px-2 pb-2">
            <Navigation items={mainNavItems} />
          </div>
        </div>
      </div>
    </header>
  )
}
