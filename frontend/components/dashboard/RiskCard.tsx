"use client";

import { useState, useEffect } from "react";

const cardCls = "rounded bg-white p-4 sm:p-6";

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <p className="text-[15px] font-semibold text-themeTeal">{title}</p>
      {right}
    </div>
  );
}

/* ---------- circular gauge for Risk ---------- */
function RiskRing({ pct }: { pct: number }) {
  const size = 72;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EFF6FB" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#F2B705"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-base font-semibold text-[#F2B705]">{pct}%</span>
      </div>
    </div>
  );
}

export default function RiskCard() {
  const [portfolioData, setPortfolioData] = useState<{
    portfolio_performance_score: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('/api/user-portfolio');

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setPortfolioData(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const getPerformanceScore = () => {
    if (!portfolioData) return 0;
    return typeof portfolioData.portfolio_performance_score === 'string' 
      ? parseFloat(portfolioData.portfolio_performance_score) 
      : portfolioData.portfolio_performance_score;
  };

  const getPerformanceTag = (score: number) => {
    if (score < 40) return { text: 'Below Average', color: 'text-red-600' };
    if (score >= 40 && score < 60) return { text: 'Average', color: 'text-yellow-600' };
    if (score >= 60 && score < 80) return { text: 'Good', color: 'text-blue-600' };
    if (score >= 80 && score < 90) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 90 && score <= 100) return { text: 'Outstanding', color: 'text-purple-600' };
    return { text: 'No Score', color: 'text-gray-500' };
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score >= 40 && score < 60) return 'bg-yellow-500';
    if (score >= 60 && score < 80) return 'bg-blue-500';
    if (score >= 80 && score < 90) return 'bg-green-500';
    if (score >= 90 && score <= 100) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const score = getPerformanceScore();
  const performanceTag = getPerformanceTag(score);
  const riskColor = getRiskColor(score);

  if (loading) {
    return (
      <div className={cardCls}>
        <CardHeader title="Portfolio Performance Score" right={<span className="h-2.5 w-2.5 rounded-full bg-gray-300" />} />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold text-themeTeal">Loading...</div>
            <div className="mt-1 text-sm text-slate-500">Performance Score</div>
            <div className="mt-3 text-sm font-semibold text-gray-500">Loading...</div>
          </div>
          <RiskRing pct={0} />
        </div>
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <CardHeader title="Portfolio Performance Score" right={<span className={`h-2.5 w-2.5 rounded-full ${riskColor}`} />} />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-semibold text-themeTeal">{score.toFixed(1)}</div>
          <div className="mt-1 text-sm text-slate-500">Performance Score</div>
          <div className={`mt-3 text-sm font-semibold ${performanceTag.color}`}>{performanceTag.text}</div>
        </div>
        <RiskRing pct={score} />
      </div>
    </div>
  );
}
