import { BeyondMarket, BulkDeals, FeaturesSection, HeroSection, InvestappPrice, InvestorKnowledge, MarketInsight, NewsletterCTA, PrivateMarketTrends, MarketPortfolio } from "@/components/containers"

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <InvestappPrice />
      <BeyondMarket />
      <MarketPortfolio />
      <BulkDeals />
      <MarketInsight />
      <InvestorKnowledge />
      <PrivateMarketTrends />
      <NewsletterCTA />
    </>
  );
}
