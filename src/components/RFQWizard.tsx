'use client';

import { useCallback, useMemo, useState } from 'react';
import { MaterialRequest, MRLineItem, RFQ, Supplier } from '@/types/procurement';
import { Badge, Button, Card, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ManualSupplier {
  id: string;
  name: string;
  email: string;
  category: string;
}

interface ManualDraft {
  name: string;
  email: string;
  category: string;
}

interface RFQWizardProps {
  materialRequest: MaterialRequest;
  suppliers: Supplier[];
  onClose: () => void;
  onCreated: (rfq: RFQ) => void;
}

const steps = ['Line Items', 'Suppliers', 'Details', 'Review'];
const DEFAULT_CATEGORY = 'General Supplies';

function createInitialSelectionMap(lineItems: MRLineItem[]) {
  return lineItems.reduce<Record<string, Set<string>>>((acc, line) => {
    acc[line.id] = new Set();
    return acc;
  }, {});
}

function buildManualDrafts(lineItems: MRLineItem[]) {
  return lineItems.reduce<Record<string, ManualDraft>>((drafts, line) => {
    drafts[line.id] = {
      name: '',
      email: '',
      category: DEFAULT_CATEGORY,
    };
    return drafts;
  }, {});
}

export function RFQWizard({ materialRequest, suppliers, onClose, onCreated }: RFQWizardProps) {
  const lineItems = materialRequest.line_items;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<Set<string>>(
    () => new Set(lineItems.map((item) => item.id))
  );
  const [lineSupplierSelections, setLineSupplierSelections] = useState<Record<string, Set<string>>>(
    () => createInitialSelectionMap(lineItems)
  );
  const [manualSuppliersByLine, setManualSuppliersByLine] = useState<Record<string, ManualSupplier[]>>({});
  const [manualDrafts, setManualDrafts] = useState<Record<string, ManualDraft>>(
    () => buildManualDrafts(lineItems)
  );
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supplierMap = useMemo(() => new Map(suppliers.map((supplier) => [supplier.id, supplier])), [suppliers]);

  const selectedLineItems = useMemo(
    () => lineItems.filter((item) => selectedLineItemIds.has(item.id)),
    [lineItems, selectedLineItemIds]
  );

  const scoreSupplierForLine = useCallback((line: MRLineItem, supplier: Supplier) => {
    let score = supplier.rating;
    if (supplier.has_been_used) {
      score += 2;
    }

    const descriptionTokens = line.description.toLowerCase().split(/\s+/g);
    if (supplier.category) {
      const categoryToken = supplier.category.toLowerCase();
      if (descriptionTokens.some((token) => categoryToken.includes(token))) {
        score += 1.5;
      }
    }

    if (supplier.avg_response_time > 0) {
      score -= supplier.avg_response_time / 48;
    }

    return score;
  }, []);

  const suggestionsByLine = useMemo(() => {
    const map = new Map<string, Supplier[]>();
    selectedLineItems.forEach((line) => {
      const sorted = [...suppliers]
        .sort((a, b) => scoreSupplierForLine(line, b) - scoreSupplierForLine(line, a))
        .slice(0, 6);
      map.set(line.id, sorted);
    });
    return map;
  }, [selectedLineItems, suppliers, scoreSupplierForLine]);

  const manualDraftForLine = useCallback(
    (lineId: string): ManualDraft => {
      if (!manualDrafts[lineId]) {
        setManualDrafts((drafts) => ({ ...drafts, [lineId]: { name: '', email: '', category: DEFAULT_CATEGORY } }));
        return { name: '', email: '', category: DEFAULT_CATEGORY };
      }
      return manualDrafts[lineId];
    },
    [manualDrafts]
  );

  const updateManualDraft = useCallback((lineId: string, field: keyof ManualDraft, value: string) => {
    setManualDrafts((drafts) => ({
      ...drafts,
      [lineId]: {
        ...manualDraftForLine(lineId),
        [field]: value,
      },
    }));
  }, [manualDraftForLine]);

  const toggleLineItem = useCallback((lineItem: MRLineItem) => {
    setSelectedLineItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineItem.id)) {
        next.delete(lineItem.id);
      } else {
        next.add(lineItem.id);
      }
      return next;
    });
  }, []);

  const toggleSupplierForLine = useCallback((lineId: string, supplierId: string) => {
    setLineSupplierSelections((prev) => {
      const next = { ...prev };
      const currentSet = new Set(next[lineId] ?? []);
      if (currentSet.has(supplierId)) {
        currentSet.delete(supplierId);
      } else {
        currentSet.add(supplierId);
      }
      next[lineId] = currentSet;
      return next;
    });
  }, []);

  const selectAllSuppliersForLine = useCallback((lineId: string, suggestions: Supplier[]) => {
    setLineSupplierSelections((prev) => ({
      ...prev,
      [lineId]: new Set(suggestions.map((supplier) => supplier.id)),
    }));
  }, []);

  const clearSuppliersForLine = useCallback((lineId: string) => {
    setLineSupplierSelections((prev) => ({ ...prev, [lineId]: new Set() }));
    setManualSuppliersByLine((prev) => ({
      ...prev,
      [lineId]: [],
    }));
    setManualDrafts((prev) => ({
      ...prev,
      [lineId]: { name: '', email: '', category: DEFAULT_CATEGORY },
    }));
  }, []);

  const addManualSupplier = useCallback((lineId: string) => {
    const draft = manualDraftForLine(lineId);
    const isValid = draft.name.trim().length > 0 && /@/.test(draft.email.trim());
    if (!isValid) return;

    const manualSupplier: ManualSupplier = {
      id: `manual-${lineId}-${Date.now()}`,
      name: draft.name.trim(),
      email: draft.email.trim(),
      category: draft.category.trim() || DEFAULT_CATEGORY,
    };

    setManualSuppliersByLine((prev) => ({
      ...prev,
      [lineId]: [...(prev[lineId] ?? []), manualSupplier],
    }));

    setManualDrafts((prev) => ({
      ...prev,
      [lineId]: { name: '', email: '', category: DEFAULT_CATEGORY },
    }));
  }, [manualDraftForLine]);

  const removeManualSupplier = useCallback((lineId: string, manualId: string) => {
    setManualSuppliersByLine((prev) => ({
      ...prev,
      [lineId]: (prev[lineId] ?? []).filter((supplier) => supplier.id !== manualId),
    }));
  }, []);

  const suppliersSelectedForLine = useCallback(
    (lineId: string) => {
      const suggestedCount = lineSupplierSelections[lineId]?.size ?? 0;
      const manualCount = manualSuppliersByLine[lineId]?.length ?? 0;
      return suggestedCount + manualCount;
    },
    [lineSupplierSelections, manualSuppliersByLine]
  );

  const hasSuppliersForAllSelectedLines = useMemo(() => {
    if (selectedLineItems.length === 0) return false;
    return selectedLineItems.every((line) => suppliersSelectedForLine(line.id) > 0);
  }, [selectedLineItems, suppliersSelectedForLine]);

  const reviewLines = useMemo(() => {
    return selectedLineItems.map((line) => {
      const suggestedSelections = Array.from(lineSupplierSelections[line.id] ?? []).map((supplierId) => {
        const supplier = supplierMap.get(supplierId);
        return supplier ? { supplier, type: 'suggested' as const } : null;
      }).filter(Boolean) as Array<{ supplier: Supplier; type: 'suggested' }>;

      const manualSelections = (manualSuppliersByLine[line.id] ?? []).map((manual) => ({
        manual,
        type: 'manual' as const,
      }));

      return {
        line,
        suggested: suggestedSelections,
        manual: manualSelections,
      };
    });
  }, [lineSupplierSelections, manualSuppliersByLine, selectedLineItems, supplierMap]);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const lineSuppliersPayload = selectedLineItems.map((line) => ({
        line_item_id: line.id,
        suppliers: [
          ...Array.from(lineSupplierSelections[line.id] ?? []).map((supplierId) => {
            const supplier = supplierMap.get(supplierId);
            return {
              supplier_id: supplierId,
              type: 'suggested' as const,
              name: supplier?.name,
              email: supplier?.email,
              category: supplier?.category,
            };
          }),
          ...(manualSuppliersByLine[line.id] ?? []).map((manual) => ({
            supplier_id: manual.id,
            type: 'manual' as const,
            name: manual.name,
            email: manual.email,
            category: manual.category,
          })),
        ],
      }));

      const aggregatedSuppliers = new Map<string, { supplier_id: string; name?: string; email?: string; category?: string }>();
      lineSuppliersPayload.forEach((entry) => {
        entry.suppliers.forEach((supplier) => {
          if (!aggregatedSuppliers.has(supplier.supplier_id)) {
            aggregatedSuppliers.set(supplier.supplier_id, {
              supplier_id: supplier.supplier_id,
              name: supplier.name,
              email: supplier.email,
              category: supplier.category,
            });
          }
        });
      });

      const response = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_request_id: materialRequest.id,
          line_item_ids: Array.from(selectedLineItemIds),
          due_date: dueDate || undefined,
          terms: terms || undefined,
          remarks: remarks || undefined,
          suppliers: Array.from(aggregatedSuppliers.values()),
          line_suppliers: lineSuppliersPayload,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create RFQ');
      }

      const rfq = (await response.json()) as RFQ;
      setSuccessMessage(`RFQ ${rfq.rfq_number} dispatched to ${rfq.suppliers.length} supplier(s).`);
      onCreated(rfq);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error creating RFQ');
      setIsSubmitting(false);
    }
  }

  function canProceed(step: number) {
    if (step === 0) {
      return selectedLineItemIds.size > 0;
    }
    if (step === 1) {
      return hasSuppliersForAllSelectedLines;
    }
    if (step === 2) {
      return dueDate.length > 0;
    }
    return true;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-brand-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-text/10 px-8 py-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-text/60">RFQ Wizard</p>
            <h2 className="text-2xl font-bold text-brand-text">{materialRequest.project_name}</h2>
            <p className="text-sm text-brand-text/60">Material Request {materialRequest.mrn}</p>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold',
                    index === currentStep
                      ? 'border-brand-primary bg-brand-primary text-white'
                      : index < currentStep
                        ? 'border-brand-primary bg-brand-primary/20 text-brand-primary'
                        : 'border-brand-text/15 bg-brand-surface text-brand-text/50'
                  )}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && <div className="h-px w-6 bg-brand-text/20" />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 px-8 py-6">
          {error && (
            <div className="rounded-lg border border-status-warning/40 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-status-success/40 bg-status-success/10 px-4 py-3 text-sm text-status-success">
              {successMessage}
            </div>
          )}

          {currentStep === 0 && (
            <section className="space-y-4">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-brand-text">Select line items</h3>
                  <p className="text-sm text-brand-text/60">Choose which items will be included in this RFQ.</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLineItemIds(new Set(lineItems.map((item) => item.id)))}
                  >
                    Select all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLineItemIds(new Set())}>
                    Clear
                  </Button>
                </div>
              </header>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-brand-text/50">
                    <th className="px-3 py-2">Select</th>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2">UoM</th>
                    <th className="px-3 py-2">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => {
                    const selected = selectedLineItemIds.has(item.id);
                    return (
                      <tr key={item.id} className={cn('border-b border-brand-text/10 last:border-b-0', selected && 'bg-brand-primary/5')}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleLineItem(item)}
                            className="h-4 w-4 rounded border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-brand-text">{item.description}</div>
                          <div className="text-xs text-brand-text/50">{item.item_code}</div>
                        </td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">{item.uom}</td>
                        <td className="px-3 py-2">{item.location ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {currentStep === 1 && (
            <section className="space-y-6">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-brand-text">Select suppliers per line</h3>
                <p className="text-sm text-brand-text/60">
                  Recommended suppliers are organised beneath each line item. Pick individual suppliers or use Select all to invite
                  everyone for that line. Add manual contacts when no suggestions exist.
                </p>
              </header>

              {selectedLineItems.length === 0 && (
                <Card className="border-dashed border-brand-text/20 bg-brand-primary/5 p-6 text-sm text-brand-text/70">
                  Select at least one line item to see supplier recommendations.
                </Card>
              )}

              {selectedLineItems.map((line) => {
                const suggestions = suggestionsByLine.get(line.id) ?? [];
                const selectedSuggestions = lineSupplierSelections[line.id] ?? new Set();
                const manualEntries = manualSuppliersByLine[line.id] ?? [];
                const draft = manualDraftForLine(line.id);
                const hasValidManualDraft = draft.name.trim().length > 0 && /@/.test(draft.email.trim());

                const primaryContact = (supplierId: string) => {
                  const supplier = supplierMap.get(supplierId);
                  if (!supplier) return null;
                  return supplier.contacts?.find((contact) => contact.is_primary) ?? supplier.contacts?.[0] ?? null;
                };

                return (
                  <Card key={line.id} className="border-brand-text/15">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-brand-text">{line.description}</h4>
                        <p className="text-sm text-brand-text/60">
                          {line.quantity} {line.uom} · {line.item_code}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectAllSuppliersForLine(line.id, suggestions)}
                          disabled={suggestions.length === 0}
                        >
                          Select all
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => clearSuppliersForLine(line.id)}>
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {suggestions.length > 0 ? (
                        suggestions.map((supplier) => {
                          const selected = selectedSuggestions.has(supplier.id);
                          const contact = primaryContact(supplier.id);
                          return (
                            <div
                              key={`${line.id}-${supplier.id}`}
                              className={cn(
                                'flex items-start justify-between rounded-lg border px-4 py-3 transition-colors',
                                selected
                                  ? 'border-brand-primary bg-brand-primary/5'
                                  : 'border-brand-text/15 hover:border-brand-text/25'
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-semibold text-brand-text">{supplier.name}</h5>
                                  <Badge variant="primary">Suggested</Badge>
                                </div>
                                <p className="text-xs text-brand-text/60">{supplier.category}</p>
                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-brand-text/60">
                                  <span>Rating {supplier.rating.toFixed(1)}</span>
                                  <span>{supplier.quote_count} quotes</span>
                                  <span>Avg response {supplier.avg_response_time}h</span>
                                  <span>Last quote {new Date(supplier.last_quote_date).toLocaleDateString()}</span>
                                </div>
                                {contact && (
                                  <div className="mt-2 text-xs text-brand-text/60">
                                    Contact: {contact.name} · {contact.email}
                                  </div>
                                )}
                              </div>
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSupplierForLine(line.id, supplier.id)}
                                className="mt-1 h-4 w-4 rounded border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                                aria-label={`Invite ${supplier.name} for ${line.description}`}
                              />
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-lg border border-dashed border-status-warning/40 bg-status-warning/5 px-4 py-3 text-sm text-status-warning">
                          No historical suppliers found for this line. Add a new supplier below to continue.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-brand-text">Invite a new supplier</p>
                        <Button variant="ghost" size="sm" onClick={() => addManualSupplier(line.id)} disabled={!hasValidManualDraft}>
                          Add supplier
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Input
                          label="Supplier name"
                          value={draft.name}
                          onChange={(event) => updateManualDraft(line.id, 'name', event.target.value)}
                          required
                        />
                        <Input
                          label="Contact email"
                          type="email"
                          value={draft.email}
                          onChange={(event) => updateManualDraft(line.id, 'email', event.target.value)}
                          required
                          error={draft.email && !/@/.test(draft.email) ? 'Enter a valid email address.' : undefined}
                        />
                        <Input
                          label="Category"
                          value={draft.category}
                          onChange={(event) => updateManualDraft(line.id, 'category', event.target.value)}
                        />
                      </div>

                      {manualEntries.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold uppercase tracking-wide text-brand-text/60">Manual invites</h5>
                          {manualEntries.map((manual) => (
                            <div key={manual.id} className="flex items-center justify-between rounded-md border border-brand-text/10 px-3 py-2 text-sm">
                              <div>
                                <p className="font-medium text-brand-text">{manual.name}</p>
                                <p className="text-xs text-brand-text/60">{manual.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="warning">Manual</Badge>
                                <Button variant="ghost" size="sm" onClick={() => removeManualSupplier(line.id, manual.id)}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-6">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-brand-text">RFQ details</h3>
                <p className="text-sm text-brand-text/60">Tell suppliers when you need their response and add any special terms.</p>
              </header>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Due date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  required
                />
                <Input
                  label="Payment or delivery terms"
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  placeholder="Net 30, delivery to Project Alpha, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-text/70" htmlFor="rfq-remarks">
                  Remarks for suppliers
                </label>
                <textarea
                  id="rfq-remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  className="mt-2 w-full rounded-md border border-brand-text/20 px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  rows={4}
                  placeholder="Include any attachments or instructions suppliers should know about."
                />
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-6">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-brand-text">Review & dispatch</h3>
                <p className="text-sm text-brand-text/60">Confirm the details below before sending the RFQ.</p>
              </header>

              <Card className="space-y-3 border-brand-text/15 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-text/50">Due date</p>
                    <p className="text-sm font-semibold text-brand-text">{dueDate || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-text/50">Terms</p>
                    <p className="text-sm text-brand-text/80">{terms || 'Standard procurement terms'}</p>
                  </div>
                </div>
                {remarks && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-text/50">Remarks</p>
                    <p className="text-sm text-brand-text/80">{remarks}</p>
                  </div>
                )}
              </Card>

              {reviewLines.map(({ line, suggested, manual }) => (
                <Card key={`review-${line.id}`} className="space-y-3 border-brand-text/15 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-text">{line.description}</h4>
                      <p className="text-xs text-brand-text/60">{line.quantity} {line.uom} · {line.item_code}</p>
                    </div>
                    <Badge variant="primary">{suggested.length + manual.length} supplier(s)</Badge>
                  </div>

                  <div className="space-y-2">
                    {suggested.map(({ supplier }) => (
                      <div key={`${line.id}-${supplier.id}`} className="flex items-center justify-between rounded-md border border-brand-text/10 px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium text-brand-text">{supplier.name}</p>
                          <p className="text-xs text-brand-text/60">{supplier.email}</p>
                        </div>
                        <Badge variant="primary">Suggested</Badge>
                      </div>
                    ))}

                    {manual.map(({ manual: supplier }) => (
                      <div key={supplier.id} className="flex items-center justify-between rounded-md border border-brand-text/10 px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium text-brand-text">{supplier.name}</p>
                          <p className="text-xs text-brand-text/60">{supplier.email}</p>
                        </div>
                        <Badge variant="warning">Manual</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </section>
          )}
        </div>

        <footer className="flex justify-between border-t border-brand-text/10 px-8 py-6">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={() => setCurrentStep((step) => step - 1)} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button
                variant="primary"
                onClick={() => setCurrentStep((step) => step + 1)}
                disabled={!canProceed(currentStep) || isSubmitting}
              >
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Dispatching…' : 'Dispatch RFQ'}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default RFQWizard;
