'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
} from 'react';
import TraceabilityChips from '@/components/approvals/TraceabilityChips';
import ApprovalMatrix from '@/components/approvals/ApprovalMatrix';
import {
  getRequiredApprovalLevels,
  getNextApprovalLevel,
  isPRFullyApproved,
} from '@/lib/authorization-matrix';
import { AuthorizationMatrix, PurchaseRequisition, PRDetailViewProps } from '@/types/procurement';

const statusBadgeVariants: Record<PurchaseRequisition['status'], string> = {
  draft: 'bg-brand-surface text-brand-text/80 border border-brand-text/20',
  submitted: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30',
  under_review: 'bg-status-warning/10 text-status-warning border border-status-warning/40',
  approved: 'bg-status-success/10 text-status-success border border-status-success/40',
  rejected: 'bg-status-danger/10 text-status-danger border border-status-danger/40',
};

const currencyFormatter = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

export default function PRDetailView({ prId, userRole }: PRDetailViewProps) {
  const [pr, setPR] = useState<PurchaseRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

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

  const handleApprove = useCallback(
    async (approverId: string, comments?: string) => {
      try {
        const response = await fetch(`/api/prs/${prId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approver_id: approverId, comments }),
        });

        if (response.ok) {
          await fetchPR();
          setShowApprovalForm(false);
        } else {
          console.error('Error approving PR');
        }
      } catch (error) {
        console.error('Error approving PR:', error);
      }
    },
    [fetchPR, prId]
  );

  const handleReject = useCallback(
    async (approverId: string, reason: string, comments?: string) => {
      try {
        const response = await fetch(`/api/prs/${prId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approver_id: approverId, reason, comments }),
        });

        if (response.ok) {
          await fetchPR();
          setShowRejectionForm(false);
        } else {
          console.error('Error rejecting PR');
        }
      } catch (error) {
        console.error('Error rejecting PR:', error);
      }
    },
    [fetchPR, prId]
  );

  const handleComment = useCallback(
    async (comments: string) => {
      try {
        const response = await fetch(`/api/prs/${prId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comments }),
        });

        if (response.ok) {
          await fetchPR();
          setShowCommentForm(false);
        } else {
          console.error('Error capturing comment');
        }
      } catch (error) {
        console.error('Error capturing comment:', error);
      }
    },
    [fetchPR, prId]
  );

  const getStatusColor = useCallback((status: PurchaseRequisition['status']) => {
    return statusBadgeVariants[status] ?? statusBadgeVariants.draft;
  }, []);

  const matrixLevels = useMemo<AuthorizationMatrix[]>(() => {
    if (!pr) {
      return [];
    }
    return getRequiredApprovalLevels(pr.project_id, pr.total_value);
  }, [pr]);

  const currentApprovalLevel = useMemo(() => (pr ? getNextApprovalLevel(pr) : 0), [pr]);

  const fullyApproved = useMemo(() => (pr ? isPRFullyApproved(pr) : false), [pr]);

  const activeMatrixLevel = useMemo(() => {
    if (!pr || !currentApprovalLevel) {
      return undefined;
    }
    return matrixLevels.find((entry) => entry.approval_level === currentApprovalLevel);
  }, [currentApprovalLevel, matrixLevels, pr]);

  const totalValueSummary = useMemo(() => {
    if (!pr) {
      return [] as Array<{ label: string; value: string }>;
    }

    const values: Array<{ label: string; value: string }> = [
      {
        label: `Total (${pr.currency})`,
        value: currencyFormatter(pr.total_value, pr.currency),
      },
    ];

    if (typeof pr.total_value_aed === 'number') {
      values.push({ label: 'Total (AED)', value: currencyFormatter(pr.total_value_aed, 'AED') });
    } else if (pr.currency !== 'AED') {
      values.push({ label: 'Total (AED)', value: '—' });
    }

    if (typeof pr.total_value_usd === 'number') {
      values.push({ label: 'Total (USD)', value: currencyFormatter(pr.total_value_usd, 'USD') });
    } else if (pr.currency !== 'USD') {
      values.push({ label: 'Total (USD)', value: '—' });
    }

    return values;
  }, [pr]);

  const isDecisionDisabled = useMemo(() => {
    if (!pr) {
      return true;
    }
    if (pr.status === 'approved' || pr.status === 'rejected') {
      return true;
    }
    if (userRole !== 'approver') {
      return true;
    }
    return currentApprovalLevel === 0;
  }, [currentApprovalLevel, pr, userRole]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" role="status" />
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="rounded-xl border border-brand-text/10 bg-brand-surface px-6 py-12 text-center text-brand-text/60">
        Purchase Requisition not found
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-brand-primary/20 bg-brand-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-[260px] space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-text">{pr.pr_number}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusColor(pr.status)}`}>
                {pr.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid gap-4 text-sm text-brand-text/80 sm:grid-cols-2">
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Project</p>
                <p className="mt-1 text-base font-semibold text-brand-text">{pr.project_name}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Supplier</p>
                <p className="mt-1 text-base font-semibold text-brand-text">{pr.supplier.name}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Created By</p>
                <p className="mt-1 text-sm text-brand-text/80">{pr.created_by_name}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Created</p>
                <p className="mt-1 text-sm text-brand-text/80">
                  {new Date(pr.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            <TraceabilityChips quoteApproval={pr.quote_approval} />
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-col">
            {totalValueSummary.map(({ label, value }) => (
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

        <ApprovalMatrix
          className="mt-6"
          matrix={matrixLevels}
          approvals={pr.approvals}
          currentLevel={currentApprovalLevel}
          currency={pr.currency}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-brand-text/10 bg-brand-surface p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-text">Line Items</h2>
              <span className="text-sm text-brand-text/60">{pr.line_items.length} items</span>
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
                      Lead Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-text/10">
                  {pr.line_items.map((item) => (
                    <tr key={item.id} className="bg-white/70">
                      <td className="px-6 py-4 text-sm text-brand-text">{item.mr_line_item.item_code}</td>
                      <td className="px-6 py-4 text-sm text-brand-text">{item.mr_line_item.description}</td>
                      <td className="px-6 py-4 text-sm text-brand-text">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-brand-text">
                        {currencyFormatter(item.unit_price, pr.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-text">
                        {currencyFormatter(item.total_price, pr.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-text">{item.lead_time_days} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-text/10 bg-brand-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Approval History &amp; Audit Trail</h2>
            <p className="mt-1 text-sm text-brand-text/70">
              Every decision is recorded with comments and timestamps for compliance traceability.
            </p>
            <div className="mt-4 space-y-4">
              {pr.approvals.length === 0 && (
                <p className="rounded-lg border border-dashed border-brand-text/20 bg-white/60 px-4 py-6 text-sm text-brand-text/60">
                  No approval activity recorded yet.
                </p>
              )}

              {pr.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-xl border border-brand-text/10 bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{approval.approver_name}</p>
                      <p className="text-xs uppercase tracking-wide text-brand-text/60">
                        Level {approval.approval_level}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        approval.status === 'approved'
                          ? 'bg-status-success/10 text-status-success border border-status-success/40'
                          : 'bg-status-danger/10 text-status-danger border border-status-danger/40'
                      }`}
                    >
                      {approval.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-brand-text/60">
                    <span>
                      {new Date(
                        approval.approved_at ||
                          approval.rejected_at ||
                          approval.created_at
                      ).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    {approval.comments && <span className="italic">“{approval.comments}”</span>}
                  </div>
                </div>
              ))}

              {pr.comments && (
                <div className="rounded-xl border border-brand-text/10 bg-white/70 p-4 text-sm text-brand-text/70">
                  <p className="font-semibold text-brand-text">Latest approver comment</p>
                  <p className="mt-1">{pr.comments}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Approver Actions</h2>
            <p className="mt-1 text-sm text-brand-text/70">
              Decisions update audit logs automatically and advance the workflow state machine.
            </p>

            <div className="mt-4 space-y-3 text-sm text-brand-text/70">
              {currentApprovalLevel === 0 ? (
                fullyApproved ? (
                  <p className="rounded-lg border border-status-success/30 bg-status-success/10 px-3 py-2 text-status-success">
                    All approval levels completed. PR is ready for PO generation.
                  </p>
                ) : (
                  <p className="rounded-lg border border-brand-text/20 bg-white/60 px-3 py-2">
                    No additional approvals required for this requisition.
                  </p>
                )
              ) : (
                <p className="rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-3 py-2 text-brand-primary">
                  Awaiting Level {currentApprovalLevel} approval
                  {activeMatrixLevel ? ` (${activeMatrixLevel.approver_role})` : ''}.
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowApprovalForm(true)}
                disabled={isDecisionDisabled}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-status-success/40 ${
                  isDecisionDisabled
                    ? 'cursor-not-allowed bg-status-success/40'
                    : 'bg-status-success hover:bg-status-success/90'
                }`}
              >
                Approve &amp; Advance
              </button>
              <button
                type="button"
                onClick={() => setShowRejectionForm(true)}
                disabled={isDecisionDisabled}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-status-danger/40 ${
                  isDecisionDisabled
                    ? 'cursor-not-allowed bg-status-danger/40'
                    : 'bg-status-danger hover:bg-status-danger/90'
                }`}
              >
                Reject &amp; Block
              </button>
              <button
                type="button"
                onClick={() => setShowCommentForm(true)}
                disabled={!pr || pr.status === 'rejected'}
                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${
                  !pr || pr.status === 'rejected'
                    ? 'cursor-not-allowed border border-brand-text/20 text-brand-text/40'
                    : 'border border-brand-primary/40 text-brand-primary hover:bg-brand-primary/10'
                }`}
              >
                Add Comment
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-text/10 bg-brand-surface p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-text">Supplier Snapshot</h3>
            <div className="mt-4 space-y-3 text-sm text-brand-text/70">
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Name</p>
                <p className="mt-1 text-brand-text">{pr.supplier.name}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Email</p>
                <p className="mt-1 text-brand-text">{pr.supplier.email}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Category</p>
                <p className="mt-1 text-brand-text">{pr.supplier.category}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wide text-brand-text/50">Rating</p>
                <p className="mt-1 text-brand-text">{pr.supplier.rating}/5</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-text/10 bg-brand-surface p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-text">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <button className="w-full rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/20">
                Download PR Summary
              </button>
              <button className="w-full rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-2 text-sm font-semibold text-status-success transition hover:bg-status-success/20">
                Generate Draft PO
              </button>
              <button className="w-full rounded-lg border border-brand-text/20 bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-text/70 transition hover:bg-brand-primary/10">
                Print Preview
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-primary/30 bg-brand-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-text">Approve Purchase Requisition</h3>
            <p className="mt-1 text-sm text-brand-text/70">
              Confirm approval for this level. Workflow will advance to the next approver if required.
            </p>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                handleApprove('approver-001', formData.get('comments') as string);
              }}
            >
              <label className="block text-sm font-medium text-brand-text">
                Comments (optional)
                <textarea
                  name="comments"
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  placeholder="Add contextual notes for audit trail"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApprovalForm(false)}
                  className="rounded-lg border border-brand-text/20 px-4 py-2 text-sm font-semibold text-brand-text/70 hover:bg-brand-primary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-status-success px-4 py-2 text-sm font-semibold text-white hover:bg-status-success/90"
                >
                  Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-status-danger/30 bg-brand-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-text">Reject Purchase Requisition</h3>
            <p className="mt-1 text-sm text-brand-text/70">
              Provide a reason for rejection. The requisition will return to procurement for remediation.
            </p>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                handleReject(
                  'approver-001',
                  formData.get('reason') as string,
                  formData.get('comments') as string
                );
              }}
            >
              <label className="block text-sm font-medium text-brand-text">
                Rejection reason
                <select
                  name="reason"
                  required
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-status-danger/60 focus:outline-none focus:ring-2 focus:ring-status-danger/30"
                >
                  <option value="">Select a reason</option>
                  <option value="budget_exceeded">Budget exceeded</option>
                  <option value="supplier_not_qualified">Supplier not qualified</option>
                  <option value="specifications_incorrect">Specifications incorrect</option>
                  <option value="duplicate_request">Duplicate request</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-brand-text">
                Comments (optional)
                <textarea
                  name="comments"
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-status-danger/60 focus:outline-none focus:ring-2 focus:ring-status-danger/30"
                  placeholder="Share context for the requester"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectionForm(false)}
                  className="rounded-lg border border-brand-text/20 px-4 py-2 text-sm font-semibold text-brand-text/70 hover:bg-status-danger/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-status-danger px-4 py-2 text-sm font-semibold text-white hover:bg-status-danger/90"
                >
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-brand-primary/20 bg-brand-surface p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-brand-text">Add Approver Comment</h3>
            <p className="mt-1 text-sm text-brand-text/70">
              Comments are recorded in the audit trail and surfaced to downstream stakeholders.
            </p>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                handleComment(formData.get('comments') as string);
              }}
            >
              <label className="block text-sm font-medium text-brand-text">
                Comment
                <textarea
                  name="comments"
                  required
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-brand-text/20 px-3 py-2 text-sm focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  placeholder="Document guidance, conditions, or concerns"
                />
              </label>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="rounded-lg border border-brand-text/20 px-4 py-2 text-sm font-semibold text-brand-text/70 hover:bg-brand-primary/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
                >
                  Save Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
