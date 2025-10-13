'use client';

import { KYCProvider } from '@/contexts/KYCContext';

export default function KYCProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KYCProvider>
      {children}
    </KYCProvider>
  );
}
