"use client";

import { Clock, IndianRupee, Wallet } from "lucide-react";
import { Heading } from "@/components/ui";
import RecentTransactions, { RecentTxn } from "@/components/dashboard/recentTransactions";
import { AuditTrailTable } from "@/components/dashboard";
import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  transaction_id: string;
  transaction_type: "buy" | "sell";
  status: "pending" | "completed" | "rejected";
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees: number | null;
  taxes: number | null;
  net_amount: number | null;
  order_date: string;
  company_name: string;
}

interface Wallet {
  available_balance: number;
  pending_balance: number;
  total_deposited: number;
  total_withdrawn: number;
}

interface Portfolio {
  total_investment: number | string;
  price_change: number | string;
  percentage_change: number | string | null;
}

/* ---------- cards ---------- */
function OverviewCard({ portfolio }: { portfolio: Portfolio | null }) {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const totalValue = portfolio ? Number(portfolio.total_investment || 0) + Number(portfolio.price_change || 0) : 0;

  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Total Portfolio Value</p>
        <IndianRupee className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">
        {portfolio ? formatCurrency(totalValue) : "₹0"}
      </div>
      {portfolio && Number(portfolio.price_change || 0) !== 0 && (
        <div className={`mt-3 text-sm ${Number(portfolio.price_change || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {Number(portfolio.price_change || 0) >= 0 ? '↗' : '↘'} {formatCurrency(Math.abs(Number(portfolio.price_change || 0)))} ({Number(portfolio.percentage_change || 0) >= 0 ? '+' : ''}{Number(portfolio.percentage_change || 0).toFixed(2)}%)
        </div>
      )}
    </div>
  );
}

function CashBalance({ wallet }: { wallet: Wallet | null }) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Cash Balance</p>
        <Wallet className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">
        {wallet ? formatCurrency(wallet.available_balance) : "₹0.00"}
      </div>
      <div className="mt-3 text-sm text-themeTealLighter">Available for trading</div>
    </div>
  );
}

function RecentTransactionsBox({ count, thisMonth }: { count: number; thisMonth: number }) {
  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Recent Transactions</p>
        <IndianRupee className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">{count}</div>
      <div className="mt-3 text-sm text-themeTealLighter">{thisMonth} this month</div>
    </div>
  );
}

function PendingOrders({ pendingCount }: { pendingCount: number }) {
  return (
    <div className='rounded bg-white p-4 sm:p-6'>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[15px] font-semibold text-themeTeal">Pending Orders</p>
        <Clock className="h-5 w-5 text-themeTeal/80" />
      </div>
      <div className="text-3xl font-semibold text-themeTeal">{pendingCount}</div>
      <div className="mt-3 text-sm text-themeTealLighter">
        {pendingCount === 0 ? "All orders settled" : "Awaiting approval"}
      </div>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [thisMonthCount, setThisMonthCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';

        // Fetch transactions - get all for audit trail
        const txnResponse = await fetch('/api/user-transactions?limit=1000', {
          headers: { 'token': token }
        });
        if (txnResponse.ok) {
          const txnData = await txnResponse.json();
          if (txnData.success) {
            setTransactions(txnData.data || []);
            
            // Count pending transactions
            const pending = (txnData.data || []).filter((t: Transaction) => t.status === 'pending').length;
            setPendingCount(pending);
            
            // Count this month transactions
            const now = new Date();
            const thisMonth = (txnData.data || []).filter((t: Transaction) => {
              const txnDate = new Date(t.order_date);
              return txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
            }).length;
            setThisMonthCount(thisMonth);
          }
        }

        // Fetch wallet
        const walletResponse = await fetch('/api/user-wallet', {
          headers: { 'token': token }
        });
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.success) {
            setWallet(walletData.data);
          }
        }

        // Fetch portfolio
        const portfolioResponse = await fetch('/api/user-portfolio', {
          headers: { 'token': token }
        });
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          if (portfolioData.success && portfolioData.data) {
            setPortfolio(portfolioData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform transactions to RecentTxn format
  const formatTransactions = (txns: Transaction[]): RecentTxn[] => {
    return txns.map(t => ({
      id: t.id.toString(),
      company: t.company_name,
      side: t.transaction_type,
      shares: t.quantity,
      date: new Date(t.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      pricePerShareINR: Number(t.price_per_unit),
      feesINR: t.fees || 0,
      amountINR: t.net_amount || t.total_amount,
      status: t.status === 'completed' ? 'Completed' : t.status === 'pending' ? 'Pending' : 'Failed',
      txnId: t.transaction_id
    }));
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="text-center">
          <Heading as="h3" className="font-semibold mb-3">Your Financial Ledger: Precision at Your Fingertips</Heading>
          <p className="text-themeTealLighter mb-10">Manage your AltStock transactions with confidence</p>
        </div>
        <div className="text-center text-themeTealLighter">Loading...</div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="text-center">
        <Heading as="h3" className="font-semibold mb-3">Your Financial Ledger: Precision at Your Fingertips</Heading>
        <p className="text-themeTealLighter mb-10">Manage your AltStock transactions with confidence</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-10">
        <OverviewCard portfolio={portfolio} />
        <CashBalance wallet={wallet} />
        <RecentTransactionsBox count={transactions.length} thisMonth={thisMonthCount} /> 
        <PendingOrders pendingCount={pendingCount} /> 
      </div>

      <p className="text-themeTeal font-semibold">Recent Transactions</p>
      {transactions.length > 0 ? (
        <RecentTransactions items={formatTransactions(transactions.slice(0, 5))} />
      ) : (
        <div className="rounded bg-white p-6 text-center text-themeTealLighter">
          No transactions found
        </div>
      )}

      <AuditTrailTable transactions={transactions} />

    </section>
  );
}
