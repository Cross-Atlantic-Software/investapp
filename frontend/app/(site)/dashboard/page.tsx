"use client";

import { Download } from "lucide-react";
import { OverviewCard, RiskCard, RecoCard, OpportunityCard, HoldingsTable } from "@/components/dashboard";
import UpdatesListing, { type UpdateItem } from "@/components/dashboard/updatesListing";
import UserReports from "@/components/dashboard/UserReports";
import { Button, Heading } from "@/components/ui";
import { usePdfDownload } from "@/hooks/usePdfDownload";

/* ---------- page ---------- */
export default function DashboardPage() {
  const { downloadAsPdf } = usePdfDownload();

  const updates: UpdateItem[] = [
    { id: "u1", title: "Razorpay shares up 12.5% today", time: "2 hours ago", state: "live", href: "#" },
    { id: "u2", title: "Swiggy sell requests pending approval", time: "6 hours ago", state: "live", href: "#" },
    { id: "u3", title: "New liquidity window available for OLA Electric", time: "1 day ago", state: "muted", href: "#" },
    { id: "u4", title: "Swiggy sell requests pending approval", time: "6 hours ago", state: "muted", href: "#" },
  ];

  const handleDownloadPdf = async () => {
    try {
      await downloadAsPdf('dashboard-content', {
        filename: `portfolio-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
        includeDate: true
      });
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <section id="dashboard-content">
      {/* header */}
      <div className="mb-4 flex flex-col gap-3 rounded bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <Heading as="h5" className="font-semibold">
          Portfolio Dashboard
        </Heading>
        <Button
          text="Download Snapshot"
          color="themeTeal"
          variant="outline"
          size="sm"
          onClick={handleDownloadPdf}
          icon={Download}
          iconPosition="left"
        />
      </div>

      {/* top summary cards */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard />
        <RiskCard />
        <RecoCard />
        <OpportunityCard />
      </div>

      {/* holdings table - full width */}
      <section className="rounded bg-white p-4">
        <div className="mb-4">
          <Heading as="h5" className="text-themeTeal">
            Holdings
          </Heading>
        </div>

        {/* table: responsive with proper overflow handling */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <HoldingsTable />
          </div>
        </div>
      </section>

      {/* updates sidebar */}
      {/* <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div></div>
        <aside className="space-y-4 lg:sticky lg:top-4">
          <UpdatesListing items={updates} heading="Recent Activities" className="p-2" />
          <UpdatesListing items={updates} heading="Upcoming Opportunities & Events" className="p-2" />
        </aside>
      </div> */}
    </section>
  );
}
