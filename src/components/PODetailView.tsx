'use client';

import React, { useState, useEffect, useCallback, useMemo, FormEvent } from 'react';
import POStatusTimeline from '@/components/approvals/POStatusTimeline';
import { PurchaseOrder, PODetailViewProps } from '@/types/procurement';

const poStatusBadge: Record<PurchaseOrder['status'], string> = {
  draft: 'bg-brand-surface text-brand-text/80 border border-brand-text/20',
  sent: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30',
  acknowledged: 'bg-status-warning/10 text-status-warning border border-status-warning/40',
  in_progress: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30',
  delivered: 'bg-status-success/10 text-status-success border border-status-success/40',
  invoiced: 'bg-status-warning/10 text-status-warning border border-status-warning/40',
  paid: 'bg-status-success/10 text-status-success border border-status-success/40',
};

const currencyFormatter = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

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

  const handleSendToSupplier = useCallback(async () => {
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
          sender_name: 'Jane Smith',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send PO to supplier');
      }

      await fetchPO();
    } catch (error) {
      console.error('Error sending PO to supplier:', error);
    }
  }, [fetchPO, po?.supplier.email, poId]);

  const handleAcknowledge = useCallback(
    async (acknowledgmentData: {
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

        await fetchPO();
        setShowAcknowledgeForm(false);
      } catch (error) {
        console.error('Error acknowledging PO:', error);
      }
    },
    [fetchPO, poId]
  );

  const handleStatusUpdate = useCallback(
    async (statusData: { status: string; comments?: string; delivery_date?: string }) => {
      try {
        const response = await fetch(`/api/pos/${poId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...statusData,
            actor_id: 'user-002',
            actor_name: 'Jane Smith',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update PO status');
        }

        await fetchPO();
        setShowStatusForm(false);
      } catch (error) {
        console.error('Error updating PO status:', error);
      }
    },
    [fetchPO, poId]
  );

  const totals = useMemo(() => {
    if (!po) {
      return [] as Array<{ label: string; value: string }>;
    }

    const values: Array<{ label: string; value: string }> = [
      { label: `Total (${po.currency})`, value: currencyFormatter(po.total_value, po.currency) },
    ];

    if (typeof po.total_value_aed === 'number') {
      values.push({ label: 'Total (AED)', value: currencyFormatter(po.total_value_aed, 'AED') });
    }

    if (typeof po.total_value_usd === 'number') {
      values.push({ label: 'Total (USD)', value: currencyFormatter(po.total_value_usd, 'USD') });
    }

    return values;
  }, [po]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" role="status" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="rounded-xl border border-brand-text/10 bg-brand-surface px-6 py-12 text-center text-brand-text/60">
        Purchase Order not found
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-brand-primary/20 bg-brand-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-text">{po.po_number}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${poStatusBadge[po.status]}`}>
                {po.status.replace('_', ' ')}
              </span>
            </div>
            <div className="grid gap-4 text-sm text-brand-text/70 sm:grid-cols-2">
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Project</p>
                <p className="mt-1 text-base font-semibold text-brand-text">{po.project_name}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Supplier</p>
                <p className="mt-1 text-base font-semibold text-brand-text">{po.supplier.name}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Generated From PR</p>
                <p className="mt-1 text-sm text-brand-primary">{po.pr.pr_number}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Created</p>
                <p className="mt-1 text-sm text-brand-text/80">
                  {new Date(po.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-col">
            {totals.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-brand-primary/20 bg-white/90 px-4 py-3 text-right shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-text/50">{label}</p>
                <p className="mt-1 text-lg font-semibold text-brand-text">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-brand-text/10 bg-brand-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">PO Details</h2>
            <div className="mt-4 grid gap-4 text-sm text-brand-text/70 sm:grid-cols-2">
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Payment Terms</p>
                <p className="mt-1 text-brand-text">{po.payment_terms}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Delivery Address</p>
                <p className="mt-1 text-brand-text">{po.delivery_address}</p>
              </div>
              {po.delivery_date && (
                <div>
                  <p className="font-semibold uppercase tracking-wide text-brand-text/50">Delivery Date</p>
                  <p className="mt-1 text-brand-text">
                    {new Date(po.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {po.comments && (
                <div>
                  <p className="font-semibold uppercase tracking-wide text-brand-text/50">Comments</p>
                  <p className="mt-1 text-brand-text">{po.comments}</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-text/10 bg-brand-surface p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-text">Line Items</h2>
              <span className="text-sm text-brand-text/60">{po.line_items.length} items</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-text/10">
                <thead className="bg-brand-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text/50">
                      Item Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text/50">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text/50">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text/50">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text/50">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-text/50">
                      Delivery Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-text/10">
                  {po.line_items.map((item) => (
                    <tr key={item.id} className="bg-white/70">
                      <td className="px-6 py-4 text-sm text-brand-text">
                        {item.pr_line_item.mr_line_item.item_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-text">
                        {item.pr_line_item.mr_line_item.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-text">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-brand-text">
                        {currencyFormatter(item.unit_price, po.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-text">
                        {currencyFormatter(item.total_price, po.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-text">
                        {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString() : 'TBD'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <POStatusTimeline po={po} />

          <section className="rounded-2xl border border-brand-text/10 bg-brand-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Dispatch &amp; Status Actions</h2>
            <p className="mt-1 text-sm text-brand-text/70">
              Trigger supplier notifications, record acknowledgements, and keep status history synchronized with the workflow engine.
            </p>
            <div className="mt-4 space-y-3">
              {po.status === 'draft' && (
                <button
                  onClick={handleSendToSupplier}
                  className="w-full rounded-lg bg-status-success px-4 py-2 text-sm font-semibold text-white hover:bg-status-success/90 focus:outline-none focus:ring-2 focus:ring-status-success/40"
                >
                  Send to Supplier
                </button>
              )}
              {po.status === 'sent' && (
                <button
                  onClick={() => setShowAcknowledgeForm(true)}
                  className="w-full rounded-lg bg-status-warning px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-status-warning/40"
                >
                  Record Acknowledgement
                </button>
              )}
              {['acknowledged', 'in_progress'].includes(po.status) && (
                <button
                  onClick={() => setShowStatusForm(true)}
                  className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                >
                  Update Status
                </button>
              )}
              <button className="w-full rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/40">
                Download PDF
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-primary/20 bg-brand-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-text">Update Status</h3>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                handleStatusUpdate({
                  status: formData.get('status') as string,
                  comments: formData.get('comments') as string,
                  delivery_date: formData.get('delivery_date') as string,
                });
              }}
            >
              <label className="block text-sm font-medium text-brand-text">
                Status
                <select
                  name="status"
                  required
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  defaultValue="in_progress"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="delivered">Delivered</option>
                  <option value="invoiced">Invoiced</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-brand-text">
                Comments
                <textarea
                  name="comments"
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
              </label>
              <label className="block text-sm font-medium text-brand-text">
                Delivery Date
                <input
                  type="date"
                  name="delivery_date"
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStatusForm(false)}
                  className="rounded-lg border border-brand-text/20 px-4 py-2 text-sm font-semibold text-brand-text/70 hover:bg-brand-primary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Acknowledge Modal */}
      {showAcknowledgeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-status-warning/30 bg-brand-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-text">Record Supplier Acknowledgement</h3>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                handleAcknowledge({
                  acknowledged_by: (formData.get('acknowledged_by') as string) || 'supplier-contact',
                  acknowledgment_date: formData.get('acknowledgment_date') as string,
                  comments: formData.get('comments') as string,
                  estimated_delivery_date: formData.get('estimated_delivery_date') as string,
                });
              }}
            >
              <label className="block text-sm font-medium text-brand-text">
                Acknowledgement Date
                <input
                  type="date"
                  name="acknowledgment_date"
                  required
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-status-warning/60 focus:outline-none focus:ring-2 focus:ring-status-warning/40"
                />
              </label>
              <label className="block text-sm font-medium text-brand-text">
                Estimated Delivery
                <input
                  type="date"
                  name="estimated_delivery_date"
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-status-warning/60 focus:outline-none focus:ring-2 focus:ring-status-warning/40"
                />
              </label>
              <label className="block text-sm font-medium text-brand-text">
                Comments
                <textarea
                  name="comments"
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-status-warning/60 focus:outline-none focus:ring-2 focus:ring-status-warning/40"
                  placeholder="Optional notes captured in audit trail"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAcknowledgeForm(false)}
                  className="rounded-lg border border-brand-text/20 px-4 py-2 text-sm font-semibold text-brand-text/70 hover:bg-status-warning/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-status-warning px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
