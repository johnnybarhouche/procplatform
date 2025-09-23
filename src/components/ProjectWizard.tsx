'use client';

import React, { useState } from 'react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: { id: string; name: string; description: string; logo?: string }) => void;
}

export default function ProjectWizard({ isOpen, onClose, onProjectCreated }: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const { project } = await response.json();
      onProjectCreated(project);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="rounded-lg border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-text">Project Information</h3>
            <Input
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block text-sm font-medium text-brand-text/70 mb-2" htmlFor="description">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-brand-text/20 px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter project description"
                required
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-text">Project Logo</h3>
            <Input
              label="Logo URL"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="Enter logo URL (optional)"
            />
            {formData.logo && (
              <div className="mt-4">
                <img
                  src={formData.logo}
                  alt="Project logo preview"
                  className="h-20 w-20 rounded-md object-contain"
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-text">Review</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-brand-text">Name:</span>
                <span className="ml-2 text-brand-text/70">{formData.name}</span>
              </div>
              <div>
                <span className="font-medium text-brand-text">Description:</span>
                <span className="ml-2 text-brand-text/70">{formData.description}</span>
              </div>
              {formData.logo && (
                <div>
                  <span className="font-medium text-brand-text">Logo:</span>
                  <img
                    src={formData.logo}
                    alt="Project logo"
                    className="ml-2 inline-block h-8 w-8 rounded-md object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={currentStep === 1 ? onClose : handleBack}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          {currentStep < 3 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={!formData.name || !formData.description}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              Create Project
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
