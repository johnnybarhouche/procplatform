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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PR Approval: {pr.pr_number}</h1>
        <p className="mt-2 text-gray-600">Review and make approval decision</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PR Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">PR Summary</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pr.status)}`}>
                {pr.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <p className="text-sm text-gray-900">{pr.project_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <p className="text-sm text-gray-900">{pr.supplier.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Value</label>
                <p className="text-sm text-gray-900">{pr.total_value.toLocaleString()} {pr.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created By</label>
                <p className="text-sm text-gray-900">{pr.created_by_name}</p>
              </div>
            </div>

            {pr.comments && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Comments</label>
                <p className="text-sm text-gray-900">{pr.comments}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Line Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pr.line_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.mr_line_item.item_code}</div>
                          <div className="text-sm text-gray-500">{item.mr_line_item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.unit_price.toLocaleString()} {pr.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval History</h2>
              <div className="space-y-4">
                {pr.approvals.map((approval) => (
                  <div key={approval.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{approval.approver_name}</p>
                        <p className="text-sm text-gray-500">Level {approval.approval_level}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          approval.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {approval.status.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-500">
                          {approval.approved_at ? new Date(approval.approved_at).toLocaleDateString() : 
                           approval.rejected_at ? new Date(approval.rejected_at).toLocaleDateString() : 
                           new Date(approval.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {approval.comments && (
                      <p className="mt-2 text-sm text-gray-600">{approval.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approval Form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Decision</h3>
            
            {!action ? (
              <div className="space-y-3">
                <button
                  onClick={() => setAction('approve')}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Approve PR
                </button>
                <button
                  onClick={() => setAction('reject')}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject PR
                </button>
                <button
                  onClick={onCancel}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {action === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection *
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments {action === 'reject' ? '(Optional)' : '(Optional)'}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (action === 'reject' && !reason)}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                      action === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Processing...' : `${action === 'approve' ? 'Approve' : 'Reject'} PR`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Supplier Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{pr.supplier.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{pr.supplier.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900">{pr.supplier.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <p className="text-sm text-gray-900">{pr.supplier.rating}/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
