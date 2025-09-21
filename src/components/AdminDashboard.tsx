'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminDashboardData, MRFieldConfig, AuthorizationMatrix, CurrencyConfig } from '@/types/admin';
import MRFieldConfiguration from './MRFieldConfiguration';
import AuthorizationMatrixManager from './AuthorizationMatrixManager';
import CurrencyConfiguration from './CurrencyConfiguration';
import UserManagement from './UserManagement';
import IntegrationManagement from './IntegrationManagement';
import SystemSettings from './SystemSettings';

interface AdminDashboardProps {
  userRole: 'admin';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings' | 'integrations' | 'mr-fields' | 'authorization' | 'currency'>('overview');
  const [mrFields, setMrFields] = useState<MRFieldConfig[]>([]);
  const [mrFieldsLoading, setMrFieldsLoading] = useState(false);
  const [authorizationMatrix, setAuthorizationMatrix] = useState<AuthorizationMatrix[]>([]);
  const [authMatrixLoading, setAuthMatrixLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('1');
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null);
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'x-user-role': userRole
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchMRFields = useCallback(async () => {
    try {
      setMrFieldsLoading(true);
      const response = await fetch('/api/admin/mr-fields', {
        headers: {
          'x-user-role': userRole
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch MR field configuration');
      }
      
      const data = await response.json();
      setMrFields(data);
    } catch (error) {
      console.error('Error fetching MR field configuration:', error);
    } finally {
      setMrFieldsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (activeTab === 'mr-fields') {
      fetchMRFields();
    }
  }, [activeTab, fetchMRFields]);

  const fetchAuthorizationMatrix = useCallback(async (projectId: string) => {
    try {
      setAuthMatrixLoading(true);
      const response = await fetch(`/api/admin/authorization-matrix?project_id=${projectId}`, {
        headers: {
          'x-user-role': userRole
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch authorization matrix');
      }
      
      const data = await response.json();
      setAuthorizationMatrix(data);
    } catch (error) {
      console.error('Error fetching authorization matrix:', error);
    } finally {
      setAuthMatrixLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (activeTab === 'authorization') {
      fetchAuthorizationMatrix(selectedProject);
    }
  }, [activeTab, selectedProject, fetchAuthorizationMatrix]);

  const fetchCurrencyConfig = useCallback(async () => {
    try {
      setCurrencyLoading(true);
      const response = await fetch('/api/admin/currency', {
        headers: {
          'x-user-role': userRole
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch currency configuration');
      }
      
      const data = await response.json();
      setCurrencyConfig(data);
    } catch (error) {
      console.error('Error fetching currency configuration:', error);
    } finally {
      setCurrencyLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (activeTab === 'currency') {
      fetchCurrencyConfig();
    }
  }, [activeTab, fetchCurrencyConfig]);

  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-status-success bg-status-success/10';
      case 'warning': return 'text-status-warning bg-status-warning/10';
      case 'error': return 'text-status-danger bg-status-danger/10';
      default: return 'text-brand-text/70 bg-brand-surface';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-brand-surface rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-brand-surface p-6 rounded-lg shadow">
                <div className="h-4 bg-brand-surface rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-brand-surface rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-text mb-4">Admin Dashboard</h2>
          <p className="text-brand-text/70">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-text mb-2">Admin Dashboard</h1>
        <p className="text-brand-text/70">System administration and configuration management</p>
      </div>

      {/* System Health Status */}
      <div className="mb-8">
        <div className="bg-brand-surface rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-text">System Health</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(dashboardData.system_health)}`}>
              {dashboardData.system_health.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-brand-text/70">Total Users</p>
              <p className="text-2xl font-semibold text-brand-text">{dashboardData.total_users}</p>
            </div>
          </div>
        </div>

        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-status-success/10 rounded-lg">
              <svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-brand-text/70">Active Users</p>
              <p className="text-2xl font-semibold text-brand-text">{dashboardData.active_users}</p>
            </div>
          </div>
        </div>

        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-brand-text/70">Projects</p>
              <p className="text-2xl font-semibold text-brand-text">{dashboardData.total_projects}</p>
            </div>
          </div>
        </div>

        <div className="bg-brand-surface p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-brand-text/70">Total MRs</p>
              <p className="text-2xl font-semibold text-brand-text">{dashboardData.system_stats.total_mrs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'mr-fields', label: 'MR Fields' },
            { id: 'authorization', label: 'Authorization' },
            { id: 'currency', label: 'Currency' },
            { id: 'users', label: 'User Management' },
            { id: 'settings', label: 'System Settings' },
            { id: 'integrations', label: 'Integrations' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'mr-fields' | 'authorization' | 'currency' | 'users' | 'settings' | 'integrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

      {/* Tab Content */}
      <div className="bg-brand-surface rounded-lg shadow">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-brand-text mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {dashboardData.recent_activity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-4 bg-brand-surface rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-text">{activity.action}</p>
                    <p className="text-sm text-brand-text/70">{activity.details}</p>
                    <p className="text-xs text-brand-text/60 mt-1">
                      by {activity.actor} • {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mr-fields' && (
          <div className="p-6">
            {mrFieldsLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-brand-surface rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-brand-surface rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <MRFieldConfiguration 
                fields={mrFields} 
                onUpdate={(updatedFields) => {
                  setMrFields(updatedFields);
                  fetchDashboardData(); // Refresh dashboard data
                }} 
              />
            )}
          </div>
        )}

        {activeTab === 'authorization' && (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-text/80 mb-2">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="1">Project Alpha</option>
                <option value="2">Project Beta</option>
              </select>
            </div>
            {authMatrixLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-brand-surface rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-brand-surface rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <AuthorizationMatrixManager 
                projectId={selectedProject}
                matrix={authorizationMatrix} 
                onUpdate={(updatedMatrix) => {
                  setAuthorizationMatrix(updatedMatrix);
                  fetchDashboardData(); // Refresh dashboard data
                }} 
              />
            )}
          </div>
        )}

        {activeTab === 'currency' && (
          <div className="p-6">
            {currencyLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-brand-surface rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-brand-surface rounded"></div>
                  ))}
                </div>
              </div>
            ) : currencyConfig ? (
              <CurrencyConfiguration 
                currency={currencyConfig} 
                onUpdate={(updatedConfig) => {
                  setCurrencyConfig(updatedConfig);
                  fetchDashboardData(); // Refresh dashboard data
                }} 
              />
            ) : (
              <div className="text-center">
                <p className="text-brand-text/70">Failed to load currency configuration</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-6">
            <UserManagement userRole={userRole} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <SystemSettings userRole={userRole} />
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="p-6">
            <IntegrationManagement userRole={userRole} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
