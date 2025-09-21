'use client';

import React, { useState, useEffect } from 'react';
import { MRFieldConfig } from '@/types/admin';

interface MRFieldConfigurationProps {
  fields: MRFieldConfig[];
  onUpdate: (fields: MRFieldConfig[]) => void;
}

const MRFieldConfiguration: React.FC<MRFieldConfigurationProps> = ({ fields, onUpdate }) => {
  const [localFields, setLocalFields] = useState<MRFieldConfig[]>(fields);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const handleFieldUpdate = (fieldId: string, updates: Partial<MRFieldConfig>) => {
    setLocalFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, ...updates }
          : field
      )
    );
  };

  const handleOrderChange = (fieldId: string, newOrder: number) => {
    setLocalFields(prev => {
      const updated = [...prev];
      const fieldIndex = updated.findIndex(f => f.id === fieldId);
      
      if (fieldIndex === -1) return prev;
      
      const field = updated[fieldIndex];
      const oldOrder = field.display_order;
      
      // Update the moved field
      field.display_order = newOrder;
      
      // Adjust other fields' order
      updated.forEach((f, index) => {
        if (index !== fieldIndex) {
          if (newOrder > oldOrder && f.display_order > oldOrder && f.display_order <= newOrder) {
            f.display_order -= 1;
          } else if (newOrder < oldOrder && f.display_order >= newOrder && f.display_order < oldOrder) {
            f.display_order += 1;
          }
        }
      });
      
      return updated.sort((a, b) => a.display_order - b.display_order);
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/mr-fields', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ fields: localFields })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update MR field configuration');
      }

      const result = await response.json();
      onUpdate(result.fields);
      setMessage({ type: 'success', text: 'MR field configuration updated successfully' });
    } catch (error) {
      console.error('Error updating MR field configuration:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update configuration' });
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return '📝';
      case 'textarea': return '📄';
      case 'select': return '📋';
      case 'date': return '📅';
      case 'file': return '📎';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-text">MR Field Configuration</h3>
          <p className="text-sm text-brand-text/70">Configure which fields are visible, required, and their display order</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-brand-surface rounded-lg shadow">
        <div className="px-6 py-4 border-b border-brand-text/10">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-brand-text/60">
            <div className="col-span-1">Order</div>
            <div className="col-span-3">Field</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Visible</div>
            <div className="col-span-2">Required</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {localFields
            .sort((a, b) => a.display_order - b.display_order)
            .map((field, index) => (
            <div key={field.id} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <select
                    value={field.display_order}
                    onChange={(e) => handleOrderChange(field.id, parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-brand-text/20 rounded text-sm"
                  >
                    {localFields.map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFieldTypeIcon(field.field_type)}</span>
                    <div>
                      <div className="font-medium text-brand-text">{field.field_label}</div>
                      <div className="text-sm text-brand-text/60">{field.field_name}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-blue-800">
                    {field.field_type}
                  </span>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.is_visible}
                      onChange={(e) => handleFieldUpdate(field.id, { is_visible: e.target.checked })}
                      className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-text/20 rounded"
                    />
                    <span className="ml-2 text-sm text-brand-text/80">Visible</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={field.is_required}
                      onChange={(e) => handleFieldUpdate(field.id, { is_required: e.target.checked })}
                      className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-text/20 rounded"
                    />
                    <span className="ml-2 text-sm text-brand-text/80">Required</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const newOrder = Math.max(1, field.display_order - 1);
                        handleOrderChange(field.id, newOrder);
                      }}
                      disabled={field.display_order === 1}
                      className="p-1 text-brand-text/50 hover:text-brand-text/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => {
                        const newOrder = Math.min(localFields.length, field.display_order + 1);
                        handleOrderChange(field.id, newOrder);
                      }}
                      disabled={field.display_order === localFields.length}
                      className="p-1 text-brand-text/50 hover:text-brand-text/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-surface rounded-lg p-4">
        <h4 className="text-sm font-medium text-brand-text mb-2">Configuration Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-brand-text/70">Total Fields:</span>
            <span className="ml-2 font-medium">{localFields.length}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Visible Fields:</span>
            <span className="ml-2 font-medium">{localFields.filter(f => f.is_visible).length}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Required Fields:</span>
            <span className="ml-2 font-medium">{localFields.filter(f => f.is_required).length}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Field Types:</span>
            <span className="ml-2 font-medium">{new Set(localFields.map(f => f.field_type)).size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRFieldConfiguration;

