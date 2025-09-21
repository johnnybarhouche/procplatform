'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SystemSetting } from '@/types/admin';

interface SystemSettingsProps {
  userRole: string;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ userRole }) => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);
  const [formData, setFormData] = useState({
    setting_key: '',
    setting_value: '',
    setting_type: 'string' as 'string' | 'number' | 'boolean',
    description: ''
  });

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSetting ? `/api/admin/settings` : '/api/admin/settings';
      const method = editingSetting ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...(editingSetting && { id: editingSetting.id })
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchSettings();
        resetForm();
      } else {
        alert(data.error || 'Failed to save setting');
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('Failed to save setting');
    }
  };

  const handleEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setFormData({
      setting_key: setting.setting_key,
      setting_value: setting.setting_value,
      setting_type: setting.setting_type as 'string' | 'number' | 'boolean',
      description: setting.description || ''
    });
    setShowForm(true);
  };

  const handleQuickEdit = async (setting: SystemSetting, newValue: string) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: setting.id,
          setting_value: newValue
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchSettings();
      } else {
        alert(data.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Failed to update setting');
    }
  };

  const resetForm = () => {
    setFormData({
      setting_key: '',
      setting_value: '',
      setting_type: 'string',
      description: ''
    });
    setEditingSetting(null);
    setShowForm(false);
  };

  const getInputType = (settingType: string) => {
    switch (settingType) {
      case 'number': return 'number';
      case 'boolean': return 'checkbox';
      default: return 'text';
    }
  };

  const getInputValue = (setting: SystemSetting) => {
    if (setting.setting_type === 'boolean') {
      return setting.setting_value === 'true';
    }
    return setting.setting_value;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Setting
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingSetting ? 'Edit Setting' : 'Add New Setting'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Setting Key</label>
                <input
                  type="text"
                  value={formData.setting_key}
                  onChange={(e) => setFormData({ ...formData, setting_key: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={!!editingSetting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Setting Type</label>
                <select
                  value={formData.setting_type}
                  onChange={(e) => setFormData({ ...formData, setting_type: e.target.value as 'string' | 'number' | 'boolean' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Setting Value</label>
              {formData.setting_type === 'boolean' ? (
                <select
                  value={formData.setting_value}
                  onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <input
                  type={getInputType(formData.setting_type)}
                  value={formData.setting_value}
                  onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingSetting ? 'Update Setting' : 'Create Setting'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage system configuration settings
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {settings.map((setting) => (
            <li key={setting.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">{setting.setting_key}</p>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {setting.setting_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Value:</span>
                      {setting.setting_type === 'boolean' ? (
                        <span className={`text-sm font-medium ${
                          setting.setting_value === 'true' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {setting.setting_value === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {setting.setting_value}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Updated:</span>
                      <span className="text-sm text-gray-500">
                        {new Date(setting.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(setting)}
                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
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

export default SystemSettings;
