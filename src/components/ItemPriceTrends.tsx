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
          <p className="mt-4 text-brand-text/70">Loading price trends...</p>
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
            <div className="mt-2 text-sm text-status-danger">
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
        <p className="text-brand-text/60">No price trends data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-text">Item Price Trends</h2>
          <p className="text-brand-text/70">Historical pricing analysis and trends</p>
        </div>
        <button
          onClick={fetchPriceTrends}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 focus:ring-2 focus:ring-brand-primary"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-brand-primary">{trends.length}</div>
          <div className="text-sm text-brand-text/70">Items Tracked</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-success">
            {trends.filter(t => t.priceChange > 0).length}
          </div>
          <div className="text-sm text-brand-text/70">Price Increases</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-danger">
            {trends.filter(t => t.priceChange < 0).length}
          </div>
          <div className="text-sm text-brand-text/70">Price Decreases</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-warning">
            {trends.filter(t => t.priceChange === 0).length}
          </div>
          <div className="text-sm text-brand-text/70">Stable Prices</div>
        </div>
      </div>

      {/* Price Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trends.slice(0, 4).map((trend, index) => (
          <div key={index} className="bg-brand-surface p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-text">{trend.itemName}</h3>
                <p className="text-sm text-brand-text/70">{trend.itemCode}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  trend.priceChange > 0 ? 'text-status-danger' : 
                  trend.priceChange < 0 ? 'text-status-success' : 'text-brand-text/70'
                }`}>
                  ${trend.currentPrice}
                </div>
                <div className={`text-sm ${
                  trend.priceChange > 0 ? 'text-status-danger' : 
                  trend.priceChange < 0 ? 'text-status-success' : 'text-brand-text/70'
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
      <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">All Items Price Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-brand-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Data Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-brand-surface divide-y divide-gray-200">
              {trends.map((trend, index) => (
                <tr key={index} className="hover:bg-brand-surface">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-brand-text">{trend.itemName}</div>
                      <div className="text-sm text-brand-text/60">{trend.itemCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brand-text">${trend.currentPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      trend.priceChange > 0 ? 'text-status-danger' : 
                      trend.priceChange < 0 ? 'text-status-success' : 'text-brand-text/70'
                    }`}>
                      {trend.priceChange > 0 ? '+' : ''}${trend.priceChange} ({trend.priceChangePercent > 0 ? '+' : ''}{trend.priceChangePercent.toFixed(1)}%)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {trend.priceChange > 0 ? (
                        <span className="text-status-danger">↗️ Rising</span>
                      ) : trend.priceChange < 0 ? (
                        <span className="text-status-success">↘️ Falling</span>
                      ) : (
                        <span className="text-brand-text/70">→ Stable</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brand-text">{trend.priceHistory.length}</div>
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
