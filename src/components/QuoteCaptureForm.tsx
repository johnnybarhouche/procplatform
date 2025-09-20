'use client';

import React, { useState } from 'react';
import { Quote, QuoteLineItem, RFQ, Supplier } from '@/types/procurement';

interface QuoteCaptureFormProps {
  rfq: RFQ;
  supplier: Supplier;
  onQuoteSubmitted: (quote: Quote) => void;
  onCancel: () => void;
}

export default function QuoteCaptureForm({ rfq, supplier, onQuoteSubmitted, onCancel }: QuoteCaptureFormProps) {
  const [quoteData, setQuoteData] = useState<{
    lineItems: QuoteLineItem[];
    validUntil: string;
    termsConditions: string;
    attachments: File[];
  }>({
    lineItems: rfq.material_request.line_items.map(item => ({
      id: '',
      quote_id: '',
      mr_line_item_id: item.id,
      mr_line_item: item,
      unit_price: 0,
      quantity: item.quantity,
      total_price: 0,
      lead_time_days: 0,
      remarks: ''
    })),
    validUntil: '',
    termsConditions: '',
    attachments: []
  });

  const [loading, setLoading] = useState(false);

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: string | number) => {
    const updatedLineItems = [...quoteData.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value
    };

    // Recalculate total price
    if (field === 'unit_price' || field === 'quantity') {
      updatedLineItems[index].total_price = 
        updatedLineItems[index].unit_price * updatedLineItems[index].quantity;
    }

    setQuoteData(prev => ({
      ...prev,
      lineItems: updatedLineItems
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

  const calculateTotal = () => {
    return quoteData.lineItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quoteData.lineItems.some(item => item.unit_price <= 0)) {
      alert('Please enter valid unit prices for all line items');
      return;
    }

    setLoading(true);
    
    try {
      // Upload attachments first
      const uploadedAttachments = [];
      for (const file of quoteData.attachments) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          uploadedAttachments.push({
            id: '',
            filename: file.name,
            url: uploadResult.url,
            file_type: file.type,
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          });
        }
      }

      // Create quote
      const quoteResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfq_id: rfq.id,
          supplier_id: supplier.id,
          line_items: quoteData.lineItems,
          valid_until: quoteData.validUntil,
          terms_conditions: quoteData.termsConditions,
          attachments: uploadedAttachments,
          created_by: supplier.id,
          created_by_name: supplier.name
        }),
      });

      if (!quoteResponse.ok) {
        throw new Error('Failed to submit quote');
      }

      const newQuote = await quoteResponse.json();
      onQuoteSubmitted(newQuote);
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Submit Quote</h2>
          <p className="text-gray-600">RFQ: {rfq.rfq_number} | Supplier: {supplier.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Line Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Line Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price (AED)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total (AED)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Time (Days)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quoteData.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.mr_line_item.item_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.mr_line_item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={item.lead_time_days}
                          onChange={(e) => updateLineItem(index, 'lead_time_days', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          required
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateLineItem(index, 'remarks', e.target.value)}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Optional"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <div className="text-lg font-semibold text-gray-900">
                Total: {calculateTotal().toLocaleString()} AED
              </div>
            </div>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Valid Until *
              </label>
              <input
                type="date"
                value={quoteData.validUntil}
                onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              {quoteData.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {quoteData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms and Conditions
            </label>
            <textarea
              value={quoteData.termsConditions}
              onChange={(e) => setQuoteData(prev => ({ ...prev, termsConditions: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter terms and conditions for this quote..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
