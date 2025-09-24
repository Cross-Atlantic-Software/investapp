"use client"

import { Button, Logo, Navigation, type MenuItem } from "@/components/ui"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"

const items: MenuItem[] = [
  { label: "Home", href: "/" },
  { label: "Invest", href: "/invest" },
  // { label: "Market Insights", href: "/market-insights" },
  // {
  //   label: "Market Insights",
  //   children: [
  //     { label: "Reports", href: "/market-insights" },
  //   ],
  // },
  // { label: "Knowledge Center", href: "/knowledge-center" },
  // { label: "Partner Program", href: "/partner-program" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-gray-200">
        <Logo href="/"/>
        <Navigation items={items} />
        <div className="hidden lg:flex space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Profile Section */}
              <div className="flex items-center gap-2 text-themeTeal">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-themeTeal text-white">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-themeTeal">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-xs text-themeTealLighter">
                    {user?.email}
                  </span>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1 text-xs text-themeTealLighter hover:text-themeTeal transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Button text="Sign In" color="themeTeal" variant="outline" size="sm" href='/login' />
              <Button text="Get Started" color="themeTeal" variant="solid" size="sm" href='/register/step-1' />
            </>
          )}
        </div>
    </header>
  )
}
