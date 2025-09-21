'use client';

import React, { useState, useEffect } from 'react';
import { MaterialRequest, Supplier, RFQ } from '@/types/procurement';

interface RFQCreationFormProps {
  materialRequest: MaterialRequest;
  onRFQCreated: (rfq: RFQ) => void;
  onCancel: () => void;
}

export default function RFQCreationForm({ materialRequest, onRFQCreated, onCancel }: RFQCreationFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [groupedLineItems, setGroupedLineItems] = useState<{[key: string]: typeof materialRequest.line_items}>({});
  const [dueDate, setDueDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const groupLineItems = React.useCallback(() => {
    const grouped: {[key: string]: typeof materialRequest.line_items} = {};
    materialRequest.line_items.forEach(item => {
      const category = item.description.split(' ')[0]; // Simple grouping by first word
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    setGroupedLineItems(grouped);
  }, [materialRequest]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    groupLineItems();
  }, [groupLineItems]);

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          material_request_id: materialRequest.id,
          selected_suppliers: selectedSuppliers,
          due_date: dueDate,
          remarks: remarks,
          created_by: '1',
          created_by_name: 'Procurement Officer'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create RFQ');
      }

      const newRFQ = await response.json();
      onRFQCreated(newRFQ);
    } catch (error) {
      console.error('Error creating RFQ:', error);
      alert('Failed to create RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-brand-text/10">
          <h2 className="text-2xl font-bold text-brand-text">Create RFQ</h2>
          <p className="text-brand-text/70">Material Request: {materialRequest.mrn}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Line Items Grouping */}
          <div>
            <h3 className="text-lg font-semibold text-brand-text mb-4">Line Items to Include</h3>
            <div className="space-y-4">
              {Object.entries(groupedLineItems).map(([category, items]) => (
                <div key={category} className="border border-brand-text/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-brand-text">{category}</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="ml-2 text-sm text-brand-text/70">Include all</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-brand-text/80">
                          {item.item_code} - {item.description} ({item.quantity} {item.uom})
                        </span>
                        <span className="font-medium text-brand-text">
                          {item.quantity * item.unit_price} AED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Selection */}
          <div>
            <h3 className="text-lg font-semibold text-brand-text mb-4">Select Suppliers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSuppliers.includes(supplier.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-brand-text/10 hover:border-brand-text/20'
                  }`}
                  onClick={() => handleSupplierToggle(supplier.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-brand-text">{supplier.name}</h4>
                      <p className="text-sm text-brand-text/70">{supplier.category}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-brand-text/60">
                          Rating: {supplier.rating}/5.0
                        </span>
                        <span className="text-sm text-brand-text/60">
                          {supplier.quote_count} quotes
                        </span>
                        <span className="text-sm text-brand-text/60">
                          Avg: {supplier.avg_response_time}h
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(supplier.id)}
                      onChange={() => handleSupplierToggle(supplier.id)}
                      className="rounded border-brand-text/20 text-brand-primary focus:ring-brand-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RFQ Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-2">
                Remarks (Optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Additional notes for suppliers..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-brand-text/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-brand-text/80 bg-brand-surface border border-brand-text/20 rounded-md hover:bg-brand-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedSuppliers.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
