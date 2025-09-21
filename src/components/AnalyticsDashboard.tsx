'use client';

import { useState, useEffect, useCallback } from 'react';
import { KPISummary, AnalyticsFilters } from '@/types/analytics';
import KPICard from './KPICard';
import AnalyticsChart from './AnalyticsChart';

type ChartDataItem = Record<string, string | number | undefined>;

interface AnalyticsDashboardProps {
  userRole: string;
}

export default function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const [kpiData, setKpiData] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });

  const fetchKpiData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.supplierId && { supplierId: filters.supplierId })
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setKpiData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching KPI data:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchKpiData();
  }, [fetchKpiData]);

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
        includeCharts: 'true'
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-brand-text/70">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
            <div className="mt-2 text-sm text-status-danger">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchKpiData}
                className="bg-status-danger/10 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="text-center py-8">
        <p className="text-brand-text/60">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Analytics Dashboard</h1>
          <p className="text-brand-text/70">Comprehensive procurement performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="bg-status-success text-white px-4 py-2 rounded-md hover:bg-status-success/90 focus:ring-2 focus:ring-green-500"
          >
            Export CSV
          </button>
          <button
            onClick={fetchKpiData}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90 focus:ring-2 focus:ring-brand-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-brand-surface p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange({
                dateRange: { ...filters.dateRange, start: e.target.value }
              })}
              className="w-full p-2 border border-brand-text/20 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange({
                dateRange: { ...filters.dateRange, end: e.target.value }
              })}
              className="w-full p-2 border border-brand-text/20 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Project
            </label>
            <select
              value={filters.projectId || ''}
              onChange={(e) => handleFilterChange({ projectId: e.target.value || undefined })}
              className="w-full p-2 border border-brand-text/20 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              <option value="">All Projects</option>
              <option value="project-1">Project Alpha</option>
              <option value="project-2">Project Beta</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total PRs"
          value={kpiData.totalPRs}
          trend="up"
          change={12.5}
        />
        <KPICard
          title="Total POs"
          value={kpiData.totalPOs}
          trend="up"
          change={8.3}
        />
        <KPICard
          title="Total Value"
          value={`$${(kpiData.totalValue / 1000).toFixed(0)}K`}
          trend="up"
          change={15.2}
        />
        <KPICard
          title="Avg Response Time"
          value={`${kpiData.avgResponseTime} days`}
          trend="down"
          change={-5.1}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Monthly Trends</h3>
          <AnalyticsChart
            data={kpiData.monthlyTrends as unknown as ChartDataItem[]}
            type="line"
            config={{
              type: 'line',
              title: 'Monthly Procurement Trends',
              xAxis: 'month',
              yAxis: 'value',
              height: 300
            }}
          />
        </div>
        
        <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-brand-text mb-4">PR vs PO Comparison</h3>
          <AnalyticsChart
            data={kpiData.monthlyTrends as unknown as ChartDataItem[]}
            type="bar"
            config={{
              type: 'bar',
              title: 'PRs vs POs by Month',
              xAxis: 'month',
              yAxis: 'count',
              height: 300
            }}
          />
        </div>
      </div>

      {/* Top Supplier */}
      <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-brand-text mb-4">Top Supplier</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <span className="text-brand-primary font-semibold text-lg">
                {kpiData.topSupplier.charAt(0)}
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-brand-text">{kpiData.topSupplier}</h4>
            <p className="text-brand-text/70">Leading supplier by volume and value</p>
          </div>
        </div>
      </div>
    </div>
  );
}
