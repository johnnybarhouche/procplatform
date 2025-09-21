'use client';

import React, { useState, useEffect } from 'react';
import { Item } from '@/types/procurement';

interface ItemFormProps {
  item?: Item;
  onSave: (item: Item) => void;
  onCancel: () => void;
}

export default function ItemForm({ item, onSave, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState({
    item_code: '',
    description: '',
    category: '',
    uom: '',
    brand: '',
    model: '',
    specifications: {} as Record<string, string | number | boolean>
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [specifications, setSpecifications] = useState<Array<{key: string, value: string}>>([]);

  const categories = [
    'Construction Materials',
    'Electrical Equipment',
    'Mechanical Equipment',
    'Safety Equipment',
    'Tools & Equipment',
    'Office Supplies',
    'IT Equipment',
    'Other'
  ];

  const uomOptions = [
    'Each',
    'Meter',
    'Kilogram',
    'Ton',
    'Cubic Meter',
    'Liter',
    'Square Meter',
    'Box',
    'Set',
    'Pair',
    'Dozen',
    'Other'
  ];

  useEffect(() => {
    if (item) {
      setFormData({
        item_code: item.item_code,
        description: item.description,
        category: item.category,
        uom: item.uom,
        brand: item.brand || '',
        model: item.model || '',
        specifications: item.specifications || {}
      });
      
      // Convert specifications object to array for editing
      const specArray = Object.entries(item.specifications || {}).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setSpecifications(specArray);
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.item_code.trim()) {
      newErrors.item_code = 'Item code is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.uom.trim()) {
      newErrors.uom = 'Unit of measure is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Convert specifications array back to object
      const specificationsObj = specifications.reduce((acc, spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          acc[spec.key.trim()] = spec.value.trim();
        }
        return acc;
      }, {} as Record<string, string | number | boolean>);

      const itemData = {
        ...formData,
        specifications: specificationsObj
      };

      const url = item ? `/api/items/${item.id}` : '/api/items';
      const method = item ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...itemData,
          created_by: 'system',
          created_by_name: 'System'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save item');
      }

      const savedItem = await response.json();
      onSave(savedItem);
    } catch (error) {
      console.error('Error saving item:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save item' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    setSpecifications(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Code *
              </label>
              <input
                type="text"
                name="item_code"
                value={formData.item_code}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.item_code ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter item code (e.g., ITM-001)"
              />
              {errors.item_code && <p className="text-red-500 text-sm mt-1">{errors.item_code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter item description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure *
              </label>
              <select
                name="uom"
                value={formData.uom}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.uom ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select UOM</option>
                {uomOptions.map(uom => (
                  <option key={uom} value={uom}>{uom}</option>
                ))}
              </select>
              {errors.uom && <p className="text-red-500 text-sm mt-1">{errors.uom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter model number"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
            <button
              type="button"
              onClick={addSpecification}
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
            >
              Add Specification
            </button>
          </div>

          {specifications.length > 0 ? (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Specification name (e.g., Diameter)"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Specification value (e.g., 12mm)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
                      <p className="text-gray-500 text-sm">No specifications added yet. Click &quot;Add Specification&quot; to add some.</p>
          )}
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.submit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
          </button>
        </div>
      </form>
    </div>
  );
}
