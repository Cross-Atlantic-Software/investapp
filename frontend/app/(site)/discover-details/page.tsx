import { Section, SectionNav, ShareIntro, TradeTabsShell } from "@/components/shares";
import { FaqSection, FinancialPerformanceSection, InvestmentRationaleSection, NewsSection, PerformanceBenchmarkSection, PriceChartSection, ScorecardSection, SectorOutlookSection, ShareholdingSection } from "@/components/shares/sections";
const NAV = [
  { id: "price", label: "Price Chart" },
  { id: "score", label: "Scorecard" },
  { id: "rationale", label: "Investment Rationale" },
  { id: "bench", label: "Performance Benchmark" },
  { id: "outlook", label: "Sector Outlook" },
  { id: "financials", label: "Financial" },
  { id: "holders", label: "Shareholding" },
  { id: "news", label: "News" },
  { id: "faq", label: "FAQs" },
];
export default function DiscoverDetails() {

  return (
    <>
      <ShareIntro
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Discover", href: "/discover" },
          { label: "Buy and sell Pine Labs" }
        ]}
        logoUrl="/images/anthropic.png"
        company="Pine Labs"
        highestBid={350.92}
        lowestAsk={310.45}
        lastMatched={332.59}
        investPrice={329.37}
        changeAbs={9.37}
        changePct={1.25}
        updatedAt="Aug 05, 2025"
        stockDemand="Increasing"
        sectorSentiment="Bullish"
        tags={["Most Active", "Upcoming IPO", "Unicorn"]}
        founded={1998}
        sector="Fintech"
        subsector="Blockchain"
        hq="Noida, Uttar Pradesh"
        about={`At Pine Labs, we’re proud of the way our merchant platform makes an impact on our customers’ lives. And we work to extend that impact to communities around us. Our employees volunteer to help people and organizations that work with underprivileged children, the differently-abled and the elderly. We also work to protect and improve the environment by reducing our carbon footprint and pursuing environmentally sustainable actions across all aspects of our operations.`}
        website="pinelabs.com"
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)] p-6">
        {/* LEFT: content */}
        <div className="min-w-0 space-y-6">
          {/* <SectionNav items={NAV} offset={88} /> */}

          <div className="space-y-6">
            {/* <Section id="price" title="Price Chart" info="Intraday private-market price. Delayed. Not investment advice."><PriceChartSection /></Section> */}
            {/* <Section id="score" title="Scorecard" info="Intraday private-market price. Delayed. Not investment advice."><ScorecardSection /></Section> */}
            {/* <Section id="rationale" title="Investment Rationale" info="Intraday private-market price. Delayed. Not investment advice."><InvestmentRationaleSection /></Section> */}
            {/* <Section id="bench" title="Performance Benchmark" info="Intraday private-market price. Delayed. Not investment advice."><PerformanceBenchmarkSection /></Section> */}
            <Section id="outlook" title="Sector Outlook" info="Intraday private-market price. Delayed. Not investment advice."><SectorOutlookSection /></Section>
            {/* <Section id="financials" title="Financial Performance" info="Intraday private-market price. Delayed. Not investment advice."><FinancialPerformanceSection /></Section> */}
            {/* <Section id="holders" title="Shareholding" info="Intraday private-market price. Delayed. Not investment advice."><ShareholdingSection /></Section> */}
            {/* <Section id="news" title="News Related to Company" info="Intraday private-market price. Delayed. Not investment advice."><NewsSection /></Section> */}
            {/* <Section id="faq" title="Frequently Asked Questions" info="Intraday private-market price. Delayed. Not investment advice."><FaqSection /></Section> */}
          </div>
        </div>

        {/* RIGHT: sticky, scrollable sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] overflow-y-auto">
          <TradeTabsShell
            company="Pine Labs"
            priceINR={350.92}
            settlementDate="Aug 21, 2025"
            minUnits={300}
            lotSize={300}
          />
        </aside>
      </div>

    </>
  );
}
