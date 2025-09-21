'use client';

import { useState, useEffect, useCallback } from 'react';
import { type RFQAnalytics, AnalyticsFilters } from '@/types/analytics';
import AnalyticsChart from './AnalyticsChart';

type ChartDataItem = Record<string, string | number | undefined>;

interface RFQAnalyticsProps {
  userRole: string;
}

export default function RFQAnalytics({ userRole }: RFQAnalyticsProps) {
  const [analytics, setAnalytics] = useState<RFQAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });

  const fetchRFQAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.supplierId && { supplierId: filters.supplierId })
      });

      const response = await fetch(`/api/analytics/rfqs?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch RFQ analytics data');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching RFQ analytics:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRFQAnalytics();
  }, [fetchRFQAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading RFQ analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading RFQ analytics</h3>
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
        <p className="text-gray-500">No RFQ analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">RFQ Analytics</h2>
          <p className="text-gray-600">Request for Quote performance and supplier engagement</p>
        </div>
        <button
          onClick={fetchRFQAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalRFQs}</div>
          <div className="text-sm text-gray-600">Total RFQs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {(analytics.avgResponseRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Avg Response Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{analytics.avgResponseTime}</div>
          <div className="text-sm text-gray-600">Avg Response Time (days)</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.supplierEngagement.length}
          </div>
          <div className="text-sm text-gray-600">Active Suppliers</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly RFQ Performance</h3>
          <AnalyticsChart
            data={analytics.monthlyPerformance as unknown as ChartDataItem[]}
            type="line"
            config={{
              type: 'line',
              title: 'RFQ Performance Trends',
              xAxis: 'month',
              yAxis: 'responseRate',
              height: 300
            }}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
          <AnalyticsChart
            data={analytics.monthlyPerformance as unknown as ChartDataItem[]}
            type="bar"
            config={{
              type: 'bar',
              title: 'Avg Response Time by Month',
              xAxis: 'month',
              yAxis: 'avgResponseTime',
              height: 300
            }}
          />
        </div>
      </div>

      {/* Supplier Engagement */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Engagement</h3>
        <div className="space-y-3">
          {analytics.supplierEngagement.map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {supplier.supplierName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{supplier.supplierName}</p>
                  <p className="text-sm text-gray-600">{supplier.quoteCount} quotes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {(supplier.responseRate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">
                  {supplier.avgResponseTime} days avg
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
              {analytics.totalRFQs}
            </div>
            <div className="text-sm text-gray-600">Total RFQs Sent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {(analytics.avgResponseRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {analytics.avgResponseTime}
            </div>
            <div className="text-sm text-gray-600">Avg Response Time (days)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
