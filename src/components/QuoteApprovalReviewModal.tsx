'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui';
import { QuoteApproval, Quote, Supplier } from '@/types/procurement';
import { cn } from '@/lib/cn';

interface QuoteApprovalReviewModalProps {
  approval: QuoteApproval;
  onClose: () => void;
  onSubmitSuccess: (message: string) => void;
}

type SupplierQuoteEntry = {
  supplier: Supplier;
  quote: Quote;
  totalPrice: number;
  unitPrice: number;
  leadTime?: number;
  isCheapest: boolean;
};

type SelectionState = Record<string, { supplierId: string; quoteId: string }>;

export default function QuoteApprovalReviewModal({ approval, onClose, onSubmitSuccess }: QuoteApprovalReviewModalProps) {
  const lineItems = approval.quote_pack.rfq.material_request.line_items;
  const suppliers = useMemo(() => {
    const map = new Map<string, Supplier>();
    approval.quote_pack.quotes.forEach((quote) => {
      map.set(quote.supplier_id, quote.supplier);
    });
    return Array.from(map.values());
  }, [approval.quote_pack.quotes]);

  const supplierQuotesByLine = useMemo(() => {
    const result: Record<string, SupplierQuoteEntry[]> = {};

    lineItems.forEach((line) => {
      const quotes = approval.quote_pack.quotes
        .map((quote) => {
          const quoteLine = quote.line_items.find((item) => item.mr_line_item_id === line.id);
          if (!quoteLine) {
            return undefined;
          }
          return {
            supplier: quote.supplier,
            quote,
            totalPrice: quoteLine.total_price,
            unitPrice: quoteLine.unit_price,
            leadTime: quoteLine.lead_time_days,
          };
        })
        .filter(Boolean) as Omit<SupplierQuoteEntry, 'isCheapest'>[];

      if (!quotes.length) {
        result[line.id] = [];
        return;
      }

      const cheapest = quotes.reduce((min, current) => (current.totalPrice < min.totalPrice ? current : min));
      result[line.id] = quotes.map((entry) => ({
        ...entry,
        isCheapest: entry.totalPrice === cheapest.totalPrice,
      }));
    });

    return result;
  }, [approval.quote_pack.quotes, lineItems]);

  const initialSelections: SelectionState = useMemo(() => {
    const defaults: SelectionState = {};

    if (approval.line_item_decisions.length) {
      approval.line_item_decisions.forEach((decision) => {
        if (decision.selected_quote_id) {
          defaults[decision.mr_line_item_id] = {
            supplierId: decision.selected_quote?.supplier_id ?? '',
            quoteId: decision.selected_quote_id,
          };
        }
      });
    }

    lineItems.forEach((line) => {
      if (defaults[line.id]) {
        return;
      }
      const supplierEntries = supplierQuotesByLine[line.id] || [];
      const recommended = supplierEntries.find((entry) => entry.isCheapest) ?? supplierEntries[0];
      if (recommended) {
        defaults[line.id] = {
          supplierId: recommended.quote.supplier_id,
          quoteId: recommended.quote.id,
        };
      }
    });

    return defaults;
  }, [approval.line_item_decisions, lineItems, supplierQuotesByLine]);

  const [selectedSuppliers, setSelectedSuppliers] = useState<SelectionState>(initialSelections);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSuppliers(initialSelections);
  }, [initialSelections]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showConfirm) {
          setShowConfirm(false);
          event.preventDefault();
        } else {
          onClose();
          event.preventDefault();
        }
      }
    },
    [onClose, showConfirm]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleSelectionChange = (lineId: string, supplierId: string, quoteId: string) => {
    setSelectedSuppliers((prev) => ({
      ...prev,
      [lineId]: { supplierId, quoteId },
    }));
    if (validationErrors[lineId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[lineId];
        return next;
      });
    }
  };

  const linesRequiringSelection = useMemo(
    () =>
      lineItems.filter((line) => (supplierQuotesByLine[line.id]?.length ?? 0) > 0),
    [lineItems, supplierQuotesByLine]
  );

  const allLinesSelected = linesRequiringSelection.every((line) => selectedSuppliers[line.id]);

  const computeSavings = useCallback(
    (lineId: string) => {
      const entries = supplierQuotesByLine[lineId];
      if (!entries || !entries.length) {
        return 0;
      }
      const selection = selectedSuppliers[lineId];
      if (!selection) {
        return 0;
      }
      const selected = entries.find((entry) => entry.quote.id === selection.quoteId);
      if (!selected) {
        return 0;
      }
      const bestPrice = entries.reduce((min, entry) => Math.min(min, entry.totalPrice), entries[0].totalPrice);
      return Number((bestPrice - selected.totalPrice).toFixed(2));
    },
    [selectedSuppliers, supplierQuotesByLine]
  );

  const totalSavings = useMemo(
    () =>
      linesRequiringSelection.reduce((sum, line) => sum + computeSavings(line.id), 0),
    [computeSavings, linesRequiringSelection]
  );

  const openConfirmation = () => {
    if (!allLinesSelected) {
      const missing: Record<string, string> = {};
      linesRequiringSelection.forEach((line) => {
        if (!selectedSuppliers[line.id]) {
          missing[line.id] = 'Select a supplier before submitting.';
        }
      });
      setValidationErrors(missing);
      return;
    }
    setShowConfirm(true);
  };

  const submitApproval = async () => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload = {
        decision: 'approved' as const,
        line_item_decisions: linesRequiringSelection.map((line) => {
          const selection = selectedSuppliers[line.id]!;
          return {
            mr_line_item_id: line.id,
            selected_quote_id: selection.quoteId,
          };
        }),
      };

      const response = await fetch(`/api/quote-approvals/${approval.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit quote approval.');
      }

      onSubmitSuccess('Quote approval submitted successfully.');
      setSubmitting(false);
      setShowConfirm(false);
      onClose();
    } catch (error) {
      setSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit quote approval.');
      setShowConfirm(false);
    }
  };

  const renderSavingsLabel = (lineId: string) => {
    const savings = computeSavings(lineId);
    if (savings > 0) {
      return <span className="text-sm font-medium text-status-success">Saving AED {savings.toFixed(2)}</span>;
    }
    if (savings < 0) {
      return <span className="text-sm font-medium text-status-warning">+AED {Math.abs(savings).toFixed(2)} vs best</span>;
    }
    return <span className="text-sm text-brand-text/60">No savings vs best quote</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true" aria-labelledby="quote-approval-title">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-brand-surface shadow-2xl">
        <header className="sticky top-0 z-10 border-b border-brand-text/10 bg-brand-surface/95 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-text/50">Quote Approval</p>
              <h2 id="quote-approval-title" className="text-2xl font-bold text-brand-text">
                {approval.quote_pack.rfq.material_request.project_name}
              </h2>
              <p className="text-sm text-brand-text/60">
                Material Request {approval.quote_pack.rfq.material_request.mrn} • RFQ {approval.quote_pack.rfq.rfq_number}
              </p>
            </div>
            <Button variant="ghost" onClick={onClose} aria-label="Close quote approval">
              ✕
            </Button>
          </div>
        </header>

        <main className="space-y-6 px-6 py-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-brand-text/10 bg-brand-primary/5 p-4">
              <p className="text-xs text-brand-text/60">Quotes received</p>
              <p className="text-2xl font-semibold text-brand-primary">{approval.quote_pack.quotes.length}</p>
            </div>
            <div className="rounded-lg border border-brand-text/10 bg-status-success/10 p-4">
              <p className="text-xs text-brand-text/60">Total value</p>
              <p className="text-2xl font-semibold text-status-success">
                {approval.quote_pack.quotes.reduce((sum, quote) => sum + quote.total_amount, 0).toLocaleString()} AED
              </p>
            </div>
            <div className="rounded-lg border border-brand-text/10 bg-status-warning/10 p-4">
              <p className="text-xs text-brand-text/60">Potential savings</p>
              <p className="text-2xl font-semibold text-status-warning">{totalSavings.toLocaleString()} AED</p>
            </div>
            <div className="rounded-lg border border-brand-text/10 bg-brand-text/5 p-4">
              <p className="text-xs text-brand-text/60">Lines requiring decision</p>
              <p className="text-2xl font-semibold text-brand-text">{linesRequiringSelection.length}</p>
            </div>
          </section>

          {errorMessage && (
            <div className="rounded-lg border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
              {errorMessage}
            </div>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brand-text">Quote comparison</h3>
              <p className="text-xs text-brand-text/60">Select the winning supplier per line item.</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-brand-text/10">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="min-w-[220px]">Line item</TableHeaderCell>
                    {suppliers.map((supplier) => (
                      <TableHeaderCell key={supplier.id} className="min-w-[200px] text-center">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-brand-text">{supplier.name}</p>
                          <p className="text-xs text-brand-text/50">{supplier.category}</p>
                        </div>
                      </TableHeaderCell>
                    ))}
                    <TableHeaderCell className="min-w-[200px] text-center">Select supplier</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((line) => {
                    const supplierEntries = supplierQuotesByLine[line.id] ?? [];
                    const bestPrice = supplierEntries.reduce((min, entry) => Math.min(min, entry.totalPrice), Infinity);
                    return (
                      <TableRow key={line.id}>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-brand-text">{line.description}</p>
                            <p className="text-xs text-brand-text/50">{line.item_code}</p>
                            <p className="text-xs text-brand-text/50">
                              {line.quantity} {line.uom}
                            </p>
                          </div>
                        </TableCell>

                        {suppliers.map((supplier) => {
                          const entry = supplierEntries.find((item) => item.quote.supplier_id === supplier.id);
                          const isSelected = selectedSuppliers[line.id]?.supplierId === supplier.id;
                          const savingsMessage = entry
                            ? entry.totalPrice - bestPrice
                            : undefined;

                          return (
                            <TableCell
                              key={`${line.id}-${supplier.id}`}
                              className={cn(
                                'align-top text-sm transition',
                                entry?.isCheapest && 'bg-status-success/10',
                                isSelected && 'ring-2 ring-brand-primary'
                              )}
                            >
                              {entry ? (
                                <div className="space-y-1 text-center">
                                  <p className="font-semibold text-brand-text">AED {entry.totalPrice.toFixed(2)}</p>
                                  <p className="text-xs text-brand-text/60">Unit: {entry.unitPrice.toFixed(2)}</p>
                                  {entry.leadTime !== undefined && (
                                    <p className="text-xs text-brand-text/60">Lead: {entry.leadTime} day(s)</p>
                                  )}
                                  {savingsMessage !== undefined && savingsMessage > 0 && (
                                    <p className="text-[11px] text-status-warning">+AED {savingsMessage.toFixed(2)} vs best</p>
                                  )}
                                  {entry.isCheapest && (
                                    <Badge variant="primary" soft={true} className="mt-1 text-[11px]">
                                      Lowest price
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-brand-text/50">No quote</p>
                              )}
                            </TableCell>
                          );
                        })}

                        <TableCell className="align-top">
                          {supplierEntries.length ? (
                            <div className="space-y-2">
                              {supplierEntries.map((entry) => (
                                <label
                                  key={`${line.id}-${entry.quote.supplier_id}`}
                                  className="flex items-center gap-2 rounded-lg border border-brand-text/20 px-3 py-2 text-xs text-brand-text/70 hover:border-brand-primary"
                                >
                                  <input
                                    type="radio"
                                    name={`selection-${line.id}`}
                                    value={entry.quote.id}
                                    checked={selectedSuppliers[line.id]?.quoteId === entry.quote.id}
                                    onChange={() => handleSelectionChange(line.id, entry.quote.supplier_id, entry.quote.id)}
                                    className="h-4 w-4 border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                                  />
                                  <span className="flex-1 text-left">
                                    {entry.quote.supplier.name}
                                  </span>
                                </label>
                              ))}
                              {validationErrors[line.id] && (
                                <p className="text-xs text-status-danger">{validationErrors[line.id]}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-brand-text/50">No supplier responses yet</p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-brand-text">Selection summary</h3>
            <div className="space-y-2">
              {lineItems.map((line) => {
                const selection = selectedSuppliers[line.id];
                const supplierName = selection
                  ? approval.quote_pack.quotes.find((quote) => quote.id === selection.quoteId)?.supplier.name ?? 'Supplier'
                  : 'Not selected';
                return (
                  <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-text/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-brand-text">{line.description}</p>
                      <p className="text-xs text-brand-text/60">{supplierName}</p>
                    </div>
                    <div>{renderSavingsLabel(line.id)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <footer className="flex justify-end gap-3 border-t border-brand-text/10 px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={openConfirmation} disabled={!allLinesSelected}>
            Submit Approval
          </Button>
        </footer>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-brand-surface p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-brand-text">Confirm quote approval</h3>
            <p className="mt-2 text-sm text-brand-text/70">
              Please review the selected suppliers per line before finalising your approval.
            </p>
            <div className="mt-4 space-y-3">
              {lineItems.map((line) => {
                const selection = selectedSuppliers[line.id];
                if (!selection) return null;
                const chosenQuote = approval.quote_pack.quotes.find((quote) => quote.id === selection.quoteId);
                const quoteLine = chosenQuote?.line_items.find((item) => item.mr_line_item_id === line.id);
                return (
                  <div key={line.id} className="rounded-lg border border-brand-text/10 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-brand-text">{line.description}</p>
                      <p className="text-brand-text/70">{chosenQuote?.supplier.name}</p>
                    </div>
                    {quoteLine && (
                      <p className="text-xs text-brand-text/60 mt-1">AED {quoteLine.total_price.toFixed(2)} • Lead {quoteLine.lead_time_days} day(s)</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowConfirm(false)} disabled={submitting}>
                Back
              </Button>
              <Button variant="primary" onClick={submitApproval} isLoading={submitting}>
                Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
