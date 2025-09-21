'use client';

import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  change: number;
  icon?: ReactNode;
  onClick?: () => void;
}

export default function KPICard({ 
  title, 
  value, 
  trend, 
  change, 
  icon, 
  onClick 
}: KPICardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-status-success';
      case 'down':
        return 'text-status-danger';
      default:
        return 'text-brand-text/70';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div 
      className={`bg-brand-surface p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-brand-text/70 mb-1">{title}</p>
          <p className="text-2xl font-bold text-brand-text">{formatValue(value)}</p>
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center">
        <div className={`flex items-center ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-1 text-sm font-medium">
            {Math.abs(change)}%
          </span>
        </div>
        <span className="ml-2 text-sm text-brand-text/60">
          vs last period
        </span>
      </div>
    </div>
  );
}

