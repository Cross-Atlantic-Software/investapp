"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BeyondMarket, BulkDeals, FeaturesSection, HeroSection, InvestappPrice, InvestorKnowledge, MarketInsight, NewsletterCTA, PrivateMarketTrends, MarketPortfolio } from "@/components/containers";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/invest");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth or redirecting
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-themeTeal mx-auto"></div>
          <p className="mt-4 text-themeTealLighter">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      {/* <InvestappPrice /> */}
      <BeyondMarket />
      <MarketPortfolio />
      <BulkDeals />
      <MarketInsight />
      {/* <InvestorKnowledge />
      <PrivateMarketTrends /> */}
      <NewsletterCTA />
    </>
  );
}
