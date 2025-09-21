'use client';

import React, { useState, useEffect } from 'react';
import { AuthorizationMatrix } from '@/types/admin';

interface AuthorizationMatrixManagerProps {
  projectId: string;
  matrix: AuthorizationMatrix[];
  onUpdate: (matrix: AuthorizationMatrix[]) => void;
}

const AuthorizationMatrixManager: React.FC<AuthorizationMatrixManagerProps> = ({ 
  projectId, 
  matrix, 
  onUpdate 
}) => {
  const [localMatrix, setLocalMatrix] = useState<AuthorizationMatrix[]>(matrix);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<AuthorizationMatrix>>({
    role: '',
    threshold_amount: 0,
    approval_level: 1,
    is_active: true
  });

  useEffect(() => {
    setLocalMatrix(matrix);
  }, [matrix]);

  const handleMatrixUpdate = (entryId: string, updates: Partial<AuthorizationMatrix>) => {
    setLocalMatrix(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, ...updates }
          : entry
      )
    );
  };

  const handleAddEntry = () => {
    if (!newEntry.role || newEntry.threshold_amount === undefined || newEntry.approval_level === undefined) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const entry: AuthorizationMatrix = {
      id: `new-${Date.now()}`,
      project_id: projectId,
      role: newEntry.role!,
      threshold_amount: newEntry.threshold_amount!,
      approval_level: newEntry.approval_level!,
      is_active: newEntry.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setLocalMatrix(prev => [...prev, entry]);
    setNewEntry({
      role: '',
      threshold_amount: 0,
      approval_level: 1,
      is_active: true
    });
    setShowAddForm(false);
    setMessage({ type: 'success', text: 'New authorization rule added' });
  };

  const handleRemoveEntry = (entryId: string) => {
    setLocalMatrix(prev => prev.filter(entry => entry.id !== entryId));
    setMessage({ type: 'success', text: 'Authorization rule removed' });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/authorization-matrix', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ matrix: localMatrix })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update authorization matrix');
      }

      const result = await response.json();
      onUpdate(result.matrix);
      setMessage({ type: 'success', text: 'Authorization matrix updated successfully' });
    } catch (error) {
      console.error('Error updating authorization matrix:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update authorization matrix' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'requester': return 'bg-brand-primary/10 text-blue-800';
      case 'procurement_manager': return 'bg-status-success/10 text-green-800';
      case 'department_head': return 'bg-purple-100 text-purple-800';
      case 'finance_director': return 'bg-status-warning/10 text-yellow-800';
      case 'ceo': return 'bg-status-danger/10 text-red-800';
      default: return 'bg-brand-surface text-brand-text/90';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-text">Authorization Matrix</h3>
          <p className="text-sm text-brand-text/70">Configure approval thresholds and routing rules for Project {projectId}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-status-success text-white rounded-md hover:bg-status-success/90"
          >
            Add Rule
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Matrix'}
          </button>
        </div>
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

      {/* Add New Entry Form */}
      {showAddForm && (
        <div className="bg-brand-surface rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-brand-text mb-4">Add New Authorization Rule</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Role</label>
              <select
                value={newEntry.role || ''}
                onChange={(e) => setNewEntry({ ...newEntry, role: e.target.value })}
                className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select Role</option>
                <option value="requester">Requester</option>
                <option value="procurement_manager">Procurement Manager</option>
                <option value="department_head">Department Head</option>
                <option value="finance_director">Finance Director</option>
                <option value="ceo">CEO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Threshold Amount (AED)</label>
              <input
                type="number"
                value={newEntry.threshold_amount || 0}
                onChange={(e) => setNewEntry({ ...newEntry, threshold_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Approval Level</label>
              <input
                type="number"
                value={newEntry.approval_level || 1}
                onChange={(e) => setNewEntry({ ...newEntry, approval_level: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                min="1"
              />
            </div>
            <div className="flex items-end space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newEntry.is_active ?? true}
                  onChange={(e) => setNewEntry({ ...newEntry, is_active: e.target.checked })}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-text/20 rounded"
                />
                <span className="ml-2 text-sm text-brand-text/80">Active</span>
              </label>
              <button
                onClick={handleAddEntry}
                className="px-3 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 bg-brand-primary/10 text-brand-text/80 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authorization Matrix Table */}
      <div className="bg-brand-surface rounded-lg shadow">
        <div className="px-6 py-4 border-b border-brand-text/10">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-brand-text/60">
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Threshold</div>
            <div className="col-span-2">Approval Level</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Actions</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {localMatrix
            .sort((a, b) => a.approval_level - b.approval_level)
            .map((entry) => (
            <div key={entry.id} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(entry.role)}`}>
                    {entry.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm font-medium text-brand-text">
                    {formatCurrency(entry.threshold_amount)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-brand-text">Level {entry.approval_level}</span>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.is_active 
                      ? 'bg-status-success/10 text-green-800' 
                      : 'bg-status-danger/10 text-red-800'
                  }`}>
                    {entry.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMatrixUpdate(entry.id, { is_active: !entry.is_active })}
                      className="text-sm text-brand-primary hover:text-blue-800"
                    >
                      {entry.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="text-sm text-status-danger hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matrix Summary */}
      <div className="bg-brand-surface rounded-lg p-4">
        <h4 className="text-sm font-medium text-brand-text mb-2">Authorization Matrix Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-brand-text/70">Total Rules:</span>
            <span className="ml-2 font-medium">{localMatrix.length}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Active Rules:</span>
            <span className="ml-2 font-medium">{localMatrix.filter(e => e.is_active).length}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Max Threshold:</span>
            <span className="ml-2 font-medium">{formatCurrency(Math.max(...localMatrix.map(e => e.threshold_amount)))}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Max Level:</span>
            <span className="ml-2 font-medium">{Math.max(...localMatrix.map(e => e.approval_level))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationMatrixManager;

