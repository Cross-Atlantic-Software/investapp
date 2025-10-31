import Image from "next/image";
import Breadcrumbs, { type Crumb } from "../subcomponents/breadcrumbs";
import RegisterCard from "./registerCard";
import WishlistCard from "./wishlistCard";
import { Button, Heading } from "../ui";
import { useAuth } from "@/lib/contexts/AuthContext";

export type ShareIntroProps = {
  stockId: string;
  breadcrumbs: Crumb[];
  logoUrl: string;
  company: string;
  investPrice: number;
  changeAbs: number;
  percentage_change?: number;
  priceChangePeriod?: string | undefined;
  updatedAt: string;
  tags: string[];
  founded: string | number;
  sector: string;
  subsector: string;
  hq: string;
  about: string;
  website: string;
  valuation?: string;
};

export default function ShareIntro(props: ShareIntroProps) {
  const {
    stockId, breadcrumbs, logoUrl, company,
    investPrice, changeAbs, percentage_change, priceChangePeriod, updatedAt,
    tags, founded, sector, subsector, hq,
    about, website, valuation,
  } = props;

  const { isAuthenticated } = useAuth();
  const pos = changeAbs >= 0;

  return (
    <section className="p-6 bg-themeTealWhite">
      <Breadcrumbs items={breadcrumbs} />

      {/* left details + right cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,384px)]">
        {/* LEFT */}
        <div className="min-w-0">
          {/* Header with floating WishlistCard */}
          <div className="flex items-center justify-between mb-4">
            <header className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-white overflow-hidden grid place-items-center">
                {logoUrl && logoUrl.trim() !== '' ? (
                  <Image src={logoUrl} alt={`${company} logo`} width={64} height={64} className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-lg font-semibold">
                    {company.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <Heading as="h4" className="text-themeTeal font-semibold">{company}</Heading>
            </header>
            
            {/* Floating WishlistCard - only for non-authenticated users */}
            {!isAuthenticated && (
              <div className="w-64 flex-shrink-0">
                <WishlistCard 
                  stockId={stockId}
                  stockName={company}
                  stockPrice={investPrice}
                  variant="horizontal"
                />
              </div>
            )}
          </div>

          {/* KPIs: responsive grid */}
          <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
            <Kpi
              label="Price per share"
              value={
                <div>
                  <div className="font-semibold text-themeTeal">
                    ₹ {formatINR(investPrice)}{" "}
                    {/* <span className={pos ? "text-green-600 text-sm" : "text-rose-600 text-sm"}>
                      {pos ? "+" : ""}₹{formatINR(Math.abs(changeAbs))} ({pos ? "+" : ""}{changePct.toFixed(2)}%)
                    </span> */}
                  </div>
                  <div className="text-xs text-themeTealLight">Updated {updatedAt}</div>
                </div>
              }
            />
            {valuation && (
              <Kpi
                label="Valuation (in Cr)"
                value={`₹ ${valuation} Cr`}
              />
            )}
            <Kpi
              label="Price Change"
              value={
                <span className={pos ? "text-green-600" : "text-rose-600"}>
                  {pos ? "+" : ""}₹{formatINR(Math.abs(changeAbs))} ({priceChangePeriod || 'No period assigned'})
                </span>
              }
            />
            {percentage_change !== undefined && (
              <Kpi
                label="Percentage Change"
                value={
                  <span className={pos ? "text-green-600" : "text-rose-600"}>
                    {pos ? "+" : ""}{percentage_change.toFixed(2)}%
                  </span>
                }
              />
            )}
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
          {isAuthenticated ? (
            <WishlistCard 
              stockId={stockId}
              stockName={company}
              stockPrice={investPrice}
            />
          ) : (
            <RegisterCard />
          )}
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
