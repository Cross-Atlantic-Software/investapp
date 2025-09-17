import Image from "next/image";
import Breadcrumbs, { type Crumb } from "../subcomponents/breadcrumbs";
import RegisterCard from "./registerCard";
import WishlistCard from "./wishlistCard";
import { Button, Heading } from "../ui";

export type ShareIntroProps = {
  breadcrumbs: Crumb[];
  logoUrl: string;
  company: string;
  highestBid: number;
  lowestAsk: number;
  lastMatched: number;
  investPrice: number;
  changeAbs: number;
  changePct: number;
  updatedAt: string;
  stockDemand: string;
  sectorSentiment: string;
  tags: string[];
  founded: string | number;
  sector: string;
  subsector: string;
  hq: string;
  about: string;
  website: string;
};

export default function ShareIntro(props: ShareIntroProps) {
  const {
    breadcrumbs, logoUrl, company,
    highestBid, lowestAsk, lastMatched,
    investPrice, changeAbs, changePct, updatedAt,
    stockDemand, sectorSentiment, tags,
    founded, sector, subsector, hq,
    about, website,
  } = props;

  const pos = changeAbs >= 0;

  return (
    <section className="p-6 bg-themeTealWhite">
      <Breadcrumbs items={breadcrumbs} />

      {/* left details + right cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)]">
        {/* LEFT */}
        <div className="min-w-0">
          <header className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-white overflow-hidden grid place-items-center">
              <Image src={logoUrl} alt={`${company} logo`} width={64} height={64} className="h-full w-full object-contain" />
            </div>
            <Heading as="h4" className="text-themeTeal font-semibold">{company}</Heading>
          </header>

          {/* KPIs: responsive grid */}
          <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3">
            <Kpi label="Highest bid" value={`₹ ${formatINR(highestBid)}`} />
            <Kpi label="Lowest ask" value={`₹ ${formatINR(lowestAsk)}`} />
            <Kpi label="Last matched price" value={`₹ ${formatINR(lastMatched)}`} />
            <Kpi
              label="Invest App Price"
              value={
                <div>
                  <div className="font-semibold text-themeTeal">
                    ₹ {formatINR(investPrice)}{" "}
                    <span className={pos ? "text-green-600 text-sm" : "text-rose-600 text-sm"}>
                      {pos ? "+" : ""}₹{formatINR(Math.abs(changeAbs))} ({pos ? "+" : ""}{changePct.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="text-xs text-themeTealLight">Updated {updatedAt}</div>
                </div>
              }
            />
            <Kpi
              label="Stock Demand"
              value={<span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs">↗ {stockDemand}</span>}
            />
            <Kpi
              label="Sector Sentiment"
              value={<span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs">↗ {sectorSentiment}</span>}
            />
          </div>

          {/* Tags */}
          {tags?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full border border-themeTealLighter bg-white px-3 py-1 text-sm text-themeTeal">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          {/* Facts: responsive grid */}
          <div className="mt-6 flex flex-wrap items-start gap-x-10 gap-y-3">
              <Fact label="Founded" value={String(founded)} />
              <Fact label="Sector" value={sector} />
              <Fact label="Subsector" value={subsector} />
              <Fact label="Headquarters" value={hq} />
          </div>

          {/* About */}
          <p className="my-6 text-themeTealLight leading-relaxed break-words">
            {about}
          </p>

          <Button
            text={website}
            color="skyblue"
            variant="link"
            size="nospacesm"
            href={`https://${website.replace(/^https?:\/\//, "")}`}
          />
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <RegisterCard />
          <WishlistCard name={company} sector={sector} priceINR={investPrice} />
        </div>
      </div>
    </section>
  );
}

/* helpers */
function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-themeTealLight text-sm mb-1">{label}</div>
      <div className="text-lg sm:text-xl font-semibold text-themeTeal">{value}</div>
    </div>
  );
}
function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-themeTealLight text-sm">{label}</div>
      <div className="text-base sm:text-lg font-semibold text-themeTeal">{value}</div>
    </div>
  );
}
function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
