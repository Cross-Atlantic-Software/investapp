'use client';

import React, { useState, useEffect } from 'react';
import { StockShareholding } from '../../admin/stocks/types';

interface ShareholderType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ShareholdingSectionProps {
  stockId: string;
}

// Simple pie chart component using CSS
const PieChart: React.FC<{ data: StockShareholding[] }> = ({ data }) => {
  const total = data.reduce((sum, item) => {
    const percentage = typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0;
    return sum + percentage;
  }, 0);
  
  if (total === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No shareholding data available</p>
      </div>
    );
  }

  // Generate colors for pie slices - matching the image colors
  const colors = [
    '#87CEEB', // Light blue (Lithuania)
    '#9370DB', // Purple (Czechia)
    '#8A2BE2', // Darker purple (Ireland)
    '#4B0082', // Even darker purple (Germany)
    '#FF69B4', // Pink (Australia)
    '#FFB6C1', // Light pink (Austria)
    '#DDA0DD', // Lightest pink (UK)
    '#98FB98', // Light green
    '#F0E68C', // Khaki
    '#FFA07A', // Light salmon
  ];

  let cumulativePercentage = 0;

  return (
    <div className="w-full h-80 relative">
      <svg viewBox="0 0 600 500" className="w-full h-full">
        {data.map((item, index) => {
          const itemPercentage = typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0;
          const percentage = (itemPercentage / total) * 100;
          const startAngle = (cumulativePercentage / 100) * 360;
          const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
          
          const startAngleRad = (startAngle - 90) * (Math.PI / 180);
          const endAngleRad = (endAngle - 90) * (Math.PI / 180);
          
          const largeArcFlag = percentage > 50 ? 1 : 0;
          
          const x1 = 300 + 160 * Math.cos(startAngleRad);
          const y1 = 250 + 160 * Math.sin(startAngleRad);
          const x2 = 300 + 160 * Math.cos(endAngleRad);
          const y2 = 250 + 160 * Math.sin(endAngleRad);
          
          const pathData = [
            `M 300 250`,
            `L ${x1} ${y1}`,
            `A 160 160 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          // Calculate label position (outside the pie with better spacing)
          const midAngle = (startAngle + endAngle) / 2;
          const midAngleRad = (midAngle - 90) * (Math.PI / 180);
          
          // Label position (further out with more space)
          const labelX = 300 + 220 * Math.cos(midAngleRad);
          const labelY = 250 + 220 * Math.sin(midAngleRad);

          cumulativePercentage += percentage;

          return (
            <g key={item.id}>
              <path
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="3"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              {/* Label outside the pie */}
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-md font-semibold fill-gray-700"
                fontSize="16"
              >
                {item.holder_name}: {itemPercentage.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default function ShareholdingSection({ stockId }: ShareholdingSectionProps) {
  const [shareholdingData, setShareholdingData] = useState<StockShareholding[]>([]);
  const [shareholderTypes, setShareholderTypes] = useState<ShareholderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShareholdingData();
    loadShareholderTypes();
  }, [stockId]);

  const loadShareholderTypes = async () => {
    try {
      const response = await fetch('/api/shareholder-types');
      const result = await response.json();
      
      if (result.success) {
        setShareholderTypes(result.data || []);
      } else {
        console.error('Failed to load shareholder types:', result.message);
        setShareholderTypes([]);
      }
    } catch (error) {
      console.error('Error loading shareholder types:', error);
    }
  };

  const loadShareholdingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/stocks/${stockId}/shareholding`);
      const result = await response.json();
      
      if (result.success) {
        console.log('Shareholding data received in ShareholdingSection:', result.data);
        setShareholdingData(result.data || []);
      } else {
        setError(result.message || 'Failed to load shareholding data');
      }
    } catch (error) {
      console.error('Error loading shareholding data:', error);
      setError('Failed to load shareholding data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded bg-white p-4 md:p-5">
        <div className="mb-3">
            <h3 className="text-md font-semibold text-themeTeal">Shareholding Distribution</h3>
        </div>
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeTeal"></div>
        </div>
      </div>
      <div className="rounded bg-white p-4 md:p-5">
        <div className="mb-4">
            <h3 className="text-md font-semibold text-themeTeal">Shareholding Details</h3>
        </div>
          <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    </section>
  );
}

  if (error) {
    return (
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded bg-white p-4 md:p-5">
          <div className="mb-3">
            <h3 className="text-md font-semibold text-themeTeal">Shareholding Distribution</h3>
          </div>
          <div className="w-full h-64 flex items-center justify-center text-red-600">
            Error: {error}
          </div>
        </div>
        <div className="rounded bg-white p-4 md:p-5">
          <div className="mb-4">
            <h3 className="text-md font-semibold text-themeTeal">Shareholding Details</h3>
          </div>
          <div className="text-center py-8 text-red-600">Error: {error}</div>
        </div>
      </section>
    );
  }

  if (shareholdingData.length === 0) {
  return (
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded bg-white p-4 md:p-5">
          <div className="mb-3">
            <h3 className="text-md font-semibold text-themeTeal">Shareholding Distribution</h3>
          </div>
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">No shareholding data available</p>
          </div>
        </div>
        <div className="rounded bg-white p-4 md:p-5">
          <div className="mb-4">
            <h3 className="text-md font-semibold text-themeTeal">Shareholding Details</h3>
          </div>
          <div className="text-center py-8 text-gray-500">No shareholding data available</div>
    </div>
      </section>
    );
  }

  const totalPercentage = shareholdingData.reduce((sum, item) => {
    const percentage = typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0;
    return sum + percentage;
  }, 0);

  // Ensure totalPercentage is always a number
  const safeTotalPercentage = typeof totalPercentage === 'number' ? totalPercentage : 0;

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT: PIE CHART */}
      <div className="rounded bg-white p-4 md:p-5">
        <div className="mb-3">
          <h3 className="text-md font-semibold text-themeTeal">
            Shareholding Distribution
          </h3>
        </div>
        <PieChart data={shareholdingData} />
      </div>

      {/* RIGHT: DETAILED TABLE */}
      <div className="rounded bg-white p-4 md:p-5">
        <div className="mb-4">
          <h3 className="text-md font-semibold text-themeTeal">Shareholding Details</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Shareholders</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Holder Type</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Percentage Holding</th>
              </tr>
            </thead>
            <tbody>
              {shareholdingData.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.holder_name}</h4>
                      {item.holder_type && (
                        <p className="text-xs text-gray-600">{item.holder_type}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-sm text-gray-700">
                      {item.shareholder_type_id 
                        ? shareholderTypes.find(type => type.id === item.shareholder_type_id)?.name || 'Unknown Type'
                        : '-'
                      }
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="text-sm font-semibold text-themeTeal">
                      {(typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage) || 0).toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}