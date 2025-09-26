'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Shield, Users, UserPlus, FileText } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    router.push('/admin/login');
  }, [router]);

  // Auto-open users menu when navigating to user-related pages
  useEffect(() => {
    const userRelatedPages = ['/admin/users', '/admin/site-users', '/admin/enquiries', '/admin/subscribers'];
    setIsUsersMenuOpen(userRelatedPages.includes(pathname));
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

  return (
    <div className="min-h-screen bg-themeTealWhite relative">
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-end h-16 px-6 ml-64">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-themeTeal">
                {userInfo?.name || 'Loading...'}
              </p>
              <p className="text-xs text-themeTealLighter">
                {userInfo?.role || 'Loading...'}
              </p>
            </div>
            <div className="w-8 h-8 bg-themeTeal rounded-full flex items-center justify-center">
              <span className="text-themeTealWhite text-sm font-medium">
                {userInfo?.name ? userInfo.name.split(' ').map(n => n[0]).join('') : 'U'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-themeTealLighter hover:text-themeTeal transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 bg-themeTeal">
              <Image
                src="/images/logo.svg"
                alt="InvestApp Logo"
                width={120}
                height={35}
                className="filter brightness-0 invert"
                priority
              />
            </div>
            
            <nav className="flex-1 px-4 py-8 space-y-3">
              <div className="mb-6">
                <div className="space-y-2">
                  <a
                    href="/admin/dashboard"
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      pathname === '/admin/dashboard' || pathname === '/admin'
                        ? 'bg-themeTeal text-white shadow-lg shadow-themeTeal/25'
                        : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal hover:shadow-md'
                    }`}
                  >
                    <div className={`mr-3 p-1.5 rounded-lg ${
                      pathname === '/admin/dashboard' || pathname === '/admin'
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-themeTeal/10'
                    }`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                      </svg>
                    </div>
                    Dashboard
                  </a>
                  
                  <a
                    href="/admin/stocks"
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      pathname === '/admin/stocks'
                        ? 'bg-themeTeal text-white shadow-lg shadow-themeTeal/25'
                        : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal hover:shadow-md'
                    }`}
                  >
                    <div className={`mr-3 p-1.5 rounded-lg ${
                      pathname === '/admin/stocks'
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-themeTeal/10'
                    }`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    Stocks
                  </a>
                  
                  <div>
                    <button
                      onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
                      className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        ['/admin/users', '/admin/site-users', '/admin/enquiries', '/admin/subscribers'].includes(pathname)
                          ? 'bg-themeTeal text-white shadow-lg shadow-themeTeal/25'
                          : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`mr-3 p-1.5 rounded-lg ${
                          ['/admin/users', '/admin/site-users', '/admin/enquiries', '/admin/subscribers'].includes(pathname)
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-themeTeal/10'
                        }`}>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        Users
                      </div>
                      <svg 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isUsersMenuOpen ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-200 ${
                      isUsersMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="ml-4 mt-2 space-y-1">
                        <a
                          href="/admin/users"
                          className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pathname === '/admin/users'
                              ? 'bg-themeTeal text-white shadow-md'
                              : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal'
                          }`}
                        >
                          <div className={`mr-3 p-1 rounded-lg ${
                            pathname === '/admin/users'
                              ? 'bg-white/20'
                              : 'bg-gray-100 group-hover:bg-themeTeal/10'
                          }`}>
                            <Shield className="h-3 w-3" />
                          </div>
                          Admin Users
                        </a>
                        
                        <a
                          href="/admin/site-users"
                          className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pathname === '/admin/site-users'
                              ? 'bg-themeTeal text-white shadow-md'
                              : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal'
                          }`}
                        >
                          <div className={`mr-3 p-1 rounded-lg ${
                            pathname === '/admin/site-users'
                              ? 'bg-white/20'
                              : 'bg-gray-100 group-hover:bg-themeTeal/10'
                          }`}>
                            <Users className="h-3 w-3" />
                          </div>
                          Site Users
                        </a>
                        
                        <a
                          href="/admin/enquiries"
                          className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pathname === '/admin/enquiries'
                              ? 'bg-themeTeal text-white shadow-md'
                              : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal'
                          }`}
                        >
                          <div className={`mr-3 p-1 rounded-lg ${
                            pathname === '/admin/enquiries'
                              ? 'bg-white/20'
                              : 'bg-gray-100 group-hover:bg-themeTeal/10'
                          }`}>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          Enquiries
                        </a>
                        
                        <a
                          href="/admin/subscribers"
                          className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pathname === '/admin/subscribers'
                              ? 'bg-themeTeal text-white shadow-md'
                              : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal'
                          }`}
                        >
                          <div className={`mr-3 p-1 rounded-lg ${
                            pathname === '/admin/subscribers'
                              ? 'bg-white/20'
                              : 'bg-gray-100 group-hover:bg-themeTeal/10'
                          }`}>
                            <UserPlus className="h-3 w-3" />
                          </div>
                          Subscribers
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <a
                    href="/admin/email-templates"
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      pathname === '/admin/email-templates'
                        ? 'bg-themeTeal text-white shadow-lg shadow-themeTeal/25'
                        : 'text-gray-600 hover:bg-themeTealWhite hover:text-themeTeal hover:shadow-md'
                    }`}
                  >
                    <div className={`mr-3 p-1.5 rounded-lg ${
                      pathname === '/admin/email-templates'
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-themeTeal/10'
                    }`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    Email Templates
                  </a>
                </div>
              </div>  
            </nav>
          </div>
        </div>

        <main className="flex-1 px-4 py-6 lg:px-6 lg:ml-64 transition-[margin] duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}