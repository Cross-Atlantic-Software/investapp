"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, CheckCircle, XCircle, Edit, X } from "lucide-react";
import { NotificationContainer, NotificationData, ConfirmationModal } from "@/components/admin/shared";

interface Transaction {
  id: number;
  transaction_id: string;
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  stock: {
    id: number;
    company_name: string;
    logo?: string;
  };
  transaction_type: "buy" | "sell";
  status: "pending" | "completed" | "rejected";
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees: number | null;
  taxes: number | null;
  net_amount: number | null;
  order_date: string;
  execution_date: string | null;
  settlement_date: string | null;
  payment_method: string;
  payment_status: "pending" | "completed" | "failed";
  admin_approved_by: number | null;
  admin_approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  approvedBy?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [transactionToAction, setTransactionToAction] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    fees: "",
    taxes: "",
    notes: "",
    settlement_date: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort_by: 'created_at',
        sort_order: 'DESC'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('transaction_type', typeFilter);

      const response = await fetch(`/api/admin/transactions?${params}`, {
        headers: {
          'token': token
        }
      });
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        addNotification({
          type: 'error',
          title: 'Fetch Failed',
          message: data.message || 'Failed to fetch transactions',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      addNotification({
        type: 'error',
        title: 'Fetch Failed',
        message: 'Error fetching transactions',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleView = async (transactionId: number) => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        headers: { 'token': token }
      });
      const data = await response.json();
      
      if (data.success) {
        setViewingTransaction(data.data.transaction);
        setShowViewModal(true);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to fetch transaction details',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch transaction details',
        duration: 5000
      });
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      fees: transaction.fees?.toString() || "",
      taxes: transaction.taxes?.toString() || "",
      notes: transaction.notes || "",
      settlement_date: transaction.settlement_date ? new Date(transaction.settlement_date).toISOString().split('T')[0] : ""
    });
    setShowEditModal(true);
  };

  const handleApprove = (transactionId: number) => {
    setTransactionToAction(transactionId);
    setShowApproveModal(true);
  };

  const handleReject = (transactionId: number) => {
    setTransactionToAction(transactionId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!transactionToAction) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/transactions/${transactionToAction}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Transaction approved successfully!',
          duration: 5000
        });
        fetchTransactions();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to approve transaction',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to approve transaction',
        duration: 5000
      });
    } finally {
      setShowApproveModal(false);
      setTransactionToAction(null);
    }
  };

  const confirmReject = async () => {
    if (!transactionToAction || !rejectionReason.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Rejection reason is required',
        duration: 5000
      });
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/transactions/${transactionToAction}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ rejection_reason: rejectionReason.trim() })
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Transaction rejected successfully!',
          duration: 5000
        });
        fetchTransactions();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to reject transaction',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reject transaction',
        duration: 5000
      });
    } finally {
      setShowRejectModal(false);
      setTransactionToAction(null);
      setRejectionReason("");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTransaction) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const updateData: any = {};
      
      if (formData.fees !== "") updateData.fees = parseFloat(formData.fees) || 0;
      if (formData.taxes !== "") updateData.taxes = parseFloat(formData.taxes) || 0;
      if (formData.notes !== undefined) updateData.notes = formData.notes;
      if (formData.settlement_date) updateData.settlement_date = formData.settlement_date;

      const response = await fetch(`/api/admin/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Transaction updated successfully!',
          duration: 5000
        });
        setShowEditModal(false);
        setEditingTransaction(null);
        setFormData({ fees: "", taxes: "", notes: "", settlement_date: "" });
        fetchTransactions();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to update transaction',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update transaction',
        duration: 5000
      });
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "₹0.00";
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, email, company..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-10 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
        >
          <option value="">All Types</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        {(statusFilter || typeFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setTypeFilter("");
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.stock?.company_name || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        transaction.transaction_type === 'buy' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {transaction.transaction_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {transaction.quantity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(transaction.net_amount || transaction.total_amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(transaction.order_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(transaction.id)}
                          className="text-themeTeal hover:text-themeTeal/80"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(transaction.id)}
                              className="text-emerald-600 hover:text-emerald-800"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(transaction.id)}
                              className="text-rose-600 hover:text-rose-800"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Fees/Taxes"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && viewingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTransaction(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingTransaction.transaction_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(viewingTransaction.status)}`}>
                      {viewingTransaction.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingTransaction.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingTransaction.stock?.company_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingTransaction.transaction_type.toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingTransaction.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Unit</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingTransaction.price_per_unit)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingTransaction.total_amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fees</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingTransaction.fees)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Taxes</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingTransaction.taxes)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Net Amount</label>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(viewingTransaction.net_amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingTransaction.payment_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(viewingTransaction.order_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Execution Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(viewingTransaction.execution_date)}</p>
                </div>
                {viewingTransaction.status === 'rejected' && viewingTransaction.rejection_reason && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <p className="mt-1 text-sm text-red-600">{viewingTransaction.rejection_reason}</p>
                  </div>
                )}
                {viewingTransaction.notes && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingTransaction.notes}</p>
                  </div>
                )}
                {viewingTransaction.approvedBy && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Approved By</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {(viewingTransaction.approvedBy.first_name && viewingTransaction.approvedBy.last_name
                        ? `${viewingTransaction.approvedBy.first_name} ${viewingTransaction.approvedBy.last_name}`
                        : viewingTransaction.approvedBy.first_name || viewingTransaction.approvedBy.email)} 
                      {viewingTransaction.admin_approved_at && ` on ${formatDate(viewingTransaction.admin_approved_at)}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTransaction(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Transaction</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                  setFormData({ fees: "", taxes: "", notes: "", settlement_date: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fees (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fees}
                  onChange={(e) => setFormData(prev => ({ ...prev, fees: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                  placeholder={editingTransaction.fees?.toString() || "0.00"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Taxes (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxes}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxes: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                  placeholder={editingTransaction.taxes?.toString() || "0.00"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Settlement Date</label>
                <input
                  type="date"
                  value={formData.settlement_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, settlement_date: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                  placeholder="Add notes..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                    setFormData({ fees: "", taxes: "", notes: "", settlement_date: "" });
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-themeTeal px-4 py-2 text-white hover:bg-themeTeal/90"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setTransactionToAction(null);
        }}
        onConfirm={confirmApprove}
        title="Approve Transaction"
        message="Are you sure you want to approve this transaction? This action cannot be undone."
        confirmText="Approve"
        cancelText="Cancel"
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Reject Transaction</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setTransactionToAction(null);
                  setRejectionReason("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject this transaction? Please provide a reason.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-themeTeal focus:outline-none focus:ring-2 focus:ring-themeTeal/20"
                placeholder="Enter rejection reason..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setTransactionToAction(null);
                  setRejectionReason("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

