'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ItemPrice, PriceTrend } from '@/types/procurement';

interface PriceHistoryChartProps {
  itemId: string;
  prices: ItemPrice[];
}

export default function PriceHistoryChart({ itemId, prices: _prices }: PriceHistoryChartProps) {
  const [trends, setTrends] = useState<PriceTrend[]>([]);
  const [statistics, setStatistics] = useState<{
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    priceChangePercent: number;
    dataPoints: number;
  } | null>(null);
  const [supplierComparison, setSupplierComparison] = useState<Array<{
    supplier_name: string;
    trends: PriceTrend[];
    avgPrice: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6months');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  const fetchPriceTrends = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period,
        ...(selectedSupplier && { supplier_id: selectedSupplier })
      });

      const response = await fetch(`/api/items/${itemId}/price-trends?${params}`);
      if (!response.ok) throw new Error('Failed to fetch price trends');
      
      const data = await response.json();
      setTrends(data.trends);
      setStatistics(data.statistics);
      setSupplierComparison(data.supplierComparison);
    } catch (error) {
      console.error('Error fetching price trends:', error);
    } finally {
      setLoading(false);
    }
  }, [itemId, period, selectedSupplier]);

  useEffect(() => {
    fetchPriceTrends();
  }, [fetchPriceTrends]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getUniqueSuppliers = () => {
    const suppliers = [...new Set(trends.map(trend => trend.supplier_name))];
    return suppliers;
  };

  const getPriceChangeColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-status-danger';
    if (changePercent < 0) return 'text-status-success';
    return 'text-brand-text/70';
  };

  const getPriceChangeIcon = (changePercent: number) => {
    if (changePercent > 0) return '↗';
    if (changePercent < 0) return '↘';
    return '→';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-brand-text/80 mb-1">Time Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-brand-text/20 rounded-md px-3 py-2"
          >
            <option value="1month">1 Month</option>
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-text/80 mb-1">Supplier</label>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="border border-brand-text/20 rounded-md px-3 py-2"
          >
            <option value="">All Suppliers</option>
            {getUniqueSuppliers().map(supplier => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-brand-surface p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-brand-text/60">Average Price</div>
            <div className="text-2xl font-bold text-brand-text">
              {formatCurrency(statistics.avgPrice, 'AED')}
            </div>
          </div>
          <div className="bg-brand-surface p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-brand-text/60">Min Price</div>
            <div className="text-2xl font-bold text-brand-text">
              {formatCurrency(statistics.minPrice, 'AED')}
            </div>
          </div>
          <div className="bg-brand-surface p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-brand-text/60">Max Price</div>
            <div className="text-2xl font-bold text-brand-text">
              {formatCurrency(statistics.maxPrice, 'AED')}
            </div>
          </div>
          <div className="bg-brand-surface p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-brand-text/60">Price Change</div>
            <div className={`text-2xl font-bold ${getPriceChangeColor(statistics.priceChangePercent)}`}>
              {getPriceChangeIcon(statistics.priceChangePercent)} {Math.abs(statistics.priceChangePercent).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Price Trends Table */}
      <div className="bg-brand-surface shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-text/10">
          <h3 className="text-lg font-medium text-brand-text">Price History</h3>
        </div>
        
        {trends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-brand-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                    Currency
                  </th>
                </tr>
              </thead>
              <tbody className="bg-brand-surface divide-y divide-gray-200">
                {trends.map((trend, index) => (
                  <tr key={index} className="hover:bg-brand-surface">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-brand-text">
                        {new Date(trend.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-brand-text">{trend.supplier_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-brand-text">
                        {formatCurrency(trend.price, trend.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-brand-text">{trend.currency}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-brand-text/60">No price history available for the selected period</p>
          </div>
        )}
      </div>

      {/* Supplier Comparison */}
      {supplierComparison.length > 1 && (
        <div className="bg-brand-surface shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-text/10">
            <h3 className="text-lg font-medium text-brand-text">Supplier Comparison</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplierComparison.map((supplier, index) => (
                <div key={index} className="bg-brand-surface p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-brand-text">{supplier.supplier_name}</h4>
                    <span className="text-sm text-brand-text/60">
                      {supplier.trends.length} price(s)
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-brand-text/60">Avg Price:</span>
                      <span className="text-sm font-medium text-brand-text">
                        {formatCurrency(supplier.avgPrice, 'AED')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-brand-text/60">Latest:</span>
                      <span className="text-sm font-medium text-brand-text">
                        {supplier.trends.length > 0 && formatCurrency(supplier.trends[supplier.trends.length - 1].price, 'AED')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
