"use client";

import { useState, useEffect } from "react";
import { Heading } from "@/components/ui";
import { Wallet, ArrowDownCircle, ArrowUpCircle, IndianRupee, RefreshCw } from "lucide-react";

interface WalletData {
  available_balance: number;
  pending_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  last_updated: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
      
      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to view your wallet' });
        return;
      }

      const response = await fetch('/api/user-wallet', {
        headers: { 'token': token }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWallet(data.data);
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to fetch wallet' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch wallet' });
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setMessage({ type: 'error', text: 'Failed to fetch wallet' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid deposit amount' });
      return;
    }

    try {
      setProcessing(true);
      setMessage(null);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';

      const response = await fetch('/api/user-wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Deposit successful!' });
        setDepositAmount("");
        setShowDepositModal(false);
        await fetchWallet(); // Refresh wallet data
      } else {
        setMessage({ type: 'error', text: data.message || 'Deposit failed' });
      }
    } catch (error) {
      console.error('Error depositing:', error);
      setMessage({ type: 'error', text: 'Failed to deposit. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid withdrawal amount' });
      return;
    }

    if (!wallet || amount > wallet.available_balance) {
      setMessage({ type: 'error', text: 'Insufficient balance for withdrawal' });
      return;
    }

    try {
      setProcessing(true);
      setMessage(null);
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';

      const response = await fetch('/api/user-wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message || 'Withdrawal successful!' });
        setWithdrawAmount("");
        setShowWithdrawModal(false);
        await fetchWallet(); // Refresh wallet data
      } else {
        setMessage({ type: 'error', text: data.message || 'Withdrawal failed' });
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      setMessage({ type: 'error', text: 'Failed to withdraw. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="text-center">
          <Heading as="h3" className="font-semibold mb-3">My Wallet</Heading>
          <p className="text-themeTealLighter mb-10">Manage your account balance</p>
        </div>
        <div className="text-center text-themeTealLighter">Loading...</div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading as="h3" className="font-semibold mb-2">My Wallet</Heading>
          <p className="text-themeTealLighter">Manage your account balance and transactions</p>
        </div>
        <button
          onClick={fetchWallet}
          className="flex items-center gap-2 px-4 py-2 text-sm text-themeTeal hover:text-themeTealDark transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="rounded-lg bg-gradient-to-br from-themeTeal to-themeTealDark p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Available Balance</p>
              <p className="text-3xl font-bold">
                {wallet ? formatCurrency(wallet.available_balance) : "₹0.00"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              setShowDepositModal(true);
              setMessage(null);
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-3 hover:bg-white/30 transition-colors"
          >
            <ArrowDownCircle className="h-5 w-5" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              setShowWithdrawModal(true);
              setMessage(null);
            }}
            disabled={!wallet || wallet.available_balance === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-3 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpCircle className="h-5 w-5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-blue-100 p-2">
              <IndianRupee className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Balance</p>
              <p className="text-xl font-semibold text-gray-900">
                {wallet ? formatCurrency(wallet.pending_balance) : "₹0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-green-100 p-2">
              <ArrowDownCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Deposited</p>
              <p className="text-xl font-semibold text-gray-900">
                {wallet ? formatCurrency(wallet.total_deposited) : "₹0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 p-2">
              <ArrowUpCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Withdrawn</p>
              <p className="text-xl font-semibold text-gray-900">
                {wallet ? formatCurrency(wallet.total_withdrawn) : "₹0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {wallet && wallet.last_updated && (
        <div className="text-sm text-gray-500 text-center">
          Last updated: {formatDate(wallet.last_updated)}
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDepositModal(false)}>
          <div className="rounded-lg bg-white p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Deposit Money</h3>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount("");
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-themeTeal px-4 py-2 text-white hover:bg-themeTealDark transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowWithdrawModal(false)}>
          <div className="rounded-lg bg-white p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Withdraw Money</h3>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                  min="0"
                  max={wallet?.available_balance || 0}
                  step="0.01"
                />
                {wallet && (
                  <p className="mt-1 text-xs text-gray-500">
                    Available: {formatCurrency(wallet.available_balance)}
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount("");
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={processing}
                  className="flex-1 rounded-lg bg-themeTeal px-4 py-2 text-white hover:bg-themeTealDark transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

