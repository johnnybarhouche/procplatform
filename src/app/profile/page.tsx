'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Input } from '@/components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // In a real application, you would make an API call to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    router.push('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-brand-text mb-4">Access Denied</h1>
            <p className="text-brand-text/70 mb-6">You need to be logged in to access this page.</p>
            <Button onClick={() => router.push('/auth')} className="w-full">
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-text mb-2">User Profile</h1>
            <p className="text-brand-text/70">Update your personal information</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-text mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brand-text mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-brand-text mb-2">
                  Designation
                </label>
                <Input
                  id="designation"
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Enter your job title"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-brand-text mb-2">
                Address
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Username:</span>
                  <span className="ml-2 font-medium">{user.username}</span>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2 font-medium capitalize">{user.role}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/')}
              >
                Back to Dashboard
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
