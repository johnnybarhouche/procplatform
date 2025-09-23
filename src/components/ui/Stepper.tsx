'use client';

import React from 'react';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  disabled?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className = '',
  orientation = 'horizontal',
  size = 'md',
}: StepperProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  const sizeClasses = {
    sm: {
      step: 'w-8 h-8 text-xs',
      line: 'h-0.5',
      content: 'text-sm',
    },
    md: {
      step: 'w-10 h-10 text-sm',
      line: 'h-1',
      content: 'text-base',
    },
    lg: {
      step: 'w-12 h-12 text-base',
      line: 'h-1.5',
      content: 'text-lg',
    },
  };

  const sizeConfig = sizeClasses[size];

  const getStepStatus = (step: StepperStep, index: number) => {
    if (step.completed) return 'completed';
    if (step.id === currentStep) return 'current';
    if (index < currentStepIndex) return 'completed';
    return 'upcoming';
  };

  const getStepClasses = (step: StepperStep, index: number) => {
    const status = getStepStatus(step, index);
    const baseClasses = `
      ${sizeConfig.step}
      rounded-full border-2 flex items-center justify-center font-semibold
      transition-all duration-200
    `;

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-brand-primary text-white border-brand-primary`;
      case 'current':
        return `${baseClasses} bg-white text-brand-primary border-brand-primary ring-4 ring-brand-primary/20`;
      case 'upcoming':
        return `${baseClasses} bg-white text-brand-text/50 border-brand-text/20 ${
          step.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-brand-text/40'
        }`;
      default:
        return baseClasses;
    }
  };

  const getLineClasses = (index: number) => {
    const isCompleted = index < currentStepIndex || steps[index]?.completed;
    return `
      ${sizeConfig.line}
      ${isCompleted ? 'bg-brand-primary' : 'bg-brand-text/20'}
      transition-colors duration-200
    `;
  };

  const handleStepClick = (step: StepperStep, index: number) => {
    if (step.disabled || !onStepClick) return;
    if (index <= currentStepIndex || step.completed) {
      onStepClick(step.id);
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex">
              {/* Step Circle and Line */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(step, index)}
                  className={getStepClasses(step, index)}
                  disabled={step.disabled}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  {step.completed ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                {!isLast && (
                  <div className={`w-0.5 h-8 mt-2 ${getLineClasses(index)}`} />
                )}
              </div>

              {/* Step Content */}
              <div className="ml-4 pb-8">
                <div className={`font-medium ${sizeConfig.content} ${
                  status === 'current' ? 'text-brand-primary' : 
                  status === 'completed' ? 'text-brand-text' : 
                  'text-brand-text/70'
                }`}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-sm text-brand-text/70 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(step, index)}
                  className={getStepClasses(step, index)}
                  disabled={step.disabled}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  {step.completed ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                
                {/* Step Title */}
                <div className="mt-2 text-center">
                  <div className={`font-medium ${sizeConfig.content} ${
                    status === 'current' ? 'text-brand-primary' : 
                    status === 'completed' ? 'text-brand-text' : 
                    'text-brand-text/70'
                  }`}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-brand-text/70 mt-1 max-w-24">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className={`flex-1 mx-4 ${getLineClasses(index)}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
