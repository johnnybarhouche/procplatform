'use client';

import React, { useState } from 'react';
import { Supplier, SupplierApprovalFormProps } from '@/types/procurement';

export default function SupplierApprovalForm({ supplier, onApprovalSubmitted, onCancel }: SupplierApprovalFormProps) {
  const [approvalData, setApprovalData] = useState({
    approved_by: '',
    approval_notes: '',
    compliance_verified: false,
    financial_stability_verified: false,
    quality_certifications_verified: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!approvalData.approved_by.trim()) {
      newErrors.approved_by = 'Approver name is required';
    }
    if (!approvalData.compliance_verified) {
      newErrors.compliance_verified = 'Compliance verification is required';
    }
    if (!approvalData.financial_stability_verified) {
      newErrors.financial_stability_verified = 'Financial stability verification is required';
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
      // In a real application, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      onApprovalSubmitted(supplier.id);
    } catch (error) {
      console.error('Error submitting approval:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-status-warning/10 text-yellow-800',
      approved: 'bg-status-success/10 text-green-800',
      suspended: 'bg-status-danger/10 text-red-800',
      inactive: 'bg-brand-surface text-brand-text/90'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-brand-surface text-brand-text/90';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-brand-surface shadow rounded-lg">
      <div className="px-6 py-4 border-b border-brand-text/10">
        <h2 className="text-lg font-medium text-brand-text">Approve Supplier</h2>
        <p className="text-sm text-brand-text/60">Review and approve supplier for active use</p>
      </div>

      <div className="p-6">
        {/* Supplier Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-brand-text mb-4">Supplier Information</h3>
          <div className="bg-brand-surface p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-brand-text">{supplier.name}</h4>
                <p className="text-sm text-brand-text/60">{supplier.email}</p>
                <p className="text-sm text-brand-text/60">{supplier.phone}</p>
              </div>
              <div>
                <p className="text-sm text-brand-text/60">Category: {supplier.category}</p>
                <p className="text-sm text-brand-text/60">Created: {formatDate(supplier.created_at)}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(supplier.status)}`}>
                  {supplier.status}
                </span>
              </div>
            </div>
            {supplier.address && (
              <div className="mt-3">
                <p className="text-sm text-brand-text/80">Address: {supplier.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Documents */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-brand-text mb-4">Compliance Documents</h3>
          {supplier.compliance_docs.length > 0 ? (
            <div className="space-y-3">
              {supplier.compliance_docs.map((doc) => (
                <div key={doc.id} className="border border-brand-text/10 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-brand-text">{doc.name}</h4>
                      <p className="text-sm text-brand-text/60">
                        Expires: {formatDate(doc.expiry_date)}
                      </p>
                      <p className="text-sm text-brand-text/80">
                        Status: <span className={doc.is_valid ? 'text-status-success' : 'text-status-danger'}>
                          {doc.is_valid ? 'Valid' : 'Expired'}
                        </span>
                      </p>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary hover:text-blue-900 text-sm"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-brand-text/60 bg-brand-surface rounded-lg">
              No compliance documents uploaded yet.
            </div>
          )}
        </div>

        {/* Approval Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-brand-text mb-4">Approval Checklist</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="compliance_verified"
                  checked={approvalData.compliance_verified}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, compliance_verified: e.target.checked }))}
                  className={`h-4 w-4 mt-1 text-brand-primary border-brand-text/20 rounded ${
                    errors.compliance_verified ? 'border-red-300' : ''
                  }`}
                />
                <div className="ml-3">
                  <label htmlFor="compliance_verified" className="text-sm font-medium text-brand-text/80">
                    Compliance documents verified and valid
                  </label>
                  <p className="text-xs text-brand-text/60">
                    All required compliance documents are present and not expired
                  </p>
                  {errors.compliance_verified && (
                    <p className="text-red-500 text-xs mt-1">{errors.compliance_verified}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="financial_stability_verified"
                  checked={approvalData.financial_stability_verified}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, financial_stability_verified: e.target.checked }))}
                  className={`h-4 w-4 mt-1 text-brand-primary border-brand-text/20 rounded ${
                    errors.financial_stability_verified ? 'border-red-300' : ''
                  }`}
                />
                <div className="ml-3">
                  <label htmlFor="financial_stability_verified" className="text-sm font-medium text-brand-text/80">
                    Financial stability verified
                  </label>
                  <p className="text-xs text-brand-text/60">
                    Financial background check completed and satisfactory
                  </p>
                  {errors.financial_stability_verified && (
                    <p className="text-red-500 text-xs mt-1">{errors.financial_stability_verified}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="quality_certifications_verified"
                  checked={approvalData.quality_certifications_verified}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, quality_certifications_verified: e.target.checked }))}
                  className="h-4 w-4 mt-1 text-brand-primary border-brand-text/20 rounded"
                />
                <div className="ml-3">
                  <label htmlFor="quality_certifications_verified" className="text-sm font-medium text-brand-text/80">
                    Quality certifications verified (optional)
                  </label>
                  <p className="text-xs text-brand-text/60">
                    Quality management certifications reviewed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Approver Name *
            </label>
            <input
              type="text"
              value={approvalData.approved_by}
              onChange={(e) => setApprovalData(prev => ({ ...prev, approved_by: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.approved_by ? 'border-red-300' : 'border-brand-text/20'
              }`}
              placeholder="Enter your name"
            />
            {errors.approved_by && <p className="text-red-500 text-sm mt-1">{errors.approved_by}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">
              Approval Notes
            </label>
            <textarea
              value={approvalData.approval_notes}
              onChange={(e) => setApprovalData(prev => ({ ...prev, approval_notes: e.target.value }))}
              className="w-full border border-brand-text/20 rounded-md px-3 py-2"
              rows={4}
              placeholder="Add any additional notes about the approval decision..."
            />
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
              disabled={loading}
              className="px-4 py-2 bg-status-success text-white rounded-md hover:bg-status-success/90 disabled:opacity-50"
            >
              {loading ? 'Approving...' : 'Approve Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

