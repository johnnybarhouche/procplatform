'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseRequisition, PRDetailViewProps } from '@/types/procurement';

export default function PRDetailView({ prId, userRole }: PRDetailViewProps) {
  const [pr, setPR] = useState<PurchaseRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const fetchPR = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prs/${prId}`);
      const data = await response.json();
      
      if (response.ok) {
        setPR(data);
      } else {
        console.error('Error fetching PR:', data.error);
      }
    } catch (error) {
      console.error('Error fetching PR:', error);
    } finally {
      setLoading(false);
    }
  }, [prId]);

  useEffect(() => {
    fetchPR();
  }, [prId, fetchPR]);

  const handleApprove = async (approverId: string, comments?: string) => {
    try {
      const response = await fetch(`/api/prs/${prId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approver_id: approverId, comments }),
      });
      
      if (response.ok) {
        fetchPR(); // Refresh PR data
        setShowApprovalForm(false);
      } else {
        console.error('Error approving PR');
      }
    } catch (error) {
      console.error('Error approving PR:', error);
    }
  };

  const handleReject = async (approverId: string, reason: string, comments?: string) => {
    try {
      const response = await fetch(`/api/prs/${prId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approver_id: approverId, reason, comments }),
      });
      
      if (response.ok) {
        fetchPR(); // Refresh PR data
        setShowRejectionForm(false);
      } else {
        console.error('Error rejecting PR');
      }
    } catch (error) {
      console.error('Error rejecting PR:', error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Purchase Requisition not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pr.pr_number}</h1>
            <p className="mt-2 text-gray-600">Purchase Requisition Details</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(pr.status)}`}>
              {pr.status.replace('_', ' ').toUpperCase()}
            </span>
            {userRole === 'approver' && (pr.status === 'submitted' || pr.status === 'under_review') && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowApprovalForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectionForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* PR Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">PR Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">PR Number</label>
                <p className="mt-1 text-sm text-gray-900">{pr.pr_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <p className="mt-1 text-sm text-gray-900">{pr.project_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <p className="mt-1 text-sm text-gray-900">{pr.supplier.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Value</label>
                <p className="mt-1 text-sm text-gray-900">{pr.total_value.toLocaleString()} {pr.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created By</label>
                <p className="mt-1 text-sm text-gray-900">{pr.created_by_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(pr.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {pr.comments && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Comments</label>
                <p className="mt-1 text-sm text-gray-900">{pr.comments}</p>
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
                      Item Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pr.line_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.mr_line_item.item_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.mr_line_item.description}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.lead_time_days} days
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

        {/* Sidebar */}
        <div className="space-y-6">
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

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                Download PDF
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100">
                Generate PO
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100">
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Form Modal */}
      {showApprovalForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Purchase Requisition</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleApprove('approver-001', formData.get('comments') as string);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
                <textarea
                  name="comments"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any comments about this approval..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApprovalForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Form Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Purchase Requisition</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleReject('approver-001', formData.get('reason') as string, formData.get('comments') as string);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
                <select
                  name="reason"
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                <textarea
                  name="comments"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide additional details about the rejection..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRejectionForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
