"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

function GoogleAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuthState } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = () => {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Prepare user data with name fields
          const userData = {
            id: user.id.toString(),
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            name: user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}`.trim()
              : user.first_name || user.last_name || user.email.split('@')[0],
          };

          // Store authentication data in localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(userData));

          // Refresh the auth context to pick up the new authentication data
          refreshAuthState();

          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('Error processing Google auth success:', error);
          router.push('/login?error=google_auth_failed');
        }
      } else {
        router.push('/login?error=missing_auth_data');
      }
    };

    handleAuthSuccess();
  }, [searchParams, router, refreshAuthState]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4"></div>
        <p className="text-themeTeal">Completing Google authentication...</p>
      </div>
    </div>
  );
}

export default function GoogleAuthSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal mx-auto mb-4"></div>
          <p className="text-themeTealLighter">Loading...</p>
        </div>
      </div>
    }>
      <GoogleAuthSuccessContent />
    </Suspense>
  );
}
