"use client";

import { useState, useEffect } from "react";
import { FinancialPerformanceSectionProps, FinancialDataResponse, StockFinancialData } from '../../admin/stocks/types';

export default function FinancialPerformanceSection({ stockId }: FinancialPerformanceSectionProps) {
  const [activeTab, setActiveTab] = useState<"income_statement" | "balance_sheet" | "cash_flow">("income_statement");
  const [financialData, setFinancialData] = useState<StockFinancialData[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinancialData();
  }, [stockId, activeTab]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/stocks/${stockId}/financial-data/${activeTab}`);
      const result: FinancialDataResponse = await response.json();
      
      if (result.success) {
        setFinancialData(result.data.kpis);
        setYears(result.data.years);
      } else {
        setError('Failed to load financial data');
      }
    } catch (err) {
      console.error('Error loading financial data:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatYear = (year: number) => {
    return `FY${year.toString().slice(-2)}`;
  };

  const formatValue = (value: number | null, unit: string) => {
    if (value === null || value === undefined) return '-';
    
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getTabLabel = (category: string) => {
    switch (category) {
      case 'income_statement':
        return 'Income Statement';
      case 'balance_sheet':
        return 'Balance Sheet';
      case 'cash_flow':
        return 'Cash Flow';
      default:
        return category;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-themeTeal font-semibold text-lg">Key Financials</div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-themeTeal font-semibold text-lg">Key Financials</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadFinancialData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-themeTeal font-semibold text-lg">Key Financials</div>
        <div className="flex items-center justify-end gap-2">
          <TabBtn 
            active={activeTab === "income_statement"} 
            onClick={() => setActiveTab("income_statement")}
          >
            Income Statement
          </TabBtn>
          <TabBtn 
            active={activeTab === "balance_sheet"} 
            onClick={() => setActiveTab("balance_sheet")}
          >
            Balance Sheet
          </TabBtn>
          <TabBtn 
            active={activeTab === "cash_flow"} 
            onClick={() => setActiveTab("cash_flow")}
          >
            Cash Flow
          </TabBtn>
        </div>
      </div>

      <div className="overflow-x-auto rounded bg-white p-3">
        <table className="min-w-[720px] w-full text-themeTeal">
          <thead>
            <tr className="text-sm text-themeTealLight border-b border-themeTealLighter">
              <th className="text-left py-3 font-medium">(in Rs. Crore)</th>
              {years.map((year) => (
                <th key={year} className="py-3 text-center text-themeTealLight font-medium">
                  {formatYear(year)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {financialData.length === 0 ? (
              <tr>
                <td colSpan={years.length + 1} className="py-8 text-center text-gray-500">
                  No financial data available for {getTabLabel(activeTab)}
                </td>
              </tr>
            ) : (
              financialData.map((kpi) => (
                <tr key={kpi.kpi_id} className="border-b border-themeTealLighter last:border-0">
                  <th className="text-left font-semibold py-4">{kpi.name}</th>
                  {years.map((year) => (
                    <td key={year} className="py-4 text-center text-themeTealLight">
                      {formatValue(kpi.values[year], kpi.unit)}
                    </td>
                ))}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* UI bits */
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded px-4 py-2 text-sm font-semibold cursor-pointer transition duration-500",
        active ? "bg-themeTeal text-white" : "bg-themeTealWhite text-themeTeal border border-themeTealLighter",
      ].join(" ")}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
