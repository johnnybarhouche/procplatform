'use client';

import React, { useState, useEffect } from 'react';
import { Supplier, SupplierFormProps, SupplierContact } from '@/types/procurement';

export default function SupplierForm({ supplier, onSave, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    supplier_code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    contacts: [] as SupplierContact[]
  });
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    is_primary: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_code: supplier.supplier_code,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone || '',
        address: supplier.address || '',
        category: supplier.category,
        contacts: supplier.contacts || []
      });
    }
  }, [supplier]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_code.trim()) {
      newErrors.supplier_code = 'Supplier code is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
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
      const supplierData: Partial<Supplier> = {
        ...formData,
        id: supplier?.id || '',
        rating: supplier?.rating || 0,
        quote_count: supplier?.quote_count || 0,
        avg_response_time: supplier?.avg_response_time || 0,
        last_quote_date: supplier?.last_quote_date || new Date().toISOString().split('T')[0],
        is_active: supplier?.is_active ?? true,
        status: supplier?.status || 'pending',
        compliance_docs: supplier?.compliance_docs || [],
        performance_metrics: supplier?.performance_metrics || {
          id: '',
          supplier_id: '',
          total_quotes: 0,
          successful_quotes: 0,
          avg_response_time_hours: 0,
          on_time_delivery_rate: 0,
          quality_rating: 0,
          communication_rating: 0,
          last_updated: new Date().toISOString()
        },
        created_at: supplier?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: supplier?.created_by || '',
        created_by_name: supplier?.created_by_name || ''
      };

      onSave(supplierData as Supplier);
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    if (!newContact.name.trim() || !newContact.email.trim() || !newContact.position.trim()) {
      return;
    }

    const contact: SupplierContact = {
      id: Date.now().toString(),
      supplier_id: supplier?.id || '',
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      position: newContact.position,
      is_primary: newContact.is_primary,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, contact]
    }));

    setNewContact({
      name: '',
      email: '',
      phone: '',
      position: '',
      is_primary: false
    });
  };

  const removeContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== contactId)
    }));
  };

  const setPrimaryContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact => ({
        ...contact,
        is_primary: contact.id === contactId
      }))
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-brand-surface shadow rounded-lg">
      <div className="px-6 py-4 border-b border-brand-text/10">
        <h2 className="text-lg font-medium text-brand-text">
          {supplier ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Usage Restriction Warning */}
        {supplier && supplier.has_been_used && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Modification Restricted
                </h3>
                <div className="mt-2 text-sm text-status-warning">
                  <p>This supplier has been used in procurement transactions and cannot be modified or deleted.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-brand-text mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">
                Supplier Code *
              </label>
              <input
                type="text"
                value={formData.supplier_code}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_code: e.target.value }))}
                disabled={supplier?.has_been_used}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.supplier_code ? 'border-red-300' : 'border-brand-text/20'
                } ${supplier?.has_been_used ? 'bg-brand-surface cursor-not-allowed' : ''}`}
                placeholder="Enter supplier code (e.g., SUP-001)"
              />
              {errors.supplier_code && <p className="text-red-500 text-sm mt-1">{errors.supplier_code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.name ? 'border-red-300' : 'border-brand-text/20'
                }`}
                placeholder="Enter supplier name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.email ? 'border-red-300' : 'border-brand-text/20'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-brand-text/20 rounded-md px-3 py-2"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.category ? 'border-red-300' : 'border-brand-text/20'
                }`}
              >
                <option value="">Select category</option>
                <option value="Construction Materials">Construction Materials</option>
                <option value="Electrical Equipment">Electrical Equipment</option>
                <option value="Industrial Equipment">Industrial Equipment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="IT Equipment">IT Equipment</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full border border-brand-text/20 rounded-md px-3 py-2"
              rows={3}
              placeholder="Enter supplier address"
            />
          </div>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="text-lg font-medium text-brand-text mb-4">Contacts</h3>
          
          {/* Add New Contact */}
          <div className="bg-brand-surface p-4 rounded-lg mb-4">
            <h4 className="font-medium text-brand-text mb-3">Add New Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-text/80 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-brand-text/20 rounded-md px-3 py-2"
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-brand-text/20 rounded-md px-3 py-2"
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-brand-text/20 rounded-md px-3 py-2"
                  placeholder="Enter contact phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text/80 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  value={newContact.position}
                  onChange={(e) => setNewContact(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full border border-brand-text/20 rounded-md px-3 py-2"
                  placeholder="Enter position"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="is_primary"
                checked={newContact.is_primary}
                onChange={(e) => setNewContact(prev => ({ ...prev, is_primary: e.target.checked }))}
                className="h-4 w-4 text-brand-primary border-brand-text/20 rounded"
              />
              <label htmlFor="is_primary" className="ml-2 text-sm text-brand-text/80">
                Primary contact
              </label>
            </div>
            <button
              type="button"
              onClick={addContact}
              className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
            >
              Add Contact
            </button>
          </div>

          {/* Existing Contacts */}
          <div className="space-y-3">
            {formData.contacts.map((contact) => (
              <div key={contact.id} className="border border-brand-text/10 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-brand-text">{contact.name}</h4>
                    <p className="text-sm text-brand-text/60">{contact.position}</p>
                    <p className="text-sm text-brand-text/80">{contact.email}</p>
                    {contact.phone && <p className="text-sm text-brand-text/80">{contact.phone}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    {contact.is_primary && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-brand-primary/10 text-blue-800">
                        Primary
                      </span>
                    )}
                    {!contact.is_primary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryContact(contact.id)}
                        className="text-brand-primary hover:text-blue-900 text-sm"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeContact(contact.id)}
                      className="text-status-danger hover:text-red-900 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {formData.contacts.length === 0 && (
              <div className="text-center py-8 text-brand-text/60">
                No contacts added yet.
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-brand-text/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-brand-text/20 rounded-md text-brand-text/80 hover:bg-brand-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (supplier?.has_been_used)}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (supplier ? 'Update Supplier' : 'Create Supplier')}
          </button>
        </div>
      </form>
    </div>
  );
}
