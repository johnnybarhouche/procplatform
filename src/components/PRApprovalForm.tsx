'use client';

import React, { useState } from 'react';
import { PRApprovalFormProps } from '@/types/procurement';

export default function PRApprovalForm({ pr, onApprovalSubmitted, onCancel }: PRApprovalFormProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (action === 'approve') {
        const response = await fetch(`/api/prs/${pr.id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approver_id: 'approver-001', // Mock approver ID
            comments: comments.trim() || undefined,
          }),
        });

        if (response.ok) {
          onApprovalSubmitted(pr.id);
        } else {
          console.error('Error approving PR');
        }
      } else if (action === 'reject') {
        const response = await fetch(`/api/prs/${pr.id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approver_id: 'approver-001', // Mock approver ID
            reason: reason,
            comments: comments.trim() || undefined,
          }),
        });

        if (response.ok) {
          onApprovalSubmitted(pr.id);
        } else {
          console.error('Error rejecting PR');
        }
      }
    } catch (error) {
      console.error('Error submitting approval decision:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-brand-surface text-brand-text/90';
      case 'submitted': return 'bg-brand-primary/10 text-blue-800';
      case 'under_review': return 'bg-status-warning/10 text-yellow-800';
      case 'approved': return 'bg-status-success/10 text-green-800';
      case 'rejected': return 'bg-status-danger/10 text-red-800';
      default: return 'bg-brand-surface text-brand-text/90';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text">PR Approval: {pr.pr_number}</h1>
        <p className="mt-2 text-brand-text/70">Review and make approval decision</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PR Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-brand-text">PR Summary</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pr.status)}`}>
                {pr.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Project</label>
                <p className="text-sm text-brand-text">{pr.project_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Supplier</label>
                <p className="text-sm text-brand-text">{pr.supplier.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Total Value</label>
                <p className="text-sm text-brand-text">{pr.total_value.toLocaleString()} {pr.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Created By</label>
                <p className="text-sm text-brand-text">{pr.created_by_name}</p>
              </div>
            </div>

            {pr.comments && (
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Comments</label>
                <p className="text-sm text-brand-text">{pr.comments}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-brand-text mb-4">Line Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-brand-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-brand-surface divide-y divide-gray-200">
                  {pr.line_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-brand-text">{item.mr_line_item.item_code}</div>
                          <div className="text-sm text-brand-text/60">{item.mr_line_item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                        {item.unit_price.toLocaleString()} {pr.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                        {item.total_price.toLocaleString()} {pr.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval History */}
          {pr.approvals.length > 0 && (
            <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-brand-text mb-4">Approval History</h2>
              <div className="space-y-4">
                {pr.approvals.map((approval) => (
                  <div key={approval.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-brand-text">{approval.approver_name}</p>
                        <p className="text-sm text-brand-text/60">Level {approval.approval_level}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          approval.status === 'approved' ? 'bg-status-success/10 text-green-800' : 'bg-status-danger/10 text-red-800'
                        }`}>
                          {approval.status.toUpperCase()}
                        </span>
                        <p className="text-sm text-brand-text/60">
                          {approval.approved_at ? new Date(approval.approved_at).toLocaleDateString() : 
                           approval.rejected_at ? new Date(approval.rejected_at).toLocaleDateString() : 
                           new Date(approval.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {approval.comments && (
                      <p className="mt-2 text-sm text-brand-text/70">{approval.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approval Form */}
        <div className="space-y-6">
          <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Approval Decision</h3>
            
            {!action ? (
              <div className="space-y-3">
                <button
                  onClick={() => setAction('approve')}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-status-success rounded-md hover:bg-status-success/90 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Approve PR
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-status-danger rounded-md hover:bg-status-danger/90 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject PR
                </button>
                <button
                  onClick={onCancel}
                  className="w-full px-4 py-3 text-sm font-medium text-brand-text/80 bg-brand-surface rounded-md hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {action === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-text/80 mb-2">
                      Reason for Rejection *
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      <option value="">Select a reason</option>
                      <option value="budget_exceeded">Budget Exceeded</option>
                      <option value="supplier_not_qualified">Supplier Not Qualified</option>
                      <option value="specifications_incorrect">Specifications Incorrect</option>
                      <option value="duplicate_request">Duplicate Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-brand-text/80 mb-2">
                    Comments {action === 'reject' ? '(Optional)' : '(Optional)'}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder={`Add comments about your ${action} decision...`}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAction(null);
                      setComments('');
                      setReason('');
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-brand-text/80 bg-brand-surface rounded-md hover:bg-brand-surface focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (action === 'reject' && !reason)}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                      action === 'approve'
                        ? 'bg-status-success hover:bg-status-success/90 focus:ring-green-500'
                        : 'bg-status-danger hover:bg-status-danger/90 focus:ring-red-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Processing...' : `${action === 'approve' ? 'Approve' : 'Reject'} PR`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Supplier Information */}
          <div className="bg-brand-surface p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Supplier Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Name</label>
                <p className="text-sm text-brand-text">{pr.supplier.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Email</label>
                <p className="text-sm text-brand-text">{pr.supplier.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Category</label>
                <p className="text-sm text-brand-text">{pr.supplier.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80">Rating</label>
                <p className="text-sm text-brand-text">{pr.supplier.rating}/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

