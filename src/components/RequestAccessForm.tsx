'use client';

import React, { useState } from 'react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { cn } from '@/lib/cn';

interface RequestAccessFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessRequested: () => void;
}

export default function RequestAccessForm({ isOpen, onClose, onAccessRequested }: RequestAccessFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit access request');
      }

      const { message } = await response.json();
      setSuccess(message);
      onAccessRequested();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit access request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Access">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="rounded-lg border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-status-success/40 bg-status-success/10 px-4 py-3 text-sm text-status-success">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-brand-text/70 mb-2" htmlFor="reason">
            Reason for Access
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-brand-text/20 px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Please explain why you need access to the procurement system"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
