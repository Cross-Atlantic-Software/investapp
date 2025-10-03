import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

interface PriceData {
  id: number;
  stock_id: number;
  date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  created_at: string;
  updated_at: string;
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
  label?: string;
}

interface PriceChartProps {
  stockId: number;
  stockName: string;
  currentPrice?: number;
  priceChange?: number;
  percentageChange?: number;
}

type TimeRange = '1D' | '5D' | '1M' | '6M' | '1Y';

const PriceChart: React.FC<PriceChartProps> = ({
  stockId,
  stockName,
  currentPrice = 1560.00,
  priceChange = -390.00,
  percentageChange = -20.00
}) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1M');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Fetch price data
  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/stocks/${stockId}/price-data`);
        const result = await response.json();

        if (result.success) {
          setPriceData(result.data.priceData);
        } else {
          setError(result.message || 'Failed to fetch price data');
        }
      } catch (err) {
        console.error('Error fetching price data:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (stockId) {
      fetchPriceData();
    }
  }, [stockId]);

  // Process chart data based on selected time range
  useEffect(() => {
    if (priceData.length === 0) return;

    let filteredData: PriceData[] = [];

    switch (selectedTimeRange) {
      case '1D':
        // For demo, show last 24 hours (if we had intraday data)
        filteredData = priceData.slice(-1);
        break;
      case '5D':
        filteredData = priceData.slice(-5);
        break;
      case '1M':
        filteredData = priceData.slice(-30);
        break;
      case '6M':
        filteredData = priceData.slice(-180);
        break;
      case '1Y':
        filteredData = priceData.slice(-365);
        break;
      default:
        filteredData = priceData.slice(-30);
    }

    // Format data for chart
    const formattedData = filteredData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      fullDate: item.date,
      price: item.close_price,
      open: item.open_price,
      high: item.high_price,
      low: item.low_price,
      close: item.close_price,
      volume: item.volume
    }));

    setChartData(formattedData);
  }, [priceData, selectedTimeRange]);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1D', label: '1D' },
    { value: '5D', label: '5D' },
    { value: '1M', label: '1M' },
    { value: '6M', label: '6M' },
    { value: '1Y', label: '1Y' }
  ];

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Price: <span className="font-semibold">{formatPrice(data.price)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Volume: <span className="font-semibold">{formatVolume(data.volume)}</span>
          </p>
          <div className="text-xs text-gray-500 mt-1">
            <p>Open: {formatPrice(data.open)}</p>
            <p>High: {formatPrice(data.high)}</p>
            <p>Low: {formatPrice(data.low)}</p>
            <p>Close: {formatPrice(data.close)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Price Data Available</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <p className="text-xs text-gray-500">
            Upload CSV price data from the admin panel to view charts.
          </p>
        </div>
      </div>
    );
  }

  if (priceData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Price Data Available</h3>
          <p className="text-sm text-gray-600 mb-4">
            No historical price data found for {stockName}.
          </p>
          <p className="text-xs text-gray-500">
            Upload CSV price data from the admin panel to view charts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{stockName}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            <div className={`flex items-center space-x-1 ${
              priceChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {priceChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {priceChange >= 0 ? '+' : ''}{formatPrice(Math.abs(priceChange))}
              </span>
              <span className="text-sm">
                ({percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">As of {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-1 mb-6">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => setSelectedTimeRange(range.value)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              selectedTimeRange === range.value
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          Showing {chartData.length} data points for {selectedTimeRange} time range
        </p>
        {chartData.length > 0 && (
          <p className="mt-1">
            Price range: {formatPrice(Math.min(...chartData.map(d => d.price)))} - {formatPrice(Math.max(...chartData.map(d => d.price)))}
          </p>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
