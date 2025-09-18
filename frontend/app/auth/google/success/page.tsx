"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuth() as any;

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Save to localStorage and context
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: user.id.toString(),
          email: user.email,
        }));

        // Update context (if setToken and setUser are available)
        if (setToken) setToken(token);
        if (setUser) setUser({
          id: user.id.toString(),
          email: user.email,
        });

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing Google auth success:', error);
        router.push('/login?error=google_auth_failed');
      }
    } else {
      router.push('/login?error=missing_auth_data');
    }
  }, [searchParams, router, setToken, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4"></div>
        <p className="text-themeTeal">Completing Google authentication...</p>
      </div>
    </div>
  );
}
