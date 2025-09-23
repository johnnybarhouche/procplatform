'use client';

import React, { useState, useEffect } from 'react';
import { Quote, RFQ, QuoteLineItem, Attachment } from '@/types/procurement';
import { Button, Card, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

interface QuoteCaptureFormProps {
  rfq: RFQ;
  supplierId: string;
  onQuoteSubmitted: (quote: Quote) => void;
  onCancel: () => void;
}

export default function QuoteCaptureForm({ rfq, supplierId, onQuoteSubmitted, onCancel }: QuoteCaptureFormProps) {
  const [quoteData, setQuoteData] = useState({
    valid_until: '',
    terms_conditions: '',
    line_items: [] as Array<{
      mr_line_item_id: string;
      unit_price: number;
      lead_time_days: number;
      remarks: string;
    }>,
    attachments: [] as File[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supplier = rfq.suppliers.find(s => s.supplier_id === supplierId);
  const materialRequest = rfq.material_request;

  useEffect(() => {
    // Initialize line items with default values
    const initialLineItems = materialRequest.line_items.map(line => ({
      mr_line_item_id: line.id,
      unit_price: 0,
      lead_time_days: 0,
      remarks: ''
    }));
    
    setQuoteData(prev => ({
      ...prev,
      line_items: initialLineItems
    }));
  }, [materialRequest.line_items]);

  const handleLineItemChange = (lineId: string, field: string, value: string | number) => {
    setQuoteData(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => 
        item.mr_line_item_id === lineId 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setQuoteData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setQuoteData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalAmount = () => {
    return quoteData.line_items.reduce((total, item) => {
      const lineItem = materialRequest.line_items.find(l => l.id === item.mr_line_item_id);
      return total + (item.unit_price * (lineItem?.quantity || 0));
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!quoteData.valid_until) {
        throw new Error('Valid until date is required');
      }

      if (quoteData.line_items.some(item => item.unit_price <= 0)) {
        throw new Error('All line items must have a unit price greater than 0');
      }

      // Prepare line items with material request data
      const lineItemsWithData = quoteData.line_items.map(item => {
        const mrLineItem = materialRequest.line_items.find(l => l.id === item.mr_line_item_id);
        return {
          mr_line_item_id: item.mr_line_item_id,
          mr_line_item: mrLineItem!,
          unit_price: item.unit_price,
          quantity: mrLineItem!.quantity,
          total_price: item.unit_price * mrLineItem!.quantity,
          lead_time_days: item.lead_time_days,
          remarks: item.remarks
        };
      });

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfq_id: rfq.id,
          supplier_id: supplierId,
          valid_until: quoteData.valid_until,
          terms_conditions: quoteData.terms_conditions,
          line_items: lineItemsWithData,
          attachments: [], // File uploads would need separate handling
          created_by: 'supplier',
          created_by_name: supplier?.supplier.name || 'Supplier'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quote');
      }

      const newQuote = await response.json();
      onQuoteSubmitted(newQuote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quote');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return quoteData.valid_until && 
           quoteData.line_items.every(item => item.unit_price > 0 && item.lead_time_days > 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-brand-text/10">
          <h2 className="text-2xl font-bold text-brand-text">Submit Quote</h2>
          <p className="text-brand-text/70">
            RFQ: {rfq.rfq_number} | Supplier: {supplier?.supplier.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-status-warning/40 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
              {error}
            </div>
          )}

          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">
                Valid Until *
              </label>
              <Input
                type="date"
                value={quoteData.valid_until}
                onChange={(e) => setQuoteData(prev => ({ ...prev, valid_until: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">
                Terms & Conditions
              </label>
              <Input
                value={quoteData.terms_conditions}
                onChange={(e) => setQuoteData(prev => ({ ...prev, terms_conditions: e.target.value }))}
                placeholder="e.g., Net 30 days, Delivery within 7 days"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-lg font-semibold text-brand-text mb-4">Quote Line Items</h3>
            <div className="space-y-4">
              {materialRequest.line_items.map((lineItem) => {
                const quoteItem = quoteData.line_items.find(item => item.mr_line_item_id === lineItem.id);
                if (!quoteItem) return null;

                return (
                  <Card key={lineItem.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-brand-text">{lineItem.description}</h4>
                        <p className="text-sm text-brand-text/70">{lineItem.item_code}</p>
                        <p className="text-sm text-brand-text/70">
                          Quantity: {lineItem.quantity} {lineItem.uom}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-text/80 mb-1">
                          Unit Price (AED) *
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={quoteItem.unit_price}
                          onChange={(e) => handleLineItemChange(lineItem.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-text/80 mb-1">
                          Lead Time (Days) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={quoteItem.lead_time_days}
                          onChange={(e) => handleLineItemChange(lineItem.id, 'lead_time_days', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-brand-text/80 mb-1">
                        Remarks
                      </label>
                      <Input
                        value={quoteItem.remarks}
                        onChange={(e) => handleLineItemChange(lineItem.id, 'remarks', e.target.value)}
                        placeholder="Any additional notes for this line item"
                      />
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-sm font-medium text-brand-text">
                        Total: AED {(quoteItem.unit_price * lineItem.quantity).toFixed(2)}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-lg font-semibold text-brand-text mb-4">Attachments</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-brand-text/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-brand-text/50 mt-1">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)
                </p>
              </div>
              
              {quoteData.attachments.length > 0 && (
                <div className="space-y-2">
                  {quoteData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-brand-surface rounded border">
                      <span className="text-sm text-brand-text">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quote Summary */}
          <Card className="p-4 bg-brand-primary/5">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-brand-text">Total Quote Amount:</span>
              <span className="text-2xl font-bold text-brand-primary">
                AED {calculateTotalAmount().toLocaleString()}
              </span>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-brand-text/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid() || loading}
            >
              {loading ? 'Submitting...' : 'Submit Quote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
