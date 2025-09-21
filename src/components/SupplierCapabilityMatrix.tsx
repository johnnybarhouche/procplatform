'use client';

import React, { useState } from 'react';
import { SupplierCapability } from '@/types/procurement';

interface SupplierCapabilityMatrixProps {
  itemId: string;
  capabilities: SupplierCapability[];
  onCapabilityUpdated: (capability: SupplierCapability) => void;
}

export default function SupplierCapabilityMatrix({ 
  itemId, 
  capabilities, 
  onCapabilityUpdated 
}: SupplierCapabilityMatrixProps) {
  const [editingCapability, setEditingCapability] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    is_primary_supplier: false,
    capability_rating: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = (capability: SupplierCapability) => {
    setEditingCapability(capability.id);
    setEditForm({
      is_primary_supplier: capability.is_primary_supplier,
      capability_rating: capability.capability_rating,
      notes: capability.notes || ''
    });
  };

  const handleSave = async (capabilityId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/items/${itemId}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier_id: capabilities.find(c => c.id === capabilityId)?.supplier_id,
          supplier_name: capabilities.find(c => c.id === capabilityId)?.supplier_name,
          item_code: capabilities.find(c => c.id === capabilityId)?.item_code,
          is_primary_supplier: editForm.is_primary_supplier,
          capability_rating: editForm.capability_rating,
          notes: editForm.notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update capability');
      }

      const updatedCapability = await response.json();
      onCapabilityUpdated(updatedCapability);
      setEditingCapability(null);
    } catch (error) {
      console.error('Error updating capability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingCapability(null);
    setEditForm({
      is_primary_supplier: false,
      capability_rating: 0,
      notes: ''
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('☆');
      } else {
        stars.push('☆');
      }
    }
    
    return stars.join('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Supplier Capabilities</h3>
        <button
          onClick={() => {/* Add new supplier capability */}}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Supplier
        </button>
      </div>

      {capabilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability) => (
            <div key={capability.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{capability.supplier_name}</h4>
                  <p className="text-sm text-gray-500">Item: {capability.item_code}</p>
                </div>
                {capability.is_primary_supplier && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                )}
              </div>

              {editingCapability === capability.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capability Rating
                    </label>
                    <select
                      value={editForm.capability_rating}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        capability_rating: parseFloat(e.target.value) 
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value={0}>Select Rating</option>
                      <option value={1}>1 - Poor</option>
                      <option value={2}>2 - Fair</option>
                      <option value={3}>3 - Good</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Add notes about this supplier's capability..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`primary-${capability.id}`}
                      checked={editForm.is_primary_supplier}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        is_primary_supplier: e.target.checked 
                      }))}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor={`primary-${capability.id}`} className="ml-2 block text-sm text-gray-900">
                      Primary Supplier
                    </label>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(capability.id)}
                      disabled={loading}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Rating</span>
                      <span className={`text-sm font-medium ${getRatingColor(capability.capability_rating)}`}>
                        {capability.capability_rating}/5
                      </span>
                    </div>
                    <div className={`text-lg ${getRatingColor(capability.capability_rating)}`}>
                      {getRatingStars(capability.capability_rating)}
                    </div>
                  </div>

                  {capability.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Notes</span>
                      <p className="text-sm text-gray-900 mt-1">{capability.notes}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(capability)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {/* Remove capability */}}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No supplier capabilities available</p>
          <button
            onClick={() => {/* Add first supplier */}}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add First Supplier
          </button>
        </div>
      )}
    </div>
  );
}
