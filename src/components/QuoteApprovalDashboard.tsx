'use client';

import React, { useState, useEffect } from 'react';
import { QuoteApproval, QuoteApprovalDashboardProps } from '@/types/procurement';

export default function QuoteApprovalDashboard({ userRole: _userRole }: QuoteApprovalDashboardProps) {
  const [quoteApprovals, setQuoteApprovals] = useState<QuoteApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');

  useEffect(() => {
    fetchQuoteApprovals();
  }, []);

  const fetchQuoteApprovals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quote-approvals');
      const data = await response.json();
      setQuoteApprovals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching quote approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApprovals = (quoteApprovals || []).filter(approval => {
    if (filterStatus === 'all') return true;
    return approval.status === filterStatus;
  });

  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      case 'project':
        return a.quote_pack.rfq.material_request.project_name.localeCompare(b.quote_pack.rfq.material_request.project_name);
      default:
        return 0;
    }
  });

  // const handleApprovalDecision = async (approvalId: string, decision: 'approved' | 'rejected', lineItemDecisions: LineItemDecision[], comments?: string) => {
  //   try {
  //     const response = await fetch(`/api/quote-approvals/${approvalId}`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         decision,
  //         line_item_decisions: lineItemDecisions,
  //         comments
  //       }),
  //     });

  //     if (response.ok) {
  //       await fetchQuoteApprovals(); // Refresh the list
  //     } else {
  //       console.error('Failed to submit approval decision');
  //     }
  //   } catch (error) {
  //     console.error('Error submitting approval decision:', error);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-surface shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-text">Quote Approvals</h1>
              <p className="text-brand-text/70">Review and approve quote packs for your Material Requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-brand-text/20 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-brand-text/20 rounded-md text-sm"
              >
                <option value="created_at">Sort by Date</option>
                <option value="status">Sort by Status</option>
                <option value="project">Sort by Project</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-brand-primary">{(quoteApprovals || []).length}</p>
              <p className="text-sm text-brand-text/70">Total Approvals</p>
            </div>
          </div>
        </div>
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-status-warning/10 rounded-lg">
              <svg className="w-6 h-6 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-status-warning">
                {(quoteApprovals || []).filter(a => a.status === 'pending').length}
              </p>
              <p className="text-sm text-brand-text/70">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-status-success/10 rounded-lg">
              <svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-status-success">
                {(quoteApprovals || []).filter(a => a.status === 'approved').length}
              </p>
              <p className="text-sm text-brand-text/70">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-status-danger/10 rounded-lg">
              <svg className="w-6 h-6 text-status-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-status-danger">
                {(quoteApprovals || []).filter(a => a.status === 'rejected').length}
              </p>
              <p className="text-sm text-brand-text/70">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="bg-brand-surface shadow rounded-lg">
        <div className="px-6 py-4 border-b border-brand-text/10">
          <h3 className="text-lg font-semibold text-brand-text">Quote Approvals</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedApprovals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-brand-text/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-brand-text">No quote approvals</h3>
              <p className="mt-1 text-sm text-brand-text/60">No quote packs are currently pending your approval.</p>
            </div>
          ) : (
            sortedApprovals.map((approval) => (
              <div key={approval.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-lg font-medium text-brand-text">
                          Quote Pack for {approval.quote_pack.rfq.material_request.mrn}
                        </h4>
                        <p className="text-sm text-brand-text/70">
                          Project: {approval.quote_pack.rfq.material_request.project_name}
                        </p>
                        <p className="text-sm text-brand-text/70">
                          Created: {new Date(approval.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          approval.status === 'pending' 
                            ? 'bg-status-warning/10 text-yellow-800'
                            : approval.status === 'approved'
                            ? 'bg-status-success/10 text-green-800'
                            : 'bg-status-danger/10 text-red-800'
                        }`}>
                          {approval.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-brand-text/70">
                        {approval.quote_pack.quotes.length} quotes received • 
                        Total Value: {approval.quote_pack.quotes.reduce((sum, q) => sum + q.total_amount, 0).toLocaleString()} AED
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {approval.status === 'pending' && (
                      <button
                        onClick={() => {
                          // This would open the approval interface
                          console.log('Open approval interface for:', approval.id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md hover:bg-brand-primary/90"
                      >
                        Review & Approve
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // This would open the detailed view
                        console.log('View details for:', approval.id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-brand-text/80 bg-brand-surface border border-brand-text/20 rounded-md hover:bg-brand-surface"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
