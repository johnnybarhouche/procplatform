'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui';
import {
  ComparisonSummary,
  ComparisonSelection,
  RFQ,
  RFQSupplier,
  Quote,
  QuoteLineItem,
  MaterialRequest,
  MRLineItem,
} from '@/types/procurement';

export type { ComparisonSummary, ComparisonSelection };
import { cn } from '@/lib/cn';

interface ComparisonGridProps {
  rfq: RFQ;
  onClose: () => void;
  onSaveSelections?: (summary: ComparisonSummary) => void;
}

interface CellData {
  supplier: RFQSupplier;
  quote?: Quote;
  lineItem?: QuoteLineItem;
  unitPrice?: number;
  totalPrice?: number;
  leadTime?: number;
}

type ComparisonEvent = 'selection_saved' | 'selection_changed' | 'exported';

export default function ComparisonGrid({ rfq, onClose, onSaveSelections }: ComparisonGridProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    rfq.material_request.line_items.forEach((line) => {
      const cheapest = findCheapestSupplier(rfq, line.id);
      if (cheapest) {
        defaults[line.id] = cheapest;
      }
    });
    return defaults;
  });

  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const evaluationRows = useMemo(() => {
    return rfq.material_request.line_items.map((line) => {
      const supplierCells = rfq.suppliers.map((supplier) => buildCellData(rfq, supplier, line));
      const cheapestSupplierId = findCheapestSupplier(rfq, line.id);
      return {
        line,
        supplierCells,
        cheapestSupplierId,
      };
    });
  }, [rfq]);

  function buildCellData(rfq: RFQ, supplier: RFQSupplier, line: MRLineItem): CellData {
    const quote = rfq.quotes.find((q) => q.supplier_id === supplier.supplier_id);
    const lineItem = quote?.line_items.find((item) => item.mr_line_item_id === line.id);
    return {
      supplier,
      quote,
      lineItem,
      unitPrice: lineItem?.unit_price,
      totalPrice: lineItem?.total_price,
      leadTime: lineItem?.lead_time_days,
    };
  }

  function findCheapestSupplier(rfq: RFQ, lineId: string): string | undefined {
    const costs = rfq.quotes
      .map((quote) => {
        const qLine = quote.line_items.find((item) => item.mr_line_item_id === lineId);
        return qLine ? { supplierId: quote.supplier_id, price: qLine.unit_price } : undefined;
      })
      .filter(Boolean) as { supplierId: string; price: number }[];

    if (costs.length === 0) return undefined;

    return costs.reduce((cheapest, current) => (current.price < cheapest.price ? current : cheapest))
      .supplierId;
  }

  function handleSelect(lineId: string, supplierId: string) {
    const previousSupplierId = selectedSuppliers[lineId];
    setSelectedSuppliers((prev) => ({ ...prev, [lineId]: supplierId }));
    sendComparisonEvent('selection_changed', {
      rfq_id: rfq.id,
      line_item_id: lineId,
      supplier_id: supplierId,
      previous_supplier_id: previousSupplierId ?? null,
    });
  }

  function buildSummary(): ComparisonSummary {
    const selections: ComparisonSelection[] = rfq.material_request.line_items.map((line) => {
      const chosenSupplierId = selectedSuppliers[line.id];
      const chosenSupplier = rfq.suppliers.find((item) => item.supplier_id === chosenSupplierId);
      const chosenQuote = rfq.quotes.find((quote) => quote.supplier_id === chosenSupplierId);
      const chosenLine = chosenQuote?.line_items.find((item) => item.mr_line_item_id === line.id);

      const cheapestSupplierId = findCheapestSupplier(rfq, line.id);
      const cheapestQuote = rfq.quotes.find((quote) => quote.supplier_id === cheapestSupplierId);
      const cheapestLine = cheapestQuote?.line_items.find((item) => item.mr_line_item_id === line.id);

      const unitPrice = chosenLine?.unit_price ?? 0;
      const totalPrice = chosenLine?.total_price ?? 0;
      const savings = cheapestLine && chosenLine
        ? Number((cheapestLine.total_price - chosenLine.total_price).toFixed(2))
        : 0;

      return {
        line_item_id: line.id,
        line_description: line.description,
        supplier_id: chosenSupplierId ?? '',
        supplier_name: chosenSupplier?.supplier.name ?? 'Unassigned',
        unit_price: Number(unitPrice.toFixed(2)),
        total_price: Number(totalPrice.toFixed(2)),
        savings,
      };
    });

    return {
      rfq_id: rfq.id,
      rfq_number: rfq.rfq_number,
      material_request: {
        id: rfq.material_request.id,
        mrn: rfq.material_request.mrn,
        project_name: rfq.material_request.project_name,
      },
      selections,
      generated_at: new Date().toISOString(),
    };
  }

  async function handleSaveSelections() {
    const summary = buildSummary();
    setSaving(true);
    try {
      await persistComparisonEvent('selection_saved', summary);
      if (onSaveSelections) {
        onSaveSelections(summary);
      }
    } catch (error) {
      console.error('Failed to persist comparison selections', error);
    } finally {
      setSaving(false);
    }
  }

  function buildCSV(summary: ComparisonSummary): string {
    const headers = [
      'MR Line ID',
      'Description',
      'Selected Supplier ID',
      'Selected Supplier Name',
      'Unit Price (AED)',
      'Total Price (AED)',
      'Savings vs Best (AED)',
    ];

    const rows = summary.selections.map((selection) => [
      selection.line_item_id,
      selection.line_description,
      selection.supplier_id,
      selection.supplier_name,
      selection.unit_price.toFixed(2),
      selection.total_price.toFixed(2),
      selection.savings.toFixed(2),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  function handleExport() {
    setExporting(true);
    try {
      const summary = buildSummary();
      persistComparisonEvent('exported', summary).catch((error) => {
        console.error('Failed to log comparison export', error);
      });
      const csv = buildCSV(summary);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${summary.rfq_number}-comparison.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function persistComparisonEvent(event: ComparisonEvent, summary: ComparisonSummary) {
    try {
      setActionError(null);
      const response = await fetch(`/api/rfqs/${rfq.id}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, summary }),
      });

      if (!response.ok) {
        const message = `Comparison ${event.replace('_', ' ')} failed`;
        setActionError(message);
        throw new Error(message);
      }

      return await response.json().catch(() => undefined);
    } catch (error) {
      setActionError((current) => current ?? 'Unable to persist comparison activity. Your actions are still saved locally.');
      throw error;
    }
  }

  async function sendComparisonEvent(event: ComparisonEvent, payload: unknown) {
    try {
      await fetch(`/api/rfqs/${rfq.id}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload }),
      });
    } catch (error) {
      console.error('Comparison event logging failed', error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-brand-surface shadow-2xl" role="dialog" aria-labelledby="comparison-grid-title">
        <header className="sticky top-0 flex flex-col gap-2 border-b border-brand-text/10 bg-brand-surface/95 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-text/50">RFQ Comparison</p>
              <h2 id="comparison-grid-title" className="text-2xl font-bold text-brand-text">
                {rfq.material_request.project_name}
              </h2>
              <p className="text-sm text-brand-text/60">
                Material Request {rfq.material_request.mrn} • RFQ {rfq.rfq_number}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleSaveSelections} isLoading={saving}>
                Save selections
              </Button>
              <Button variant="secondary" onClick={handleExport} isLoading={exporting}>
                Export summary (CSV)
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text/60">
            <Badge variant="primary" soft={true}>
              Lowest price highlight
            </Badge>
            <Badge variant="warning" soft={true}>
              Manual supplier invite
            </Badge>
            <Badge variant="neutral" soft={true}>
              Attachments available
            </Badge>
          </div>
          {actionError && (
            <p className="text-xs text-status-warning">
              {actionError}
            </p>
          )}
        </header>

        <main className="space-y-6 px-8 py-6">
          <section className="space-y-4">
            <header className="space-y-1">
              <h3 className="text-lg font-semibold text-brand-text">Quote comparison grid</h3>
              <p className="text-sm text-brand-text/60">
                Compare supplier quotes across each material request line item. Select the recommended supplier per line.
              </p>
            </header>

            <div className="overflow-x-auto rounded-xl border border-brand-text/10">
              <Table>
                <TableHead className="sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHeaderCell className="min-w-[220px]">Line item</TableHeaderCell>
                    {rfq.suppliers.map((supplier) => {
                      const isManualInvite = supplier.invitation_type === 'manual';
                      return (
                        <TableHeaderCell key={supplier.supplier_id} className="min-w-[200px] text-center">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-brand-text">{supplier.supplier.name}</p>
                            <p className="text-xs text-brand-text/50">{supplier.status.toUpperCase()}</p>
                            {isManualInvite && (
                              <span className="inline-block rounded-full bg-status-warning/15 px-2 py-0.5 text-[11px] font-medium text-status-warning">
                                Manual invite
                              </span>
                            )}
                          </div>
                        </TableHeaderCell>
                      );
                    })}
                    <TableHeaderCell className="min-w-[160px] text-center">Select supplier</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluationRows.map(({ line, supplierCells, cheapestSupplierId }) => (
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

                      {supplierCells.map(({ supplier, lineItem, unitPrice, totalPrice, leadTime }) => {
                        const isCheapest = supplier.supplier_id === cheapestSupplierId;
                        const isSelected = selectedSuppliers[line.id] === supplier.supplier_id;
                        const attachmentsCount = lineItem?.attachments?.length ?? 0;
                        return (
                          <TableCell
                            key={`${line.id}-${supplier.supplier_id}`}
                            className={cn(
                              'align-top text-sm',
                              isCheapest && 'bg-status-success/10',
                              isSelected && 'ring-2 ring-brand-primary'
                            )}
                          >
                            {lineItem ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-brand-text">
                                  AED {unitPrice?.toFixed(2)}
                                </p>
                                <p className="text-xs text-brand-text/60">
                                  Total: AED {totalPrice?.toFixed(2)}
                                </p>
                                <p className="text-xs text-brand-text/60">
                                  Lead time: {leadTime} days
                                </p>
                                {attachmentsCount > 0 && (
                                  <p className="text-xs font-medium text-brand-text/70">
                                    Attachments: {attachmentsCount}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-brand-text/50">No quote</p>
                            )}
                          </TableCell>
                        );
                      })}

                      <TableCell className="align-top text-center">
                        <div className="flex flex-col items-center gap-2">
                          {rfq.suppliers.map((supplier) => (
                            <label key={`${line.id}-${supplier.supplier_id}`} className="flex items-center gap-2 text-xs">
                              <input
                                type="radio"
                                name={`selection-${line.id}`}
                                value={supplier.supplier_id}
                                checked={selectedSuppliers[line.id] === supplier.supplier_id}
                                onChange={() => handleSelect(line.id, supplier.supplier_id)}
                                className="h-4 w-4 border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                              />
                              <span className="text-brand-text/70">{supplier.supplier.name}</span>
                            </label>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="space-y-3">
            <header className="space-y-1">
              <h3 className="text-lg font-semibold text-brand-text">Summary</h3>
              <p className="text-sm text-brand-text/60">Selections feed the quote pack and audit log.</p>
            </header>
            <Card className="space-y-2 border-brand-text/15 p-4">
              {rfq.material_request.line_items.map((line) => {
                const chosenSupplierId = selectedSuppliers[line.id];
                const chosenSupplier = rfq.suppliers.find((supplier) => supplier.supplier_id === chosenSupplierId);
                const cheapestSupplierId = findCheapestSupplier(rfq, line.id);
                const cheapestQuote = rfq.quotes.find((quote) => quote.supplier_id === cheapestSupplierId);
                const chosenQuote = rfq.quotes.find((quote) => quote.supplier_id === chosenSupplierId);
                const chosenLine = chosenQuote?.line_items.find((item) => item.mr_line_item_id === line.id);
                const cheapestLine = cheapestQuote?.line_items.find((item) => item.mr_line_item_id === line.id);
                const savings = cheapestLine && chosenLine
                  ? Number((cheapestLine.total_price - chosenLine.total_price).toFixed(2))
                  : 0;

                return (
                  <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand-text/10 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{line.description}</p>
                      <p className="text-xs text-brand-text/50">{line.item_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-brand-text/70">{chosenSupplier?.supplier.name ?? 'Unassigned'}</p>
                      {chosenLine && (
                        <p className="text-xs text-brand-text/50">
                          AED {chosenLine.total_price.toFixed(2)} ({chosenLine.unit_price.toFixed(2)}/ {line.uom})
                        </p>
                      )}
                      {savings !== 0 && (
                        <p className={cn('text-xs font-semibold', savings > 0 ? 'text-status-success' : 'text-status-warning')}>
                          {savings > 0 ? `Saving AED ${savings.toFixed(2)}` : `+AED ${Math.abs(savings).toFixed(2)} vs best`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
