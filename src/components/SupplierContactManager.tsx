'use client';

import React, { useState, useEffect } from 'react';
import { SupplierContact, SupplierContactManagerProps } from '@/types/procurement';

export default function SupplierContactManager({ 
  supplierId, 
  contacts, 
  onContactsUpdated 
}: SupplierContactManagerProps) {
  const [localContacts, setLocalContacts] = useState<SupplierContact[]>(contacts);
  const [isEditing, setIsEditing] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    is_primary: false
  });

  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      alert('Name and email are required');
      return;
    }

    const contact: SupplierContact = {
      id: `temp-${Date.now()}`,
      supplier_id: supplierId,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      position: newContact.position,
      is_primary: newContact.is_primary,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedContacts = [...localContacts, contact];
    setLocalContacts(updatedContacts);
    onContactsUpdated(updatedContacts);
    
    // Reset form
    setNewContact({
      name: '',
      email: '',
      phone: '',
      position: '',
      is_primary: false
    });
  };

  const handleRemoveContact = (contactId: string) => {
    const updatedContacts = localContacts.filter(c => c.id !== contactId);
    setLocalContacts(updatedContacts);
    onContactsUpdated(updatedContacts);
  };

  const handleSetPrimary = (contactId: string) => {
    const updatedContacts = localContacts.map(contact => ({
      ...contact,
      is_primary: contact.id === contactId
    }));
    setLocalContacts(updatedContacts);
    onContactsUpdated(updatedContacts);
  };

  const handleSaveContacts = async () => {
    try {
      const response = await fetch(`/api/suppliers/${supplierId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: localContacts }),
      });

      if (!response.ok) {
        throw new Error('Failed to save contacts');
      }

      setIsEditing(false);
      alert('Contacts saved successfully');
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert('Failed to save contacts');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Supplier Contacts</h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Contacts
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveContacts}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact List */}
      <div className="space-y-4">
        {localContacts.map((contact) => (
          <div key={contact.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{contact.name}</h4>
                  {contact.is_primary && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Email:</strong> {contact.email}</p>
                  {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                  {contact.position && <p><strong>Position:</strong> {contact.position}</p>}
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-2 ml-4">
                  {!contact.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(contact.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Contact Form */}
      {isEditing && (
        <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Add New Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+971-4-123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={newContact.position}
                onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sales Manager"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="is_primary"
              checked={newContact.is_primary}
              onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_primary" className="ml-2 text-sm text-gray-700">
              Set as primary contact
            </label>
          </div>
          <button
            onClick={handleAddContact}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Contact
          </button>
        </div>
      )}
    </div>
  );
}
