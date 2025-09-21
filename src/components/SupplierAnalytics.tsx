'use client';

import { useState, useEffect, useCallback } from 'react';
import { type SupplierAnalytics, AnalyticsFilters } from '@/types/analytics';
import AnalyticsChart from './AnalyticsChart';

type ChartDataItem = Record<string, string | number | undefined>;

interface SupplierAnalyticsProps {
  userRole: string;
}

export default function SupplierAnalytics({ userRole }: SupplierAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SupplierAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });

  const fetchSupplierAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.category && { category: filters.category })
      });

      const response = await fetch(`/api/analytics/suppliers?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch supplier analytics data');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching supplier analytics:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSupplierAnalytics();
  }, [fetchSupplierAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-brand-text/70">Loading supplier analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading supplier analytics</h3>
            <div className="mt-2 text-sm text-status-danger">
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
        <p className="text-brand-text/60">No supplier analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-text">Supplier Analytics</h2>
          <p className="text-brand-text/70">Supplier performance and spend analysis</p>
        </div>
        <button
          onClick={fetchSupplierAnalytics}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 focus:ring-2 focus:ring-brand-primary"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-brand-primary">{analytics.totalSuppliers}</div>
          <div className="text-sm text-brand-text/70">Total Suppliers</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-success">{analytics.activeSuppliers}</div>
          <div className="text-sm text-brand-text/70">Active Suppliers</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-warning">
            {((analytics.activeSuppliers / analytics.totalSuppliers) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-brand-text/70">Active Rate</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            ${(analytics.shareOfSpend.reduce((sum, s) => sum + s.spend, 0) / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-brand-text/70">Total Spend</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Share of Spend</h3>
          <AnalyticsChart
            data={analytics.shareOfSpend as unknown as ChartDataItem[]}
            type="pie"
            config={{
              type: 'pie',
              title: 'Spend Distribution',
              height: 300
            }}
          />
        </div>
        
        <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Top Suppliers by Spend</h3>
          <AnalyticsChart
            data={analytics.shareOfSpend.slice(0, 5) as unknown as ChartDataItem[]}
            type="bar"
            config={{
              type: 'bar',
              title: 'Top 5 Suppliers',
              xAxis: 'supplierName',
              yAxis: 'spend',
              height: 300
            }}
          />
        </div>
      </div>

      {/* Performance Rankings */}
      <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Performance Rankings</h3>
        <div className="space-y-3">
          {analytics.performanceRankings.map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-brand-surface rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-brand-primary font-semibold text-sm">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-brand-text">{supplier.supplierName}</p>
                  <p className="text-sm text-brand-text/70">
                    Rating: {supplier.rating}/5.0
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-brand-text">
                  ${(supplier.totalSpend / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-brand-text/70">
                  {(supplier.responseRate * 100).toFixed(1)}% response
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary">
              {analytics.performanceRankings.length > 0 ? 
                analytics.performanceRankings[0].rating.toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-brand-text/70">Top Supplier Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-status-success">
              {analytics.performanceRankings.length > 0 ? 
                (analytics.performanceRankings[0].responseRate * 100).toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-brand-text/70">Best Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-status-warning">
              {analytics.performanceRankings.length > 0 ? 
                (analytics.performanceRankings[0].onTimeDelivery * 100).toFixed(1) : '0.0'}%
            </div>
            <div className="text-sm text-brand-text/70">Best On-Time Delivery</div>
          </div>
        </div>
      </div>
    </div>
  );
}
