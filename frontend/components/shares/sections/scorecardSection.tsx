'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScorecardData {
  id: number;
  category: string;
  score_value: number;
  score_tag: 'Low Risk' | 'Medium Risk' | 'High Risk';
  analysis: string;
}

interface ScorecardSectionProps {
  stockId?: number;
}

export default function ScorecardSection({ stockId }: ScorecardSectionProps) {
  const [scorecards, setScorecards] = useState<ScorecardData[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScorecards = async () => {
      if (!stockId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/${stockId}/scorecards`);
        const data = await response.json();
        
        if (data.success) {
          setScorecards(data.data.scorecards || []);
        } else {
          setError(data.message || 'Failed to fetch scorecards');
        }
      } catch (err) {
        setError('Failed to fetch scorecards');
        console.error('Error fetching scorecards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScorecards();
  }, [stockId]);

  const toggleCard = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const getRiskTagColor = (tag: string) => {
    switch (tag) {
      case 'Low Risk':
        return 'bg-green-500 text-white';
      case 'Medium Risk':
        return 'bg-yellow-500 text-white';
      case 'High Risk':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score < 5) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 8) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score < 5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-4 bg-gray-300 rounded"></div>
                <div className="w-20 h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
      ))}
    </div>
  );
}

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (scorecards.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No scorecard data available for this stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scorecards.map((scorecard) => (
        <div
          key={scorecard.id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* Card Header */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleCard(scorecard.id)}
          >
            <div className="flex items-center space-x-3">
              {expandedCard === scorecard.id ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <h3 className="font-medium text-sm text-gray-800">{scorecard.category}</h3>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-1 py-0.5 rounded text-xs font-light ${getRiskTagColor(scorecard.score_tag)}`} style={{ fontSize: '9px' }}>
                {scorecard.score_tag.toUpperCase()}
              </span>
              {getTrendIcon(scorecard.score_value)}
              <span className={`font-medium text-xs px-1.5 py-0.5 rounded border ${getScoreColor(scorecard.score_value)}`}>
                {scorecard.score_value}/10
              </span>
            </div>
          </div>

          {/* Card Content (Analysis) */}
          {expandedCard === scorecard.id && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {scorecard.analysis}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
