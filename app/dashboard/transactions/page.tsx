import { Clock, IndianRupee, Wallet } from "lucide-react";
import { Heading } from "@/components/ui";
import RecentTransactions, { RecentTxn } from "@/components/dashboard/recentTransactions";
import { AuditTrailTable } from "@/components/dashboard";

/* ---------- cards ---------- */
function OverviewCard() {
  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Total Portfolio Value</p>
        <IndianRupee className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">₹28.5L</div>
      <div className="mt-3 text-sm text-emerald-600">↗ +₹4.3L (17.5%)</div>
    </div>
  );
}
function CashBalance() {
  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Cash Balance</p>
        <Wallet className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">₹15,000.00</div>
      <div className="mt-3 text-sm text-themeTealLighter">Available for trading</div>
    </div>
  );
}
function RecentTransactionsBox() {
  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Recent Transactions</p>
        <IndianRupee className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">3</div>
      <div className="mt-3 text-sm text-themeTealLighter">This month</div>
    </div>
  );
}
function PendingOrders() {
  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Pending Orders</p>
        <Clock className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">0</div>
      <div className="mt-3 text-sm text-themeTealLighter">All orders settled</div>
    </div>
  );
}

const txns: RecentTxn[] = [
  {
    id: "t1",
    company: "Pine Labs",
    side: "sell",
    shares: 100,
    date: "Aug 13, 2025",
    pricePerShareINR: 450,
    feesINR: 20,
    amountINR: "₹28.5L",
    status: "Completed",
    txnId: "TXN-2025-265",
  },
  {
    id: "t2",
    company: "Pine Labs",
    side: "buy",
    shares: 100,
    date: "Aug 13, 2025",
    pricePerShareINR: 450,
    feesINR: 20,
    amountINR: "₹28.5L",
    status: "Pending",
    txnId: "TXN-2025-266",
  },
  {
    id: "t3",
    company: "Pine Labs",
    side: "buy",
    shares: 100,
    date: "Aug 13, 2025",
    pricePerShareINR: 450,
    feesINR: 20,
    amountINR: "₹28.5L",
    status: "Failed",
    txnId: "TXN-2025-266",
  },
];

export default function Transactions() {
  return (
    <section className="space-y-4">
      <div className="text-center">
        <Heading as="h3" className="font-semibold mb-3">Your Financial Ledger: Precision at Your Fingertips</Heading>
        <p className="text-themeTealLighter mb-10">Manage your Invest APP transactions with confidence</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-10">
        <OverviewCard />
        <CashBalance />
        <RecentTransactionsBox /> 
        <PendingOrders /> 
      </div>

      <p className="text-themeTeal font-semibold">Recent Transactions</p>
      <RecentTransactions items={txns} />

      <AuditTrailTable />

    </section>
  );
}
