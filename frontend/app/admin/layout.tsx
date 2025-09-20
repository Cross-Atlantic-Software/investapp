'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{name: string, role: string} | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Skip authentication check for login page
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  }, [router]);

  const verifyToken = useCallback(async (token: string) => {
    try {
      if (!token) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      }

      // Get user data from localStorage first
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserInfo({
            name: `${user.first_name} ${user.last_name}`,
            role: user.role === 11 ? 'SuperAdmin' : 
                  user.role === 10 ? 'Admin' : 
                  user.role === 12 ? 'Blogger' : 
                  user.role === 13 ? 'Site Manager' : 'User'
          });
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }

      // Verify token by making a simple API call
      const response = await fetch('http://localhost:8888/api/admin/users', {
        headers: {
          'token': token,
        },
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Skip authentication for login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Check authentication for other admin pages
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    // Verify token with backend
    verifyToken(token);
  }, [router, isLoginPage, verifyToken]);

  // For login page, render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-themeTealWhite flex items-center justify-center">
        <div className="text-lg text-themeTeal">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-themeTealWhite">
      <header className="bg-white shadow-sm border-b border-themeTealLighter">
        <div className="flex items-center justify-end h-16 px-6 ml-64">
          {/* User Profile */}
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
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                       </svg>
                     </button>
                   </div>
        </div>
      </header>
      
      <div className="flex">
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-themeTealLighter">
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
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              <a
                href="/admin"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-themeTealWhite text-themeTeal transition-colors duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                Dashboard
              </a>
              <a
                href="/admin/stocks"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-themeTealLight hover:bg-themeTealWhite hover:text-themeTeal transition-colors duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Stocks
              </a>
              <a
                href="/admin/users"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-themeTealLight hover:bg-themeTealWhite hover:text-themeTeal transition-colors duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Users
              </a>
            </nav>
            
            <div className="p-4 border-t border-themeTealLighter">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-themeTealLight hover:bg-themeTealWhite hover:text-themeTeal rounded-md transition-colors duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <main className="flex-1 p-6 ml-64 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}