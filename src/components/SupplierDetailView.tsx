'use client';

import React, { useState, useEffect } from 'react';
import { Supplier, SupplierDetailViewProps } from '@/types/procurement';

export default function SupplierDetailView({ supplierId, userRole }: SupplierDetailViewProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'compliance' | 'performance'>('overview');

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/suppliers/${supplierId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch supplier details');
        }
        const data = await response.json();
        setSupplier(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-status-warning/10 text-yellow-800',
      approved: 'bg-status-success/10 text-green-800',
      suspended: 'bg-status-danger/10 text-red-800',
      inactive: 'bg-brand-surface text-brand-text/90'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-brand-surface text-brand-text/90';
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading supplier details...</div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error || 'Supplier not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-surface shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">{supplier.name}</h1>
            <div className="mt-1 text-sm text-brand-text/70">Supplier Code: {supplier.supplier_code}</div>
            <div className="mt-2 flex items-center space-x-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(supplier.status)}`}>
                {supplier.status}
              </span>
              <span className="text-sm text-brand-text/60">{supplier.category}</span>
              <div className="flex items-center">
                <span className="text-yellow-400">{getRatingStars(supplier.rating)}</span>
                <span className="ml-2 text-sm text-brand-text">{supplier.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {(userRole === 'procurement' || userRole === 'admin') && (
              <button className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90">
                Edit Supplier
              </button>
            )}
            {supplier.status === 'pending' && (userRole === 'procurement' || userRole === 'admin') && (
              <button className="px-4 py-2 bg-status-success text-white rounded-md hover:bg-status-success/90">
                Approve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-brand-surface shadow rounded-lg">
        <div className="border-b border-brand-text/10">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'contacts', label: 'Contacts' },
              { id: 'compliance', label: 'Compliance' },
              { id: 'performance', label: 'Performance' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'contacts' | 'compliance' | 'performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-brand-primary'
                    : 'border-transparent text-brand-text/60 hover:text-brand-text/80 hover:border-brand-text/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-brand-text mb-4">Basic Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-brand-text/60">Email</dt>
                      <dd className="text-sm text-brand-text">{supplier.email}</dd>
                    </div>
                    {supplier.phone && (
                      <div>
                        <dt className="text-sm font-medium text-brand-text/60">Phone</dt>
                        <dd className="text-sm text-brand-text">{supplier.phone}</dd>
                      </div>
                    )}
                    {supplier.address && (
                      <div>
                        <dt className="text-sm font-medium text-brand-text/60">Address</dt>
                        <dd className="text-sm text-brand-text">{supplier.address}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-brand-text/60">Created</dt>
                      <dd className="text-sm text-brand-text">{formatDate(supplier.created_at)}</dd>
                    </div>
                    {supplier.approval_date && (
                      <div>
                        <dt className="text-sm font-medium text-brand-text/60">Approved</dt>
                        <dd className="text-sm text-brand-text">{formatDate(supplier.approval_date)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-brand-text mb-4">Performance Summary</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-brand-text/60">Total Quotes</dt>
                      <dd className="text-sm text-brand-text">{supplier.quote_count}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-brand-text/60">Average Response Time</dt>
                      <dd className="text-sm text-brand-text">{supplier.avg_response_time} hours</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-brand-text/60">Last Quote Date</dt>
                      <dd className="text-sm text-brand-text">{formatDate(supplier.last_quote_date)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-brand-text/60">Rating</dt>
                      <dd className="text-sm text-brand-text">
                        <span className="text-yellow-400">{getRatingStars(supplier.rating)}</span>
                        <span className="ml-2">{supplier.rating.toFixed(1)}/5.0</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              {supplier.approval_notes && (
                <div>
                  <h3 className="text-lg font-medium text-brand-text mb-4">Approval Notes</h3>
                  <p className="text-sm text-brand-text/80 bg-brand-surface p-4 rounded-md">{supplier.approval_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-brand-text">Contacts</h3>
                {(userRole === 'procurement' || userRole === 'admin') && (
                  <button className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90">
                    Add Contact
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {supplier.contacts.map((contact) => (
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
                        {(userRole === 'procurement' || userRole === 'admin') && (
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {supplier.contacts.length === 0 && (
                  <div className="text-center py-8 text-brand-text/60">
                    No contacts found for this supplier.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-brand-text">Compliance Documents</h3>
                {(userRole === 'procurement' || userRole === 'admin') && (
                  <button className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90">
                    Upload Document
                  </button>
                )}
              </div>
              <div className="space-y-4">
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
                      <div className="flex items-center space-x-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary hover:text-blue-900 text-sm"
                        >
                          View
                        </a>
                        {(userRole === 'procurement' || userRole === 'admin') && (
                          <button className="text-status-danger hover:text-red-900 text-sm">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {supplier.compliance_docs.length === 0 && (
                  <div className="text-center py-8 text-brand-text/60">
                    No compliance documents found for this supplier.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div>
              <h3 className="text-lg font-medium text-brand-text mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-brand-surface p-4 rounded-lg">
                  <h4 className="font-medium text-brand-text">Quote Performance</h4>
                  <p className="text-2xl font-bold text-brand-primary">{supplier.performance_metrics.total_quotes}</p>
                  <p className="text-sm text-brand-text/60">Total Quotes</p>
                </div>
                <div className="bg-brand-surface p-4 rounded-lg">
                  <h4 className="font-medium text-brand-text">Success Rate</h4>
                  <p className="text-2xl font-bold text-status-success">
                    {supplier.performance_metrics.total_quotes > 0 
                      ? ((supplier.performance_metrics.successful_quotes / supplier.performance_metrics.total_quotes) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-sm text-brand-text/60">Successful Quotes</p>
                </div>
                <div className="bg-brand-surface p-4 rounded-lg">
                  <h4 className="font-medium text-brand-text">Response Time</h4>
                  <p className="text-2xl font-bold text-purple-600">{supplier.performance_metrics.avg_response_time_hours}h</p>
                  <p className="text-sm text-brand-text/60">Average Response</p>
                </div>
                <div className="bg-brand-surface p-4 rounded-lg">
                  <h4 className="font-medium text-brand-text">Delivery Rate</h4>
                  <p className="text-2xl font-bold text-orange-600">{supplier.performance_metrics.on_time_delivery_rate}%</p>
                  <p className="text-sm text-brand-text/60">On-Time Delivery</p>
                </div>
                <div className="bg-brand-surface p-4 rounded-lg">
                  <h4 className="font-medium text-brand-text">Quality Rating</h4>
                  <p className="text-2xl font-bold text-status-warning">{supplier.performance_metrics.quality_rating.toFixed(1)}</p>
                  <p className="text-sm text-brand-text/60">Quality Score</p>
                </div>
                <div className="bg-brand-surface p-4 rounded-lg">
                  <h4 className="font-medium text-brand-text">Communication</h4>
                  <p className="text-2xl font-bold text-indigo-600">{supplier.performance_metrics.communication_rating.toFixed(1)}</p>
                  <p className="text-sm text-brand-text/60">Communication Score</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
