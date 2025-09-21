'use client';

import React, { useState, useEffect } from 'react';
import { QuoteApproval, LineItemDecision, Quote } from '@/types/procurement';

interface QuoteApprovalFormProps {
  approval: QuoteApproval;
  onApprovalSubmitted: (approvalId: string) => void;
  onCancel: () => void;
}

export default function QuoteApprovalForm({ approval, onApprovalSubmitted, onCancel }: QuoteApprovalFormProps) {
  const [lineItemDecisions, setLineItemDecisions] = useState<LineItemDecision[]>([]);
  const [comments, setComments] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize line item decisions
    const initialDecisions: LineItemDecision[] = approval.quote_pack.rfq.material_request.line_items.map(mrItem => ({
      id: '',
      quote_approval_id: approval.id,
      mr_line_item_id: mrItem.id,
      mr_line_item: mrItem,
      selected_quote_id: '',
      selected_quote: {} as Quote,
      decision: 'approved' as const,
      comments: '',
      created_at: new Date().toISOString()
    }));
    setLineItemDecisions(initialDecisions);
  }, [approval]);

  const updateLineItemDecision = (mrItemId: string, field: keyof LineItemDecision, value: string | Quote) => {
    setLineItemDecisions(prev => prev.map(decision => 
      decision.mr_line_item_id === mrItemId 
        ? { ...decision, [field]: value }
        : decision
    ));
  };

  const getQuoteForLineItem = (mrItemId: string, quoteId: string): Quote | undefined => {
    return approval.quote_pack.quotes.find(quote => 
      quote.id === quoteId && quote.line_items.some(item => item.mr_line_item_id === mrItemId)
    );
  };

  const calculateTotalSavings = () => {
    return lineItemDecisions.reduce((total, decision) => {
      if (decision.selected_quote_id && decision.decision === 'approved') {
        const quote = getQuoteForLineItem(decision.mr_line_item_id, decision.selected_quote_id);
        if (quote) {
          const quoteItem = quote.line_items.find(item => item.mr_line_item_id === decision.mr_line_item_id);
          if (quoteItem) {
            // Calculate savings compared to highest quote for this line item
            const allQuotesForItem = approval.quote_pack.quotes
              .filter(q => q.line_items.some(item => item.mr_line_item_id === decision.mr_line_item_id))
              .map(q => q.line_items.find(item => item.mr_line_item_id === decision.mr_line_item_id)?.total_price || 0);
            const highestPrice = Math.max(...allQuotesForItem);
            return total + (highestPrice - quoteItem.total_price);
          }
        }
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (decision: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quote-approvals/${approval.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          line_item_decisions: lineItemDecisions,
          comments
        }),
      });

      if (response.ok) {
        onApprovalSubmitted(approval.id);
      } else {
        console.error('Failed to submit approval decision');
      }
    } catch (error) {
      console.error('Error submitting approval decision:', error);
    } finally {
      setLoading(false);
    }
  };

  const allDecisionsMade = lineItemDecisions.every(decision => 
    decision.selected_quote_id && decision.decision
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-brand-text/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-brand-text">Quote Approval</h2>
              <p className="text-brand-text/70">MR: {approval.quote_pack.rfq.material_request.mrn}</p>
              <p className="text-brand-text/70">Project: {approval.quote_pack.rfq.material_request.project_name}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-brand-text/50 hover:text-brand-text/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-brand-primary">{approval.quote_pack.quotes.length}</div>
              <div className="text-sm text-blue-800">Total Quotes</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-status-success">
                {approval.quote_pack.quotes.reduce((sum, q) => sum + q.total_amount, 0).toLocaleString()} AED
              </div>
              <div className="text-sm text-green-800">Total Value</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-status-warning">
                {calculateTotalSavings().toLocaleString()} AED
              </div>
              <div className="text-sm text-yellow-800">Potential Savings</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {lineItemDecisions.filter(d => d.decision === 'approved').length}
              </div>
              <div className="text-sm text-purple-800">Items to Approve</div>
            </div>
          </div>

          {/* Line Item Decisions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-text">Line Item Decisions</h3>
            {lineItemDecisions.map((decision, index) => (
              <div key={decision.mr_line_item_id} className="border border-brand-text/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-brand-text">{decision.mr_line_item.item_code}</h4>
                    <p className="text-sm text-brand-text/70">{decision.mr_line_item.description}</p>
                    <p className="text-sm text-brand-text/70">
                      Qty: {decision.mr_line_item.quantity} {decision.mr_line_item.uom}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`decision-${index}`}
                        value="approved"
                        checked={decision.decision === 'approved'}
                        onChange={() => updateLineItemDecision(decision.mr_line_item_id, 'decision', 'approved')}
                        className="mr-2"
                      />
                      <span className="text-sm text-status-success">Approve</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`decision-${index}`}
                        value="rejected"
                        checked={decision.decision === 'rejected'}
                        onChange={() => updateLineItemDecision(decision.mr_line_item_id, 'decision', 'rejected')}
                        className="mr-2"
                      />
                      <span className="text-sm text-status-danger">Reject</span>
                    </label>
                  </div>
                </div>

                {decision.decision === 'approved' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-text/80 mb-2">
                        Select Supplier Quote
                      </label>
                      <select
                        value={decision.selected_quote_id}
                        onChange={(e) => {
                          const quote = getQuoteForLineItem(decision.mr_line_item_id, e.target.value);
                          updateLineItemDecision(decision.mr_line_item_id, 'selected_quote_id', e.target.value);
                          if (quote) {
                            updateLineItemDecision(decision.mr_line_item_id, 'selected_quote', quote);
                          }
                        }}
                        className="w-full px-3 py-2 border border-brand-text/20 rounded-md text-sm"
                      >
                        <option value="">Select a quote</option>
                        {approval.quote_pack.quotes
                          .filter(quote => quote.line_items.some(item => item.mr_line_item_id === decision.mr_line_item_id))
                          .map(quote => {
                            const quoteItem = quote.line_items.find(item => item.mr_line_item_id === decision.mr_line_item_id);
                            return (
                              <option key={quote.id} value={quote.id}>
                                {quote.supplier.name} - {quoteItem?.total_price.toLocaleString()} AED
                                {quoteItem && ` (${quoteItem.lead_time_days} days)`}
                              </option>
                            );
                          })}
                      </select>
                    </div>

                    {decision.selected_quote_id && (
                      <div className="bg-brand-surface p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Total Amount:</span> {decision.selected_quote.total_amount?.toLocaleString()} AED
                          </div>
                          <div>
                            <span className="font-medium">Currency:</span> {decision.selected_quote.currency}
                          </div>
                          <div>
                            <span className="font-medium">Valid Until:</span> {new Date(decision.selected_quote.valid_until).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {decision.selected_quote.status}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-brand-text/80 mb-2">
                        Comments (Optional)
                      </label>
                      <textarea
                        value={decision.comments || ''}
                        onChange={(e) => updateLineItemDecision(decision.mr_line_item_id, 'comments', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-brand-text/20 rounded-md text-sm"
                        placeholder="Add any comments about this decision..."
                      />
                    </div>
                  </div>
                )}

                {decision.decision === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-brand-text/80 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={decision.comments || ''}
                      onChange={(e) => updateLineItemDecision(decision.mr_line_item_id, 'comments', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-brand-text/20 rounded-md text-sm"
                      placeholder="Please provide a reason for rejection..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Comments */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-brand-text/80 mb-2">
              Overall Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-brand-text/20 rounded-md text-sm"
              placeholder="Add any overall comments about this approval decision..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-brand-text/10 mt-8">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-brand-text/80 bg-brand-surface border border-brand-text/20 rounded-md hover:bg-brand-surface"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit('rejected')}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-status-danger border border-transparent rounded-md hover:bg-status-danger/90 disabled:opacity-50"
            >
              Reject All
            </button>
            <button
              onClick={() => handleSubmit('approved')}
              disabled={loading || !allDecisionsMade}
              className="px-4 py-2 text-sm font-medium text-white bg-status-success border border-transparent rounded-md hover:bg-status-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Approve Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
