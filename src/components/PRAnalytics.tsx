'use client';

import { useState, useEffect, useCallback } from 'react';
import { type PRAnalytics, AnalyticsFilters } from '@/types/analytics';
import AnalyticsChart from './AnalyticsChart';

type ChartDataItem = Record<string, string | number | undefined>;

interface PRAnalyticsProps {
  userRole: string;
}

export default function PRAnalytics({ userRole }: PRAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PRAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });

  const fetchPRAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        ...(filters.projectId && { projectId: filters.projectId })
      });

      const response = await fetch(`/api/analytics/prs?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch PR analytics data');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching PR analytics:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPRAnalytics();
  }, [fetchPRAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-brand-text/70">Loading PR analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading PR analytics</h3>
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
        <p className="text-brand-text/60">No PR analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-brand-text">PR Analytics</h2>
          <p className="text-brand-text/70">Purchase Requisition performance metrics</p>
        </div>
        <button
          onClick={fetchPRAnalytics}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 focus:ring-2 focus:ring-brand-primary"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-brand-primary">{analytics.totalPRs}</div>
          <div className="text-sm text-brand-text/70">Total PRs</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-warning">{analytics.pendingPRs}</div>
          <div className="text-sm text-brand-text/70">Pending</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-success">{analytics.approvedPRs}</div>
          <div className="text-sm text-brand-text/70">Approved</div>
        </div>
        <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-status-danger">{analytics.rejectedPRs}</div>
          <div className="text-sm text-brand-text/70">Rejected</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Monthly PR Trends</h3>
          <AnalyticsChart
            data={analytics.monthlyTrends as unknown as ChartDataItem[]}
            type="line"
            config={{
              type: 'line',
              title: 'PRs by Month',
              xAxis: 'month',
              yAxis: 'prs',
              height: 300
            }}
          />
        </div>
        
        <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-brand-text mb-4">PR Status Distribution</h3>
          <AnalyticsChart
            data={[
              { label: 'Approved', value: analytics.approvedPRs },
              { label: 'Pending', value: analytics.pendingPRs },
              { label: 'Rejected', value: analytics.rejectedPRs }
            ]}
            type="pie"
            config={{
              type: 'pie',
              title: 'PR Status',
              height: 300
            }}
          />
        </div>
      </div>

      {/* Top Requesters */}
      <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Top Requesters</h3>
        <div className="space-y-3">
          {analytics.topRequesters.map((requester, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-brand-surface rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-brand-primary font-semibold text-sm">
                    {requester.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-brand-text">{requester.name}</p>
                  <p className="text-sm text-brand-text/70">{requester.count} PRs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-brand-text">
                  ${(requester.totalValue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-brand-text/70">Total Value</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Time */}
      <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Processing Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-primary">{analytics.avgProcessingTime}</div>
            <div className="text-sm text-brand-text/70">Avg Processing Time (days)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-status-success">
              {((analytics.approvedPRs / analytics.totalPRs) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-brand-text/70">Approval Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-status-warning">
              {((analytics.pendingPRs / analytics.totalPRs) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-brand-text/70">Pending Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
