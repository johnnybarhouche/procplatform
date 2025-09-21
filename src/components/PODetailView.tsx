'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PurchaseOrder, PODetailViewProps } from '@/types/procurement';

export default function PODetailView({ poId, userRole }: PODetailViewProps) {
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showAcknowledgeForm, setShowAcknowledgeForm] = useState(false);

  const fetchPO = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pos/${poId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch PO');
      }
      const data = await response.json();
      setPo(data);
    } catch (error) {
      console.error('Error fetching PO:', error);
    } finally {
      setLoading(false);
    }
  }, [poId]);

  useEffect(() => {
    fetchPO();
  }, [fetchPO]);

  const handleSendToSupplier = async () => {
    try {
      const response = await fetch(`/api/pos/${poId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier_email: po?.supplier.email,
          message: 'Please find the attached Purchase Order.',
          sender_id: 'user-002',
          sender_name: 'Jane Smith'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send PO to supplier');
      }

      const result = await response.json();
      console.log('PO sent successfully:', result);
      await fetchPO(); // Refresh PO data
    } catch (error) {
      console.error('Error sending PO to supplier:', error);
    }
  };

  const handleAcknowledge = async (acknowledgmentData: {
    acknowledged_by: string;
    acknowledgment_date: string;
    comments?: string;
    estimated_delivery_date?: string;
  }) => {
    try {
      const response = await fetch(`/api/pos/${poId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(acknowledgmentData),
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge PO');
      }

      const result = await response.json();
      console.log('PO acknowledged successfully:', result);
      await fetchPO(); // Refresh PO data
      setShowAcknowledgeForm(false);
    } catch (error) {
      console.error('Error acknowledging PO:', error);
    }
  };

  const handleStatusUpdate = async (statusData: {
    status: string;
    comments?: string;
    delivery_date?: string;
  }) => {
    try {
      const response = await fetch(`/api/pos/${poId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...statusData,
          actor_id: 'user-002',
          actor_name: 'Jane Smith'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update PO status');
      }

      const result = await response.json();
      console.log('PO status updated successfully:', result);
      await fetchPO(); // Refresh PO data
      setShowStatusForm(false);
    } catch (error) {
      console.error('Error updating PO status:', error);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-text/60">Purchase Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">{po.po_number}</h1>
          <p className="text-brand-text/70">{po.project_name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(po.status)}`}>
            {po.status.replace('_', ' ').toUpperCase()}
          </span>
          <button
            onClick={() => fetchPO()}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* PO Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Basic Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-brand-text/60">PO Number</dt>
              <dd className="text-sm text-brand-text">{po.po_number}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-brand-text/60">Project</dt>
              <dd className="text-sm text-brand-text">{po.project_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-brand-text/60">Supplier</dt>
              <dd className="text-sm text-brand-text">{po.supplier.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-brand-text/60">Total Value</dt>
              <dd className="text-sm text-brand-text">{po.total_value.toLocaleString()} {po.currency}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-brand-text/60">Payment Terms</dt>
              <dd className="text-sm text-brand-text">{po.payment_terms}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-brand-text/60">Delivery Address</dt>
              <dd className="text-sm text-brand-text">{po.delivery_address}</dd>
            </div>
            {po.delivery_date && (
              <div>
                <dt className="text-sm font-medium text-brand-text/60">Delivery Date</dt>
                <dd className="text-sm text-brand-text">{new Date(po.delivery_date).toLocaleDateString()}</dd>
              </div>
            )}
            {po.comments && (
              <div>
                <dt className="text-sm font-medium text-brand-text/60">Comments</dt>
                <dd className="text-sm text-brand-text">{po.comments}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Timeline */}
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="ml-3">
                <p className="text-sm font-medium text-brand-text">Created</p>
                <p className="text-sm text-brand-text/60">{new Date(po.created_at).toLocaleString()}</p>
              </div>
            </div>
            {po.sent_at && (
              <div className="flex items-center">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-text">Sent to Supplier</p>
                  <p className="text-sm text-brand-text/60">{new Date(po.sent_at).toLocaleString()}</p>
                </div>
              </div>
            )}
            {po.acknowledged_at && (
              <div className="flex items-center">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-text">Acknowledged</p>
                  <p className="text-sm text-brand-text/60">{new Date(po.acknowledged_at).toLocaleString()}</p>
                </div>
              </div>
            )}
            {po.delivered_at && (
              <div className="flex items-center">
                <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-brand-text">Delivered</p>
                  <p className="text-sm text-brand-text/60">{new Date(po.delivered_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-brand-surface p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-brand-text mb-4">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-brand-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text/60 uppercase tracking-wider">
                  Delivery Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-brand-surface divide-y divide-gray-200">
              {po.line_items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    {item.pr_line_item.mr_line_item.item_code}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-text">
                    {item.pr_line_item.mr_line_item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    {item.unit_price.toLocaleString()} {po.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    {item.total_price.toLocaleString()} {po.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString() : 'TBD'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-brand-surface p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-brand-text mb-4">Actions</h2>
        <div className="flex space-x-4">
          {po.status === 'draft' && (
            <button
              onClick={handleSendToSupplier}
              className="px-4 py-2 bg-status-success text-white rounded-lg hover:bg-status-success/90"
            >
              Send to Supplier
            </button>
          )}
          {po.status === 'sent' && (
            <button
              onClick={() => setShowAcknowledgeForm(true)}
              className="px-4 py-2 bg-status-warning text-white rounded-lg hover:bg-yellow-700"
            >
              Acknowledge Receipt
            </button>
          )}
          {(po.status === 'acknowledged' || po.status === 'in_progress') && (
            <button
              onClick={() => setShowStatusForm(true)}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
            >
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Status Update Form */}
      {showStatusForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brand-surface p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Update Status</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleStatusUpdate({
                status: formData.get('status') as string,
                comments: formData.get('comments') as string,
                delivery_date: formData.get('delivery_date') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text/80">Status</label>
                  <select
                    name="status"
                    required
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="invoiced">Invoiced</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text/80">Comments</label>
                  <textarea
                    name="comments"
                    rows={3}
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text/80">Delivery Date</label>
                  <input
                    type="date"
                    name="delivery_date"
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowStatusForm(false)}
                  className="px-4 py-2 text-brand-text/80 bg-brand-surface rounded-lg hover:bg-brand-primary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Acknowledge Form */}
      {showAcknowledgeForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brand-surface p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Acknowledge Receipt</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAcknowledge({
                acknowledged_by: formData.get('acknowledged_by') as string,
                acknowledgment_date: formData.get('acknowledgment_date') as string,
                comments: formData.get('comments') as string,
                estimated_delivery_date: formData.get('estimated_delivery_date') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text/80">Acknowledged By</label>
                  <input
                    type="text"
                    name="acknowledged_by"
                    required
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text/80">Acknowledgment Date</label>
                  <input
                    type="datetime-local"
                    name="acknowledgment_date"
                    required
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text/80">Estimated Delivery Date</label>
                  <input
                    type="date"
                    name="estimated_delivery_date"
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text/80">Comments</label>
                  <textarea
                    name="comments"
                    rows={3}
                    className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAcknowledgeForm(false)}
                  className="px-4 py-2 text-brand-text/80 bg-brand-surface rounded-lg hover:bg-brand-primary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-status-warning text-white rounded-lg hover:bg-yellow-700"
                >
                  Acknowledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

