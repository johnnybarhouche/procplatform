'use client';

import React, { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';

interface SignInPageProps {
  onSignIn: (credentials: { username: string; password: string; rememberMe: boolean; role: string }) => void;
  onRequestAccess: () => void;
  onAdminAccess: () => void;
  loading?: boolean;
  error?: string;
}

export default function SignInPage({ 
  onSignIn, 
  onRequestAccess, 
  onAdminAccess, 
  loading = false, 
  error 
}: SignInPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
    role: 'requester' as 'requester' | 'procurement' | 'approver' | 'admin'
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showOTP) {
      // Handle OTP verification
      console.log('OTP verification:', otp);
      // In real implementation, verify OTP with backend
      onSignIn({ ...formData, rememberMe: formData.rememberMe });
    } else {
      // First time sign in - send OTP
      setShowOTP(true);
      // In real implementation, send OTP to email
      console.log('Sending OTP to email for:', formData.username);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-text mb-2">Welcome Back</h1>
            <p className="text-brand-text/70">Sign in to your procurement system</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!showOTP ? (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-brand-text mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-brand-text mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-brand-text mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="requester">Requester</option>
                    <option value="procurement">Procurement</option>
                    <option value="approver">Approver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="ml-2 text-sm text-brand-text">Remember me</span>
                  </label>
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-brand-text mb-2">
                  Enter OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="w-full text-center text-lg tracking-widest"
                />
                <p className="text-sm text-brand-text/70 mt-2">
                  We&apos;ve sent a 6-digit code to your email
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : showOTP ? 'Verify OTP' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={onRequestAccess}
              className="w-full text-center text-sm text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
              Request Access
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={onAdminAccess}
              variant="secondary"
              className="w-full"
            >
              Admin Access
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
