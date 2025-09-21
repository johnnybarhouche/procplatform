'use client';

import { useMemo, useState, useCallback } from 'react';
import { MaterialRequest, MRLineItem, RFQ, Supplier } from '@/types/procurement';
import { Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ManualSupplier {
  id: string;
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

export function RFQWizard({ materialRequest, suppliers, onClose, onCreated }: RFQWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<Set<string>>(
    () => new Set(materialRequest.line_items.map((item) => item.id))
  );
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set());
  const [manualSuppliers, setManualSuppliers] = useState<ManualSupplier[]>([]);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCategory, setManualCategory] = useState('General Supplies');
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const lineItems = materialRequest.line_items;

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    lineItems.forEach((item) => {
      const key = item.description.split(' ')[0].toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [lineItems]);

  const scoreSupplier = useCallback(
    (supplier: Supplier): number => {
      let score = supplier.rating;
      if (supplier.has_been_used) score += 2;
      const categoryKey = supplier.category?.split(' ')[0]?.toLowerCase();
      if (categoryKey && categoryCounts.has(categoryKey)) {
        score += categoryCounts.get(categoryKey)! * 1.5;
      }
      score -= supplier.avg_response_time / 24;
      return score;
    },
    [categoryCounts]
  );

  const suggestedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => scoreSupplier(b) - scoreSupplier(a));
  }, [suppliers, scoreSupplier]);

  const allSuppliersSelected = selectedSupplierIds.size + manualSuppliers.length > 0;
  const allLineItemsSelected = selectedLineItemIds.size > 0;

  const manualSupplierValid = manualName.trim().length > 0 && /@/.test(manualEmail);

  const reviewSuppliers = useMemo(() => {
    const autoSuppliers = suggestedSuppliers.filter((supplier) => selectedSupplierIds.has(supplier.id));
    return [
      ...autoSuppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        category: supplier.category,
        type: 'existing' as const,
      })),
      ...manualSuppliers.map((supplier) => ({
        ...supplier,
        type: 'manual' as const,
      })),
    ];
  }, [manualSuppliers, selectedSupplierIds, suggestedSuppliers]);

  function toggleLineItem(lineItem: MRLineItem) {
    setSelectedLineItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineItem.id)) {
        next.delete(lineItem.id);
      } else {
        next.add(lineItem.id);
      }
      return next;
    });
  }

  function toggleSupplier(supplierId: string) {
    setSelectedSupplierIds((prev) => {
      const next = new Set(prev);
      if (next.has(supplierId)) {
        next.delete(supplierId);
      } else {
        next.add(supplierId);
      }
      return next;
    });
  }

  function handleAddManualSupplier() {
    if (!manualSupplierValid) return;
    const supplier: ManualSupplier = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: manualName.trim(),
      email: manualEmail.trim(),
      category: manualCategory.trim() || 'General Supplies',
    };
    setManualSuppliers((current) => [...current, supplier]);
    setManualName('');
    setManualEmail('');
    setManualCategory('General Supplies');
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_request_id: materialRequest.id,
          line_item_ids: Array.from(selectedLineItemIds),
          due_date: dueDate || undefined,
          terms: terms || undefined,
          remarks: remarks || undefined,
          suppliers: [
            ...Array.from(selectedSupplierIds).map((supplierId) => ({ supplier_id: supplierId })),
            ...manualSuppliers.map((supplier) => ({
              supplier_id: supplier.id,
              name: supplier.name,
              email: supplier.email,
              category: supplier.category,
            })),
          ],
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
      return allLineItemsSelected;
    }
    if (step === 1) {
      return allSuppliersSelected;
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

              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Select</TableHeaderCell>
                    <TableHeaderCell>Item</TableHeaderCell>
                    <TableHeaderCell>Quantity</TableHeaderCell>
                    <TableHeaderCell>UoM</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((item) => {
                    const selected = selectedLineItemIds.has(item.id);
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(selected && 'bg-brand-primary/5')}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleLineItem(item)}
                            className="h-4 w-4 rounded border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-brand-text">{item.description}</div>
                          <div className="text-xs text-brand-text/50">{item.item_code}</div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.uom}</TableCell>
                        <TableCell>{item.location ?? '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </section>
          )}

          {currentStep === 1 && (
            <section className="space-y-6">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-brand-text">Select suppliers</h3>
                <p className="text-sm text-brand-text/60">Recommended suppliers are ranked using historical performance and category fit.</p>
              </header>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {suggestedSuppliers.map((supplier) => {
                  const selected = selectedSupplierIds.has(supplier.id);
                  return (
                    <Card
                      key={supplier.id}
                      className={cn(
                        'cursor-pointer border transition-colors',
                        selected ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-text/10 hover:border-brand-text/20'
                      )}
                      onClick={() => toggleSupplier(supplier.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-brand-text">{supplier.name}</h4>
                          <p className="text-sm text-brand-text/60">{supplier.category}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-brand-text/60">
                            <span>Rating: {supplier.rating.toFixed(1)}</span>
                            <span>{supplier.quote_count} quotes</span>
                            <span>Avg response {supplier.avg_response_time}h</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                          onChange={() => toggleSupplier(supplier.id)}
                          checked={selected}
                          aria-label={`select supplier ${supplier.name}`}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="space-y-4 border-dashed border-brand-text/20 bg-brand-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-brand-text">Invite a new supplier</h4>
                    <p className="text-xs text-brand-text/60">Add ad-hoc contacts for this RFQ.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleAddManualSupplier} disabled={!manualSupplierValid}>
                    Add supplier
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="Supplier name"
                    value={manualName}
                    onChange={(event) => setManualName(event.target.value)}
                    required
                  />
                  <Input
                    label="Contact email"
                    type="email"
                    value={manualEmail}
                    onChange={(event) => setManualEmail(event.target.value)}
                    required
                    error={manualEmail && !manualSupplierValid ? 'Enter a valid email address.' : undefined}
                  />
                  <Input
                    label="Category"
                    value={manualCategory}
                    onChange={(event) => setManualCategory(event.target.value)}
                  />
                </div>

                {manualSuppliers.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wide text-brand-text/60">Manual invites</h5>
                    {manualSuppliers.map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between rounded-md border border-brand-text/10 px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium text-brand-text">{supplier.name}</p>
                          <p className="text-xs text-brand-text/60">{supplier.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setManualSuppliers((current) => current.filter((item) => item.id !== supplier.id))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
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

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="space-y-3 border-brand-text/15 p-4">
                  <h4 className="text-sm font-semibold text-brand-text">Line items ({selectedLineItemIds.size})</h4>
                  <div className="space-y-2">
                    {lineItems
                      .filter((item) => selectedLineItemIds.has(item.id))
                      .map((item) => (
                        <div key={item.id} className="rounded-md border border-brand-text/10 px-3 py-2">
                          <p className="text-sm font-medium text-brand-text">{item.description}</p>
                          <p className="text-xs text-brand-text/50">
                            {item.quantity} {item.uom} · {item.item_code}
                          </p>
                        </div>
                      ))}
                  </div>
                </Card>

                <Card className="space-y-3 border-brand-text/15 p-4">
                  <h4 className="text-sm font-semibold text-brand-text">Suppliers ({reviewSuppliers.length})</h4>
                  <div className="space-y-2">
                    {reviewSuppliers.map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between rounded-md border border-brand-text/10 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-brand-text">{supplier.name}</p>
                          <p className="text-xs text-brand-text/50">{supplier.email}</p>
                        </div>
                        <Badge variant={supplier.type === 'manual' ? 'warning' : 'primary'}>{supplier.type}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
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
