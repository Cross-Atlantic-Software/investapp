'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/admin/shared';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/admin/dashboard');
  }, [router]);

  return <Loader fullScreen text="Redirecting to dashboard..." />;
}