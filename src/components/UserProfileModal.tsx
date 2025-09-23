'use client';

import React, { useState } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { cn } from '@/lib/cn';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  designation: string;
  role: string;
  project: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
  loading?: boolean;
}

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpdate, 
  loading = false 
}: UserProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUpdate(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-text">Update Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-text mb-2">
                Full Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={cn(
                  "w-full",
                  errors.name && "border-red-500 focus:border-red-500"
                )}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text mb-2">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn(
                  "w-full",
                  errors.email && "border-red-500 focus:border-red-500"
                )}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-text mb-2">
                Phone Number *
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={cn(
                  "w-full",
                  errors.phone && "border-red-500 focus:border-red-500"
                )}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-brand-text mb-2">
                Designation *
              </label>
              <Input
                id="designation"
                type="text"
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                className={cn(
                  "w-full",
                  errors.designation && "border-red-500 focus:border-red-500"
                )}
                placeholder="Enter your designation"
              />
              {errors.designation && (
                <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
              )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              rows={3}
              placeholder="Enter your address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">
                Role
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span className="text-brand-text font-medium">{formData.role}</span>
                <span className="text-sm text-gray-500 ml-2">(Predefined)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">
                Project
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span className="text-brand-text font-medium">{formData.project}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
