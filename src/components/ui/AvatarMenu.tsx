'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AvatarMenuProps {
  user: User;
  onProfile: () => void;
  onNotifications: () => void;
  onSignOut: () => void;
  className?: string;
}

export function AvatarMenu({
  user,
  onProfile,
  onNotifications,
  onSignOut,
  className = '',
}: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleProfile = () => {
    onProfile();
    setIsOpen(false);
  };

  const handleNotifications = () => {
    onNotifications();
    setIsOpen(false);
  };

  const handleSignOut = () => {
    onSignOut();
    setIsOpen(false);
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Avatar Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="flex items-center space-x-2 p-2 hover:bg-brand-text/5 rounded-md"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-semibold">
            {getInitials(user.name)}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-brand-text">{user.name}</div>
          <div className="text-xs text-brand-text/70">{user.role}</div>
        </div>
        <svg
          className={`w-4 h-4 text-brand-text/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-brand-text/10 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-brand-text/10">
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-brand-text">{user.name}</div>
                <div className="text-xs text-brand-text/70">{user.email}</div>
                <div className="text-xs text-brand-text/50">{user.role}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleProfile}
              className="w-full px-4 py-2 text-left text-sm text-brand-text hover:bg-brand-text/5 flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-brand-text/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile Settings</span>
            </button>

            <button
              onClick={handleNotifications}
              className="w-full px-4 py-2 text-left text-sm text-brand-text hover:bg-brand-text/5 flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-brand-text/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Notifications</span>
            </button>

            <div className="border-t border-brand-text/10 my-1"></div>

            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-status-danger hover:bg-status-danger/5 flex items-center space-x-3"
            >
              <svg className="w-4 h-4 text-status-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
