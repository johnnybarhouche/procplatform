'use client';

import React, { useState } from 'react';
import { QuotePack, Quote, RFQ } from '@/types/procurement';

interface QuotePackFormProps {
  rfq: RFQ;
  selectedQuotes: Quote[];
  onQuotePackCreated: (quotePack: QuotePack) => void;
  onCancel: () => void;
}

export default function QuotePackForm({ rfq, selectedQuotes, onQuotePackCreated, onCancel }: QuotePackFormProps) {
  const [comparisonData, setComparisonData] = useState({
    totalSavings: 0,
    recommendedSuppliers: [] as string[],
    keyDifferences: [] as string[],
    riskAssessment: ''
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const calculateComparisonData = () => {
    if (selectedQuotes.length === 0) return;

    const totalSavings = Math.max(...selectedQuotes.map(q => q.total_amount)) - 
                        Math.min(...selectedQuotes.map(q => q.total_amount));
    
    const bestQuote = selectedQuotes.reduce((best, current) => 
      current.total_amount < best.total_amount ? current : best
    );
    
    const recommendedSuppliers = [bestQuote.supplier.name];
    
    const keyDifferences = [
      `Price variance: ${((totalSavings / Math.max(...selectedQuotes.map(q => q.total_amount))) * 100).toFixed(1)}%`,
      `Lead time range: ${Math.min(...selectedQuotes.flatMap(q => q.line_items.map(item => item.lead_time_days)))} - ${Math.max(...selectedQuotes.flatMap(q => q.line_items.map(item => item.lead_time_days)))} days`
    ];

    setComparisonData({
      totalSavings,
      recommendedSuppliers,
      keyDifferences,
      riskAssessment: 'Standard procurement risk assessment applies'
    });
    };
    
    calculateComparisonData();
  }, [selectedQuotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/quote-packs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfq_id: rfq.id,
          quote_ids: selectedQuotes.map(q => q.id),
          comparison_data: comparisonData,
          created_by: '1',
          created_by_name: 'Procurement Officer'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create quote pack');
      }

      const newQuotePack = await response.json();
      onQuotePackCreated(newQuotePack);
    } catch (error) {
      console.error('Error creating quote pack:', error);
      alert('Failed to create quote pack. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Quote Pack</h2>
          <p className="text-gray-600">RFQ: {rfq.rfq_number} | {selectedQuotes.length} quotes selected</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selected Quotes Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Quotes</h3>
            <div className="space-y-3">
              {selectedQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{quote.supplier.name}</div>
                    <div className="text-sm text-gray-600">{quote.supplier.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {quote.total_amount.toLocaleString()} AED
                    </div>
                    <div className="text-sm text-gray-600">
                      Valid until: {new Date(quote.valid_until).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Savings Potential
                </label>
                <input
                  type="text"
                  value={`${comparisonData.totalSavings.toLocaleString()} AED`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommended Suppliers
                </label>
                <input
                  type="text"
                  value={comparisonData.recommendedSuppliers.join(', ')}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Key Differences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Differences
            </label>
            <div className="space-y-2">
              {comparisonData.keyDifferences.map((difference, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-900">{difference}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Assessment
            </label>
            <textarea
              value={comparisonData.riskAssessment}
              onChange={(e) => setComparisonData(prev => ({ ...prev, riskAssessment: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter risk assessment details..."
            />
          </div>

          {/* Quote Pack Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Pack Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">This quote pack will be sent to:</div>
              <div className="text-sm font-medium text-gray-900">
                {rfq.material_request.requester_name} ({rfq.material_request.requester_id})
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Project: {rfq.material_request.project_name}
              </div>
              <div className="text-sm text-gray-600">
                Material Request: {rfq.material_request.mrn}
              </div>
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create & Send Quote Pack'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
