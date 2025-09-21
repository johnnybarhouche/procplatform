'use client';

import { useState, useEffect, useCallback } from 'react';
import { type POAnalytics, AnalyticsFilters } from '@/types/analytics';
import AnalyticsChart from './AnalyticsChart';

type ChartDataItem = Record<string, string | number | undefined>;

interface POAnalyticsProps {
  userRole: string;
}

export default function POAnalytics({ userRole }: POAnalyticsProps) {
  const [analytics, setAnalytics] = useState<POAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });

  const fetchPOAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.supplierId && { supplierId: filters.supplierId })
      });

      const response = await fetch(`/api/analytics/pos?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch PO analytics data');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching PO analytics:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPOAnalytics();
  }, [fetchPOAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PO analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading PO analytics</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No PO analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">PO Analytics</h2>
          <p className="text-gray-600">Purchase Order spending and performance metrics</p>
        </div>
        <button
          onClick={fetchPOAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalPOs}</div>
          <div className="text-sm text-gray-600">Total POs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            ${(analytics.totalValue / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{analytics.pendingPOs}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{analytics.acknowledgedPOs}</div>
          <div className="text-sm text-gray-600">Acknowledged</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h3>
          <AnalyticsChart
            data={analytics.monthlySpending as unknown as ChartDataItem[]}
            type="bar"
            config={{
              type: 'bar',
              title: 'Spending by Month',
              xAxis: 'month',
              yAxis: 'value',
              height: 300
            }}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PO Status Distribution</h3>
          <AnalyticsChart
            data={[
              { label: 'Sent', value: analytics.sentPOs },
              { label: 'Acknowledged', value: analytics.acknowledgedPOs },
              { label: 'Pending', value: analytics.pendingPOs }
            ]}
            type="pie"
            config={{
              type: 'pie',
              title: 'PO Status',
              height: 300
            }}
          />
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers by Spend</h3>
        <div className="space-y-3">
          {analytics.topSuppliers.map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {supplier.supplierName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{supplier.supplierName}</p>
                  <p className="text-sm text-gray-600">{supplier.poCount} POs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${(supplier.totalSpend / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">
                  {supplier.avgResponseTime} days avg response
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              ${(analytics.totalValue / analytics.totalPOs).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Avg PO Value</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {((analytics.acknowledgedPOs / analytics.totalPOs) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Acknowledgment Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {((analytics.pendingPOs / analytics.totalPOs) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Pending Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
