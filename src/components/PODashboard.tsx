'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder, PODashboardProps } from '@/types/procurement';

export default function PODashboard({ userRole }: PODashboardProps) {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterSupplier, setFilterSupplier] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPOs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterStatus && { status: filterStatus }),
        ...(filterProject && { project_id: filterProject }),
        ...(filterSupplier && { supplier_id: filterSupplier }),
      });

      const response = await fetch(`/api/pos?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch POs');
      }

      const data = await response.json();
      setPos(data.pos);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching POs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterProject, filterSupplier]);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  const handleStatusChange = (poId: string, newStatus: string) => {
    // This would typically call an API to update the PO status
    console.log(`Updating PO ${poId} status to ${newStatus}`);
  };

  const handleSendToSupplier = (poId: string) => {
    // This would typically call an API to send the PO to supplier
    console.log(`Sending PO ${poId} to supplier`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-brand-surface text-brand-text/90';
      case 'sent': return 'bg-brand-primary/10 text-blue-800';
      case 'acknowledged': return 'bg-status-warning/10 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-status-success/10 text-green-800';
      case 'invoiced': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-brand-surface text-brand-text/90';
    }
  };

  const filteredPOs = pos.filter(po => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        po.po_number.toLowerCase().includes(searchLower) ||
        po.project_name.toLowerCase().includes(searchLower) ||
        po.supplier.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const sortedPOs = [...filteredPOs].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'po_number':
        aValue = a.po_number;
        bValue = b.po_number;
        break;
      case 'total_value':
        aValue = a.total_value;
        bValue = b.total_value;
        break;
      case 'created_at':
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text">Purchase Orders</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchPOs()}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-brand-surface p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PO number, project, or supplier..."
              className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="invoiced">Invoiced</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Project
            </label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All Projects</option>
              <option value="1">Project Alpha</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="created_at">Created Date</option>
              <option value="po_number">PO Number</option>
              <option value="total_value">Total Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* PO List */}
      <div className="bg-brand-surface shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-brand-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-brand-surface divide-y divide-gray-200">
              {sortedPOs.map((po) => (
                <tr key={po.id} className="hover:bg-brand-surface">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text">
                    {po.po_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text/60">
                    {po.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text/60">
                    {po.supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text/60">
                    {po.total_value.toLocaleString()} {po.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(po.status)}`}>
                      {po.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text/60">
                    {new Date(po.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/pos/${po.id}`, '_blank')}
                        className="text-brand-primary hover:text-blue-900"
                      >
                        View
                      </button>
                      {po.status === 'draft' && (
                        <button
                          onClick={() => handleSendToSupplier(po.id)}
                          className="text-status-success hover:text-green-900"
                        >
                          Send
                        </button>
                      )}
                      {po.status === 'sent' && (
                        <button
                          onClick={() => handleStatusChange(po.id, 'acknowledged')}
                          className="text-status-warning hover:text-yellow-900"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-brand-surface px-4 py-3 flex items-center justify-between border-t border-brand-text/10 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-brand-text/20 text-sm font-medium rounded-md text-brand-text/80 bg-brand-surface hover:bg-brand-surface disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-brand-text/20 text-sm font-medium rounded-md text-brand-text/80 bg-brand-surface hover:bg-brand-surface disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-brand-text/80">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-brand-text/20 bg-brand-surface text-sm font-medium text-brand-text/60 hover:bg-brand-surface disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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
    </div>
  );
}

