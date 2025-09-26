'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, Shield, Users, UserPlus, FileText, ShieldUser, ChevronDown } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    router.push('/admin/login');
  }, [router]);

  // Auto-open users menu on user-related pages
  useEffect(() => {
    const userRelatedPages = ['/admin/users', '/admin/site-users', '/admin/enquiries', '/admin/subscribers'];
    setIsUsersMenuOpen(userRelatedPages.includes(pathname));
    // Close sidebar on route change (mobile)
    setSidebarOpen(false);
  }, [pathname]);

  // Auth gate
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

  // Esc to close sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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

  return (
    <div className="min-h-screen bg-themeTealWhite relative">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Mobile: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center lg:hidden p-2 rounded-lg text-themeTeal hover:bg-themeTealWhite focus:outline-none"
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/admin/dashboard" className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="InvestApp Logo"
                width={110}
                height={32}
                priority
              />
            </Link>
          </div>

          {/* Right side user block */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-themeTeal">{userInfo?.name || 'Loading...'}</p>
              <p className="text-xs text-themeTealLighter">{userInfo?.role || 'Loading...'}</p>
            </div>
            <div className="w-8 h-8 bg-themeTeal rounded-full flex items-center justify-center">
              <span className="text-themeTealWhite text-sm font-medium">
                {userInfo?.name ? userInfo.name.split(' ').map(n => n[0]).join('') : 'U'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-1 text-themeTealLighter hover:text-themeTeal transition-colors duration-200 cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar: Desktop */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl">
          <Sidebar
            pathname={pathname}
            isUsersMenuOpen={isUsersMenuOpen}
            setIsUsersMenuOpen={setIsUsersMenuOpen}
          />
        </aside>

        {/* Sidebar: Mobile Drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}
          aria-hidden={!sidebarOpen}
        >
          {/* Overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Panel */}
          <aside
            className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-transform duration-200 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between h-16 px-4 bg-themeTeal">
              <Image
                src="/images/logo-white.svg"
                alt="InvestApp Logo"
                width={120}
                height={35}
                priority
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Sidebar
              pathname={pathname}
              isUsersMenuOpen={isUsersMenuOpen}
              setIsUsersMenuOpen={setIsUsersMenuOpen}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>

        {/* Main */}
        <main className="flex-1 w-full px-4 py-6 lg:px-6 lg:ml-64 transition-[margin] duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Sidebar Component ---------------- */

function Sidebar({
  pathname,
  isUsersMenuOpen,
  setIsUsersMenuOpen,
  onNavigate,
}: {
  pathname: string;
  isUsersMenuOpen: boolean;
  setIsUsersMenuOpen: (v: boolean) => void;
  onNavigate?: () => void;
}) {
  const linkBase =
    'group flex items-center px-4 py-3 text-sm font-medium rounded-full transition duration-300';
  const subLinkBase =
    'group flex items-center px-4 py-2 text-sm font-medium rounded-full transition duration-300';

  const NavLink = ({
    href,
    active,
    icon,
    label,
  }: {
    href: string;
    active: boolean;
    icon: React.ReactNode;
    label: string;
  }) => (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${linkBase} ${
        active
          ? 'bg-themeTeal text-white shadow-lg shadow-themeTeal/25'
          : 'text-themeTeal hover:bg-themeTealWhite hover:shadow-md'
      }`}
    >
      <div
        className={`mr-3 p-1.5 rounded-full transition duration-300 ${
          active ? 'bg-themeTealWhite text-themeTeal' : 'bg-themeTealWhite group-hover:bg-themeTeal group-hover:text-themeTealWhite'
        }`}
      >
        {icon}
      </div>
      {label}
    </Link>
  );

  const SubLink = ({
    href,
    active,
    icon,
    label,
  }: {
    href: string;
    active: boolean;
    icon: React.ReactNode;
    label: string;
  }) => (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${subLinkBase} ${
        active ? 'bg-themeTeal text-white shadow-md' : 'text-themeTealLight hover:bg-themeTealWhite hover:text-themeTeal'
      }`}
    >
      <div
        className={`mr-3 p-1 rounded-full transition duration-300 ${active ? 'bg-themeTealWhite text-themeTeal' : 'bg-themeTealWhite group-hover:bg-themeTeal group-hover:text-themeTealWhite'}`}
      >
        {icon}
      </div>
      {label}
    </Link>
  );

  return (
          <div className="flex flex-col h-full">
      <div className="hidden lg:flex items-center justify-center h-16 px-4 bg-themeTeal">
              <Image
                src="/images/logo.svg"
                alt="InvestApp Logo"
                width={120}
                height={35}
                priority
              />
            </div>
            
      <nav className="flex-1 px-4 py-6 lg:py-8 space-y-3 overflow-y-auto">
                <div className="space-y-2">
          <NavLink
                    href="/admin/dashboard"
            active={pathname === '/admin/dashboard' || pathname === '/admin'}
            icon={
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                      </svg>
            }
            label="Dashboard"
          />

          <NavLink
                    href="/admin/stocks"
            active={pathname === '/admin/stocks'}
            icon={
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
            }
            label="Stocks"
          />

          {/* Users accordion */}
                  <div>
                    <button
                      onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
              className={`${linkBase} ${
                        ['/admin/users', '/admin/site-users', '/admin/enquiries', '/admin/subscribers'].includes(pathname)
                          ? 'bg-themeTeal text-white shadow-lg shadow-themeTeal/25'
                  : 'text-themeTeal hover:bg-themeTealWhite hover:text-themeTeal hover:shadow-md'
              } w-full justify-between`}
              aria-expanded={isUsersMenuOpen}
              aria-controls="users-submenu"
                    >
                      <div className="flex items-center">
                <div
                  className={`mr-3 p-1.5 rounded-full transition duration-300 ${
                          ['/admin/users', '/admin/site-users', '/admin/enquiries', '/admin/subscribers'].includes(pathname)
                            ? 'bg-white/20'
                      : 'bg-themeTealWhite group-hover:bg-themeTeal group-hover:text-themeTealWhite'
                  }`}
                >
                  <ShieldUser width={16} height={16}/>
                        </div>
                        Users
                      </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUsersMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
            <div
              id="users-submenu"
              className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
                      isUsersMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="ml-4 mt-2 space-y-1">
                <SubLink
                  href="/admin/users"
                  active={pathname === '/admin/users'}
                  icon={<Shield className="h-3 w-3" />}
                  label="Admin Users"
                />
                <SubLink
                          href="/admin/site-users"
                  active={pathname === '/admin/site-users'}
                  icon={<Users className="h-3 w-3" />}
                  label="Site Users"
                />
                <SubLink
                          href="/admin/enquiries"
                  active={pathname === '/admin/enquiries'}
                  icon={
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                            </svg>
                  }
                  label="Enquiries"
                />
                <SubLink
                          href="/admin/subscribers"
                  active={pathname === '/admin/subscribers'}
                  icon={<UserPlus className="h-3 w-3" />}
                  label="Subscribers"
                />
                      </div>
                    </div>
                  </div>
                  
          <NavLink
                    href="/admin/email-templates"
            active={pathname === '/admin/email-templates'}
            icon={<FileText className="h-4 w-4" />}
            label="Email Templates"
          />

          <NavLink
                    href="/admin/private-market-news"
            active={pathname === '/admin/private-market-news'}
            icon={
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
                      </svg>
            }
            label="Private Market News"
          />

          <NavLink
                    href="/admin/notable-activities"
            active={pathname === '/admin/notable-activities'}
            icon={
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
            }
            label="Notable Activities"
          />

          <NavLink
            href="/admin/bulk-deals"
            active={pathname === '/admin/bulk-deals'}
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
            label="Bulk Deals"
          />
              </div>  
            </nav>
    </div>
  );
}
