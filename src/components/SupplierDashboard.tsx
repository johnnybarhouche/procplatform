'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Supplier, SupplierDashboardProps } from '@/types/procurement';
import { PageLayout } from '@/components/layout/PageLayout';

export default function SupplierDashboard({ userRole }: SupplierDashboardProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    isActive: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.isActive && { is_active: filters.isActive })
      });

      const response = await fetch(`/api/suppliers?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const data = await response.json();
      setSuppliers(data.suppliers || data);
      setPagination(prev => ({ ...prev, total: data.total || data.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-status-warning/10 text-yellow-800',
      approved: 'bg-status-success/10 text-green-800',
      suspended: 'bg-status-danger/10 text-red-800',
      inactive: 'bg-brand-surface text-brand-text/90'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-brand-surface text-brand-text/90';
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading suppliers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
        <button 
          onClick={fetchSuppliers}
          className="mt-2 px-4 py-2 bg-status-danger text-white rounded-md hover:bg-status-danger/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <PageLayout 
      title="Supplier Management"
      actions={
        userRole === 'procurement' || userRole === 'admin' ? (
          <button className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90">
            Add Supplier
          </button>
        ) : null
      }
    >

      {/* Filters */}
      <div className="bg-brand-surface p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-brand-text/20 rounded-md px-3 py-2"
            >
              <option value="">All Categories</option>
              <option value="Construction Materials">Construction Materials</option>
              <option value="Electrical Equipment">Electrical Equipment</option>
              <option value="Industrial Equipment">Industrial Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-brand-text/20 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Active Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full border border-brand-text/20 rounded-md px-3 py-2"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search suppliers..."
              className="w-full border border-brand-text/20 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-brand-surface shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-brand-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Supplier Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-brand-surface divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-brand-surface">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brand-text">{supplier.supplier_code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-brand-text">{supplier.name}</div>
                      <div className="text-sm text-brand-text/60">{supplier.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    {supplier.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-400">{getRatingStars(supplier.rating)}</span>
                      <span className="ml-2 text-sm text-brand-text">{supplier.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    <div>Quotes: {supplier.quote_count}</div>
                    <div className="text-xs text-brand-text/60">Avg Response: {supplier.avg_response_time}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-brand-primary hover:text-blue-900 mr-3">
                      View
                    </button>
                    {(userRole === 'procurement' || userRole === 'admin') && (
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="bg-brand-surface px-4 py-3 flex items-center justify-between border-t border-brand-text/10 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-brand-text/20 text-sm font-medium rounded-md text-brand-text/80 bg-brand-surface hover:bg-brand-surface disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-brand-text/20 text-sm font-medium rounded-md text-brand-text/80 bg-brand-surface hover:bg-brand-surface disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-brand-text/80">
                  Showing{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-brand-text/20 bg-brand-surface text-sm font-medium text-brand-text/60 hover:bg-brand-surface disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-brand-text/20 bg-brand-surface text-sm font-medium text-brand-text/60 hover:bg-brand-surface disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
