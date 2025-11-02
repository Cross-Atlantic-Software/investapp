// components/dashboard/AuditTrailTable.tsx
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type AuditRow = {
  id: string;
  date: string;
  time?: string;
  description: string;
  account: string;
  debit?: number;
  credit?: number;
  balance?: number;
  status: "Completed" | "Failed" | "Processing" | "Pending" | "Rejected";
};

// Transaction interface to match what we get from API
interface TransactionData {
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
  execution_date?: string | null;
  company_name: string;
}

interface AuditTrailTableProps {
  transactions?: TransactionData[];
  heading?: string;
  pageSize?: number;
}

export default function AuditTrailTable({
  transactions = [],
  heading = "Audit Trail",
  pageSize = 10,
}: AuditTrailTableProps) {
  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Convert transactions to AuditRow format
  const rows: AuditRow[] = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Sort transactions by order_date (oldest first) for proper balance calculation
    const sortedTransactions = [...transactions].sort((a, b) => {
      return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
    });

    return sortedTransactions.map((txn, index) => {
      const orderDate = new Date(txn.order_date);
      const dateStr = orderDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = orderDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });

      const description = `${txn.transaction_type === 'buy' ? 'Purchase' : 'Sale'} of ${txn.quantity} shares - ${txn.company_name}`;
      const netAmount = txn.net_amount || txn.total_amount;
      
      // Calculate running balance starting from 0
      // Note: This is a simplified calculation - in production you'd want actual wallet balance history
      let runningBalance = 0;
      for (let i = 0; i <= index; i++) {
        const amt = Number(sortedTransactions[i].net_amount || sortedTransactions[i].total_amount);
        if (sortedTransactions[i].transaction_type === 'buy') {
          runningBalance -= amt; // Debit for buy
        } else {
          runningBalance += amt; // Credit for sell
        }
      }

      const statusMap: Record<string, AuditRow["status"]> = {
        'completed': 'Completed',
        'pending': 'Processing',
        'rejected': 'Failed'
      };

      return {
        id: txn.transaction_id,
        date: dateStr,
        time: timeStr,
        description,
        account: "Investment Securities",
        debit: txn.transaction_type === 'buy' ? Number(netAmount) : undefined,
        credit: txn.transaction_type === 'sell' ? Number(netAmount) : undefined,
        balance: runningBalance,
        status: statusMap[txn.status] || 'Processing'
      };
    });
  }, [transactions]);

  // Filter by search query
  const searchFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.description.toLowerCase().includes(s) ||
        r.account.toLowerCase().includes(s) ||
        r.date.toLowerCase().includes(s) ||
        r.id.toLowerCase().includes(s)
    );
  }, [q, rows]);

  // Filter by date range using original transaction order_date
  const filtered = useMemo(() => {
    let result = searchFiltered;
    
    if (startDate || endDate) {
      result = searchFiltered.filter((r) => {
        // Get the original transaction to access order_date timestamp
        const originalTxn = transactions.find(t => t.transaction_id === r.id);
        if (!originalTxn) return true; // If transaction not found, include it
        
        const txnDate = new Date(originalTxn.order_date);
        txnDate.setHours(0, 0, 0, 0);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (txnDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (txnDate > end) return false;
        }
        
        return true;
      });
    }
    
    return result;
  }, [searchFiltered, startDate, endDate, transactions]);

  // Reverse order for display (newest first) but keep balance calculation chronological
  const displayRows = useMemo(() => {
    // Reverse filtered rows to show newest first
    return [...filtered].reverse();
  }, [filtered]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(displayRows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = displayRows.slice(start, start + pageSize);

  const pagesToShow = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let p = Math.max(2, page - 1);
      p <= Math.min(totalPages - 1, page + 1);
      p++
    )
      pages.push(p);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  const go = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

  // Download functions
  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Add title
      pdf.setFontSize(16);
      pdf.text(heading, 14, 10);

      // Add date filter info if applied
      let filterText = 'All Transactions';
      if (startDate || endDate) {
        filterText = `Filtered: ${startDate || 'Start'} to ${endDate || 'End'}`;
      }
      pdf.setFontSize(10);
      pdf.text(filterText, 14, 16);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

      // Table headers
      const headers = ['Date/Time', 'Transaction ID', 'Description', 'Account', 'Debit', 'Credit', 'Status'];
      const colWidths = [35, 30, 60, 40, 25, 25, 30];
      let yPos = 30;

      // Draw header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      let xPos = 14;
      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPos);
        xPos += colWidths[i];
      });

      yPos += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      // Draw rows (use filtered data, chronological order)
      filtered.forEach((row) => {
        if (yPos > 180) {
          pdf.addPage();
          yPos = 20;
        }

        xPos = 14;
        const rowData = [
          `${row.date} ${row.time || ''}`,
          row.id,
          row.description.substring(0, 40) + (row.description.length > 40 ? '...' : ''),
          row.account,
          row.debit ? `₹${row.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-',
          row.credit ? `₹${row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-',
          row.status
        ];

        rowData.forEach((data, i) => {
          pdf.text(String(data), xPos, yPos);
          xPos += colWidths[i];
        });

        yPos += 8;
      });

      const filename = `audit-trail-${startDate ? startDate : 'all'}-${endDate || new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadXLSX = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Prepare data (use filtered rows, chronological order)
      const worksheetData = filtered.map((row) => ({
        'Date': row.date,
        'Time': row.time || '',
        'Transaction ID': row.id,
        'Description': row.description,
        'Account': row.account,
        'Debit': row.debit ? `₹${row.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '',
        'Credit': row.credit ? `₹${row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '',
        'Balance': row.balance ? `₹${row.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '',
        'Status': row.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Trail');

      // Auto-size columns
      const maxWidth = 50;
      const wscols = [
        { wch: 12 }, // Date
        { wch: 10 }, // Time
        { wch: 20 }, // Transaction ID
        { wch: maxWidth }, // Description
        { wch: 20 }, // Account
        { wch: 15 }, // Debit
        { wch: 15 }, // Credit
        { wch: 15 }, // Balance
        { wch: 12 }  // Status
      ];
      worksheet['!cols'] = wscols;

      const filename = `audit-trail-${startDate ? startDate : 'all'}-${endDate || new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error generating XLSX:', error);
      alert('Failed to generate XLSX. Please try again.');
    }
  };

  const handleDownloadCSV = () => {
    try {
      // CSV header
      const headers = ['Date', 'Time', 'Transaction ID', 'Description', 'Account', 'Debit', 'Credit', 'Balance', 'Status'];
      const csvRows = [headers.join(',')];

      // CSV rows (use filtered data, chronological order)
      filtered.forEach((row) => {
        const csvRow = [
          `"${row.date}"`,
          `"${row.time || ''}"`,
          `"${row.id}"`,
          `"${row.description.replace(/"/g, '""')}"`, // Escape quotes
          `"${row.account}"`,
          row.debit ? `"₹${row.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}"` : '""',
          row.credit ? `"₹${row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}"` : '""',
          row.balance ? `"₹${row.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}"` : '""',
          `"${row.status}"`
        ];
        csvRows.push(csvRow.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      const filename = `audit-trail-${startDate ? startDate : 'all'}-${endDate || new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV. Please try again.');
    }
  };

  return (
    <section className="rounded bg-white p-3 sm:p-4">
      {/* header */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-themeTeal">{heading}</h3>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {/* search */}
          <label className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-themeTealLighter" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1); // reset page on search
              }}
              placeholder="Search here..."
              className="w-full rounded border border-themeTealLighter pl-8 pr-3 py-2 text-sm outline-none"
            />
          </label>

          {/* downloads */}
          <div className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4 text-themeTeal/80" />
            <span className="text-themeTealLighter">Download</span>
            <button 
              onClick={handleDownloadPDF}
              className="text-themeTeal hover:underline cursor-pointer"
            >
              PDF
            </button>
            <span className="text-themeTealLighter">or</span>
            <button 
              onClick={handleDownloadXLSX}
              className="text-themeTeal hover:underline cursor-pointer"
            >
              XLSX
            </button>
            <span className="text-themeTealLighter">|</span>
            <button 
              onClick={handleDownloadCSV}
              className="text-themeTeal hover:underline cursor-pointer"
            >
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="mb-3 flex flex-row gap-2 items-center justify-between flex-wrap">
        <p className="text-themeTeal font-semibold">Transactions ({filtered.length})</p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="rounded border border-themeTealLighter px-3 py-2 text-sm text-themeTeal outline-none"
            placeholder="Start Date"
          />
          <span className="text-themeTealLighter">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="rounded border border-themeTealLighter px-3 py-2 text-sm text-themeTeal outline-none"
            placeholder="End Date"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="rounded border border-themeTealLighter px-3 py-2 text-sm text-themeTeal hover:bg-themeTealWhite"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* table */}
      <div className="-mx-2 overflow-x-auto sm:mx-0">
        <table className="min-w-[880px] w-full text-left">
          <thead>
            <tr className="border-b text-themeTealLight">
              <Th>Date/Time</Th>
              <Th>Description</Th>
              <Th>Account</Th>
              <Th className="text-right">Debit</Th>
              <Th className="text-right">Credit</Th>
              <Th className="text-right">Balance</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? (
              pageRows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <Td>
                    <div>{r.date}</div>
                    {r.time && (
                      <div className="text-xs text-themeTealLighter">{r.time}</div>
                    )}
                  </Td>
                  <Td className="text-themeTeal">{r.description}</Td>
                  <Td>{r.account}</Td>
                  <Td className="text-right">
                    {r.debit ? `₹${fmt(r.debit)}` : "-"}
                  </Td>
                  <Td className="text-right">
                    {r.credit ? `₹${fmt(r.credit)}` : "-"}
                  </Td>
                  <Td className="text-right">
                    {r.balance !== undefined ? `₹${fmt(Math.abs(r.balance))}` : "-"}
                  </Td>
                  <Td>
                    <StatusPill status={r.status} />
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan={7} className="text-center py-8 text-themeTealLighter">
                  {transactions.length === 0 ? 'No transactions found' : 'No transactions match the selected filters'}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 p-4">
          <button
            onClick={() => go(page - 1)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite disabled:opacity-40 transition duration-500 cursor-pointer"
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          {pagesToShow.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-themeTealLighter">
                …
              </span>
            ) : (
              <button
                key={`p-${p}`}
                onClick={() => go(p as number)}
                className={`min-w-[32px] rounded px-2 py-1 text-sm cursor-pointer transition duration-500 ${
                  p === page
                    ? "bg-themeSkyBlue text-themeTealWhite"
                    : "text-themeTeal hover:bg-themeSkyBlue hover:text-themeTealWhite"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => go(page + 1)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-themeTeal hover:bg-themeTeal hover:text-themeTealWhite disabled:opacity-40 transition duration-500 cursor-pointer"
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </section>
  );
}

/* helpers */
function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th className={["px-3 py-3 text-sm font-medium", className].join(" ")}>
      {children}
    </th>
  );
}

function Td({ children, className = "", colSpan }: { children: ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={["px-3 py-4 text-sm text-themeTeal", className].join(" ")}>
      {children}
    </td>
  );
}

function StatusPill({ status }: { status: AuditRow["status"] }) {
  const map = {
    Completed: "bg-emerald-700 text-themeTealWhite",
    Failed: "bg-rose-700 text-themeTealWhite",
    Processing: "bg-amber-500 text-themeTealWhite",
    Pending: "bg-amber-500 text-themeTealWhite",
    Rejected: "bg-rose-700 text-themeTealWhite",
  } as const;
  return (
    <span
      className={[
        "inline-flex items-center rounded px-2 py-1 text-xs font-semibold",
        map[status] || "bg-gray-500 text-themeTealWhite",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
