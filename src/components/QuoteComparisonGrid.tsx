'use client';

import React, { useState } from 'react';
import { Quote, RFQ } from '@/types/procurement';

interface QuoteComparisonGridProps {
  rfq: RFQ;
  quotes: Quote[];
  onQuotePackCreate: (selectedQuotes: string[]) => void;
  onClose: () => void;
}

export default function QuoteComparisonGrid({ rfq, quotes, onQuotePackCreate, onClose }: QuoteComparisonGridProps) {
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'total' | 'supplier' | 'lead_time'>('total');

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'total':
        return a.total_amount - b.total_amount;
      case 'supplier':
        return a.supplier.name.localeCompare(b.supplier.name);
      case 'lead_time':
        const aLeadTime = Math.min(...a.line_items.map(item => item.lead_time_days));
        const bLeadTime = Math.min(...b.line_items.map(item => item.lead_time_days));
        return aLeadTime - bLeadTime;
      default:
        return 0;
    }
  });

  const calculateSavings = (quote: Quote) => {
    const highestQuote = Math.max(...quotes.map(q => q.total_amount));
    return highestQuote - quote.total_amount;
  };

  const getBestQuote = () => {
    return quotes.reduce((best, current) => 
      current.total_amount < best.total_amount ? current : best
    );
  };

  const bestQuote = getBestQuote();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quote Comparison</h2>
              <p className="text-gray-600">RFQ: {rfq.rfq_number}</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'total' | 'supplier' | 'lead_time')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="total">Sort by Total</option>
                <option value="supplier">Sort by Supplier</option>
                <option value="lead_time">Sort by Lead Time</option>
              </select>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{quotes.length}</div>
              <div className="text-sm text-blue-800">Total Quotes</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.min(...quotes.map(q => q.total_amount)).toLocaleString()} AED
              </div>
              <div className="text-sm text-green-800">Lowest Quote</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.max(...quotes.map(q => q.total_amount)).toLocaleString()} AED
              </div>
              <div className="text-sm text-yellow-800">Highest Quote</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {((Math.max(...quotes.map(q => q.total_amount)) - Math.min(...quotes.map(q => q.total_amount))) / Math.max(...quotes.map(q => q.total_amount)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-800">Price Variance</div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Savings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedQuotes.map((quote) => {
                  const isBest = quote.id === bestQuote.id;
                  const savings = calculateSavings(quote);
                  const minLeadTime = Math.min(...quote.line_items.map(item => item.lead_time_days));
                  
                  return (
                    <tr key={quote.id} className={isBest ? 'bg-green-50' : ''}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedQuotes.includes(quote.id)}
                          onChange={() => toggleQuoteSelection(quote.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {quote.supplier.name}
                              {isBest && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Best Price
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{quote.supplier.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {quote.total_amount.toLocaleString()} AED
                        </div>
                        <div className="text-sm text-gray-500">
                          {quote.currency}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${savings > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {savings > 0 ? `+${savings.toLocaleString()} AED` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {minLeadTime} days
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(quote.valid_until).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          quote.status === 'submitted' 
                            ? 'bg-blue-100 text-blue-800'
                            : quote.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {quote.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Line Item Comparison */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Item Comparison</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    {quotes.map((quote) => (
                      <th key={quote.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {quote.supplier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rfq.material_request.line_items.map((mrItem) => (
                    <tr key={mrItem.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{mrItem.item_code}</div>
                        <div className="text-sm text-gray-500">{mrItem.description}</div>
                        <div className="text-sm text-gray-500">Qty: {mrItem.quantity} {mrItem.uom}</div>
                      </td>
                      {quotes.map((quote) => {
                        const quoteItem = quote.line_items.find(item => item.mr_line_item_id === mrItem.id);
                        return (
                          <td key={quote.id} className="px-4 py-4 whitespace-nowrap">
                            {quoteItem ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {quoteItem.unit_price.toLocaleString()} AED
                                </div>
                                <div className="text-sm text-gray-500">
                                  Total: {quoteItem.total_price.toLocaleString()} AED
                                </div>
                                <div className="text-sm text-gray-500">
                                  Lead: {quoteItem.lead_time_days} days
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">Not quoted</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => onQuotePackCreate(selectedQuotes)}
              disabled={selectedQuotes.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Quote Pack ({selectedQuotes.length} selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
