'use client';

import { useState, useEffect, useCallback } from 'react';
import { type ItemPriceTrends, AnalyticsFilters } from '@/types/analytics';
import AnalyticsChart from './AnalyticsChart';

type ChartDataItem = Record<string, string | number | undefined>;

interface ItemPriceTrendsProps {
  userRole: string;
}

export default function ItemPriceTrends({ userRole }: ItemPriceTrendsProps) {
  const [trends, setTrends] = useState<ItemPriceTrends[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });

  const fetchPriceTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        ...(filters.category && { category: filters.category })
      });

      const response = await fetch(`/api/analytics/items/price-trends?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setTrends(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch price trends data');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching price trends:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPriceTrends();
  }, [fetchPriceTrends]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading price trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading price trends</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No price trends data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Item Price Trends</h2>
          <p className="text-gray-600">Historical pricing analysis and trends</p>
        </div>
        <button
          onClick={fetchPriceTrends}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{trends.length}</div>
          <div className="text-sm text-gray-600">Items Tracked</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {trends.filter(t => t.priceChange > 0).length}
          </div>
          <div className="text-sm text-gray-600">Price Increases</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">
            {trends.filter(t => t.priceChange < 0).length}
          </div>
          <div className="text-sm text-gray-600">Price Decreases</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {trends.filter(t => t.priceChange === 0).length}
          </div>
          <div className="text-sm text-gray-600">Stable Prices</div>
        </div>
      </div>

      {/* Price Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trends.slice(0, 4).map((trend, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{trend.itemName}</h3>
                <p className="text-sm text-gray-600">{trend.itemCode}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  trend.priceChange > 0 ? 'text-red-600' : 
                  trend.priceChange < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  ${trend.currentPrice}
                </div>
                <div className={`text-sm ${
                  trend.priceChange > 0 ? 'text-red-600' : 
                  trend.priceChange < 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {trend.priceChangePercent > 0 ? '+' : ''}{trend.priceChangePercent.toFixed(1)}%
                </div>
              </div>
            </div>
            <AnalyticsChart
              data={trend.priceHistory as unknown as ChartDataItem[]}
              type="line"
              config={{
                type: 'line',
                title: 'Price History',
                xAxis: 'date',
                yAxis: 'price',
                height: 200
              }}
            />
          </div>
        ))}
      </div>

      {/* All Items Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Items Price Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trends.map((trend, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{trend.itemName}</div>
                      <div className="text-sm text-gray-500">{trend.itemCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${trend.currentPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      trend.priceChange > 0 ? 'text-red-600' : 
                      trend.priceChange < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {trend.priceChange > 0 ? '+' : ''}${trend.priceChange} ({trend.priceChangePercent > 0 ? '+' : ''}{trend.priceChangePercent.toFixed(1)}%)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {trend.priceChange > 0 ? (
                        <span className="text-red-600">↗️ Rising</span>
                      ) : trend.priceChange < 0 ? (
                        <span className="text-green-600">↘️ Falling</span>
                      ) : (
                        <span className="text-gray-600">→ Stable</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trend.priceHistory.length}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
