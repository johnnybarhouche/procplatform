'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import UserProfileModal from '@/components/UserProfileModal';
import UserProfileDropdown from '@/components/UserProfileDropdown';

interface TopBarProps {
  projects: Array<{ id: string; name: string; logo?: string }>;
  selectedProjectId: string;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    designation: string;
    role: string;
    project: string;
  };
  onUserUpdate: (user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    designation: string;
    role: string;
    project: string;
  }) => void;
  innerClassName?: string;
}


export function TopBar({
  projects,
  selectedProjectId,
  userRole,
  user,
  onUserUpdate,
  innerClassName,
}: TopBarProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-brand-primary text-brand-on-primary shadow-sm">
      <div className={cn('min-h-[var(--app-topbar-height)] w-full', innerClassName)}>
        <div className="flex items-center gap-3">
          {selectedProject?.logo ? (
            <img 
              src={selectedProject.logo} 
              alt={`${selectedProject.name} logo`}
              className="h-10 w-10 rounded-md object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-on-primary text-brand-primary font-semibold">
              {selectedProject?.name?.substring(0, 2).toUpperCase() || 'PP'}
            </div>
          )}
          <div className="hidden flex-col sm:flex">
            <span className="text-sm uppercase tracking-wide text-brand-on-primary/70">Procurement Platform</span>
            <span className="text-lg font-semibold">{selectedProject?.name || 'Global Operations'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Display - Non-interactive as per requirements */}
          <div className="hidden sm:flex items-center">
            <span className="text-sm font-bold text-brand-on-primary bg-brand-on-primary/20 px-3 py-1 rounded-full">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-on-primary/10 text-brand-on-primary hover:bg-brand-on-primary/20 transition-colors"
            >
              🔔
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">New MR requires your approval</p>
                      <p className="text-xs text-blue-600">2 minutes ago</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">Quote received from Supplier ABC</p>
                      <p className="text-xs text-green-600">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              aria-label="Profile"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-on-primary/10 text-brand-on-primary font-semibold hover:bg-brand-on-primary/20 transition-colors"
            >
              {userInitials}
            </button>
            {showProfileDropdown && (
              <UserProfileDropdown
                user={user}
                onClose={() => setShowProfileDropdown(false)}
              />
            )}
          </div>

        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdate={(updatedUser) => {
          onUserUpdate(updatedUser);
          setShowProfileModal(false);
        }}
      />
    </header>
  );
}
