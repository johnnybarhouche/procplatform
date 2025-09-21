'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { IntegrationConfig } from '@/types/admin';

interface IntegrationManagementProps {
  userRole: string;
}

const IntegrationManagement: React.FC<IntegrationManagementProps> = ({ userRole }) => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<IntegrationConfig | null>(null);
  const [formData, setFormData] = useState({
    integration_type: 'sso' as 'sso' | 'esignature',
    configuration: {} as Record<string, string | number | boolean>
  });

  const fetchIntegrations = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/integrations');
      const data = await response.json();
      if (data.success) {
        setIntegrations(data.data);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingIntegration ? `/api/admin/integrations` : '/api/admin/integrations';
      const method = editingIntegration ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...(editingIntegration && { id: editingIntegration.id })
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchIntegrations();
        resetForm();
      } else {
        alert(data.error || 'Failed to save integration');
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Failed to save integration');
    }
  };

  const handleEdit = (integration: IntegrationConfig) => {
    setEditingIntegration(integration);
    setFormData({
      integration_type: integration.integration_type,
      configuration: integration.configuration
    });
    setShowForm(true);
  };

  const handleToggle = async (integration: IntegrationConfig) => {
    try {
      const response = await fetch('/api/admin/integrations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: integration.id,
          is_enabled: !integration.is_enabled,
          configuration: integration.configuration
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchIntegrations();
      } else {
        alert(data.error || 'Failed to update integration');
      }
    } catch (error) {
      console.error('Error updating integration:', error);
      alert('Failed to update integration');
    }
  };

  const resetForm = () => {
    setFormData({
      integration_type: 'sso',
      configuration: {}
    });
    setEditingIntegration(null);
    setShowForm(false);
  };

  const getIntegrationDisplayName = (type: string) => {
    switch (type) {
      case 'sso': return 'Single Sign-On (SSO)';
      case 'esignature': return 'E-Signature';
      default: return type;
    }
  };

  const getConfigurationFields = (type: string) => {
    switch (type) {
      case 'sso':
        return [
          { key: 'provider', label: 'Provider', type: 'text' },
          { key: 'client_id', label: 'Client ID', type: 'text' },
          { key: 'tenant_id', label: 'Tenant ID', type: 'text' },
          { key: 'redirect_uri', label: 'Redirect URI', type: 'text' }
        ];
      case 'esignature':
        return [
          { key: 'provider', label: 'Provider', type: 'text' },
          { key: 'api_key', label: 'API Key', type: 'password' },
          { key: 'environment', label: 'Environment', type: 'text' },
          { key: 'webhook_url', label: 'Webhook URL', type: 'text' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-text">Integration Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90"
        >
          Add New Integration
        </button>
      </div>

      {showForm && (
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text/80">Integration Type</label>
              <select
                value={formData.integration_type}
                onChange={(e) => setFormData({ ...formData, integration_type: e.target.value as 'sso' | 'esignature' })}
                className="mt-1 block w-full border border-brand-text/20 rounded-md px-3 py-2"
                required
              >
                <option value="sso">Single Sign-On (SSO)</option>
                <option value="esignature">E-Signature</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80">Configuration</label>
              <div className="mt-2 space-y-3">
                {getConfigurationFields(formData.integration_type).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-brand-text/80">{field.label}</label>
                    <input
                      type={field.type}
                      value={String(formData.configuration[field.key] || '')}
                      onChange={(e) => setFormData({
                        ...formData,
                        configuration: {
                          ...formData.configuration,
                          [field.key]: e.target.value
                        }
                      })}
                      className="mt-1 block w-full border border-brand-text/20 rounded-md px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90"
              >
                {editingIntegration ? 'Update Integration' : 'Create Integration'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-brand-primary/10 text-brand-text/80 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-brand-surface shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-brand-text">Integrations</h3>
          <p className="mt-1 max-w-2xl text-sm text-brand-text/60">
            Manage system integrations and external services
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {integrations.map((integration) => (
            <li key={integration.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-brand-primary">
                        {integration.integration_type.toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-brand-text">
                        {getIntegrationDisplayName(integration.integration_type)}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        integration.is_enabled 
                          ? 'bg-status-success/10 text-green-800' 
                          : 'bg-status-danger/10 text-red-800'
                      }`}>
                        {integration.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-brand-text/60">
                      Provider: {integration.configuration.provider || 'Not configured'}
                    </p>
                    {integration.last_tested && (
                      <p className="text-sm text-brand-text/60">
                        Last tested: {new Date(integration.last_tested).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(integration)}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      integration.is_enabled
                        ? 'bg-status-danger/10 text-red-800 hover:bg-red-200'
                        : 'bg-status-success/10 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {integration.is_enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleEdit(integration)}
                    className="px-3 py-1 text-xs font-medium text-brand-primary hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IntegrationManagement;
