'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Mail, Menu, TrendingUp, Users, UserStar, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    router.push('/admin/login');
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);

    const token = sessionStorage.getItem('adminToken');
    const storedUser = sessionStorage.getItem('adminUser');

    if (!token || !storedUser) {
      if (isLoginPage) {
        setIsAuthenticated(true);
        return;
      } else {
        router.push('/admin/login');
        return;
      }
    }

    try {
      const user = JSON.parse(storedUser);
      setUserInfo({
        name: `${user.first_name} ${user.last_name}`,
        role:
          user.role === 11
            ? 'SuperAdmin'
            : user.role === 10
            ? 'Admin'
            : user.role === 12
            ? 'Blogger'
            : user.role === 13
            ? 'Site Manager'
            : 'User',
      });
      setIsAuthenticated(true);

      if (isLoginPage) {
        router.push('/admin/dashboard');
        return;
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      if (isLoginPage) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
    }
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-themeTealWhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4" />
          <p className="text-themeTeal text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-themeTealWhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4" />
          <p className="text-themeTeal text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const NavLink = ({
    href,
    label,
    icon,
    active,
  }: {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
  }) => (
    <Link
      href={href}
      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-full transition duration-300 focus:outline-none ${
        active
          ? 'bg-themeTeal text-white shadow-lg shadow-themeTeal/25'
          : 'text-themeTealLighter hover:bg-themeTealWhite hover:text-themeTeal hover:shadow-md shadow-themeTeal/10'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <div
        className={`mr-3 p-1.5 rounded-full ${
          active ? 'bg-themeTealWhite text-themeTeal' : 'bg-themeTealWhite'
        }`}
      >
        {icon}
      </div>
      {label}
    </Link>
  );

  return (
    <div className={`min-h-screen bg-themeTealWhite relative ${sidebarOpen ? 'overflow-hidden' : ''}`}>
      {/* Top header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: mobile menu button + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex lg:hidden items-center justify-center rounded p-2 text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite focus:outline-none cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-controls="admin-sidebar"
              aria-expanded={sidebarOpen}
            >
              {/* Hamburger */}
              <Menu/>
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="relative w-[120px] h-[35px]">
                <Image
                  src="/images/logo.svg"
                  alt="InvestApp"
                  fill
                  priority
                  sizes="120px"
                />
              </div>

            </Link>
          </div>

          {/* Right: user profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-themeTeal">{userInfo?.name || 'Loading...'}</p>
              <p className="text-xs text-themeTealLighter">{userInfo?.role || 'Loading...'}</p>
            </div>
            <div className="w-8 h-8 bg-themeTeal rounded-full flex items-center justify-center">
              <span className="text-themeTealWhite text-sm font-medium">
                {userInfo?.name ? userInfo.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-1 text-themeTealLighter hover:text-themeTeal transition duration-200 cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut/>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar: desktop persistent, mobile drawer */}
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-themeTeal/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        role="navigation"
        aria-label="Admin sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 bg-themeTeal">
            <Link href="/admin/dashboard" className="flex items-center">
              <div className="relative w-[120px] h-[35px]">
                <Image
                  src="/images/logo-white.svg"
                  alt="InvestApp"
                  fill
                  priority
                  sizes="120px"
                />
              </div>

            </Link>
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-sm p-2 text-themeTealWhite hover:bg-themeTealWhite hover:text-themeTeal focus:outline-none cursor-pointer transition duration-300"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X/>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
            <div className="space-y-2">
              <NavLink
                href="/admin/dashboard"
                label="Dashboard"
                active={pathname === '/admin/dashboard' || pathname === '/admin'}
                icon={
                  <LayoutDashboard width="18" height="18"/>
                }
              />
              <NavLink
                href="/admin/stocks"
                label="Stocks"
                active={pathname === '/admin/stocks'}
                icon={
                  <TrendingUp width="18" height="18"/>
                }
              />
              <NavLink
                href="/admin/users"
                label="Admin Users"
                active={pathname === '/admin/users'}
                icon={
                  <Users width="18" height="18"/>
                }
              />
              <NavLink
                href="/admin/site-users"
                label="Site Users"
                active={pathname === '/admin/site-users'}
                icon={
                  <UserStar width="18" height="18"/>
                }
              />
              <NavLink
                href="/admin/email-templates"
                label="Email Templates"
                active={pathname === '/admin/email-templates'}
                icon={
                  <Mail width="18" height="18"/>
                }
              />
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-themeTealLighter">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-4 py-3 text-sm font-medium text-themeTealLighter hover:bg-red-50 hover:text-red-600 rounded transition duration-300 focus:outline-none cursor-pointer"
            >
              <div className="mr-3 p-1.5 rounded-lg bg-themeTealWhite group-hover:text-red-600 group-hover:bg-red-50">
                <LogOut/>
              </div>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex">
        <main className="flex-1 px-4 py-6 lg:px-6 lg:ml-64 transition-[margin] duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
