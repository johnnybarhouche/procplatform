'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Modal } from '@/components/ui';

interface UserProfileDropdownProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onClose: () => void;
}

export default function UserProfileDropdown({ user, onClose }: UserProfileDropdownProps) {
  const router = useRouter();
  const { logout, changeRole } = useAuth();
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleProfile = () => {
    router.push('/profile');
    onClose();
  };

  const handleChangeRole = () => {
    setShowChangeRole(true);
  };

  const handleSignOut = () => {
    logout();
    router.push('/auth');
    onClose();
  };

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await changeRole(newRole, password);
      setShowChangeRole(false);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 capitalize">Role: {user.role}</p>
        </div>
        
        <div className="py-1">
          <button
            onClick={handleProfile}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            👤 Profile
          </button>
          
          <button
            onClick={handleChangeRole}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🔄 Change Role
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Change Role Modal */}
      <Modal
        isOpen={showChangeRole}
        onClose={() => {
          setShowChangeRole(false);
          setPassword('');
          setError(null);
        }}
        title="Change Role"
      >
        <form onSubmit={handleRoleChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="requester">Requester</option>
              <option value="procurement">Procurement</option>
              <option value="approver">Approver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowChangeRole(false);
                setPassword('');
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
