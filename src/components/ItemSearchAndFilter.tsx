'use client';

import React, { useState, useEffect } from 'react';
import { ItemSearchFilters } from '@/types/procurement';

interface ItemSearchAndFilterProps {
  onFiltersChanged: (filters: ItemSearchFilters) => void;
  onSearch: (searchTerm: string) => void;
}

export default function ItemSearchAndFilter({ onFiltersChanged, onSearch }: ItemSearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ItemSearchFilters>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/items/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data.filters.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof ItemSearchFilters, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChanged(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    onFiltersChanged({});
    onSearch('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="bg-brand-surface p-6 rounded-lg shadow">
      {/* Basic Search */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search items by code, description, brand..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border border-brand-text/20 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('approval_status', 'approved')}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.approval_status === 'approved'
                ? 'bg-status-success/10 text-green-800'
                : 'bg-brand-surface text-brand-text/80 hover:bg-brand-surface'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleFilterChange('approval_status', 'pending')}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.approval_status === 'pending'
                ? 'bg-status-warning/10 text-yellow-800'
                : 'bg-brand-surface text-brand-text/80 hover:bg-brand-surface'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleFilterChange('is_active', true)}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.is_active === true
                ? 'bg-brand-primary/10 text-blue-800'
                : 'bg-brand-surface text-brand-text/80 hover:bg-brand-surface'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleFilterChange('is_active', false)}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.is_active === false
                ? 'bg-status-danger/10 text-red-800'
                : 'bg-brand-surface text-brand-text/80 hover:bg-brand-surface'
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-brand-text/60">Active filters:</span>
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-primary/10 text-blue-800">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 text-brand-primary hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.approval_status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-status-success/10 text-green-800">
                Status: {filters.approval_status}
                <button
                  onClick={() => handleFilterChange('approval_status', undefined)}
                  className="ml-1 text-status-success hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.is_active !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Active: {filters.is_active ? 'Yes' : 'No'}
                <button
                  onClick={() => handleFilterChange('is_active', undefined)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-brand-text/60 hover:text-brand-text/80 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-brand-text/10">
          <h3 className="text-lg font-medium text-brand-text mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full border border-brand-text/20 rounded-md px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Approval Status</label>
              <select
                value={filters.approval_status || ''}
                onChange={(e) => handleFilterChange('approval_status', e.target.value || undefined)}
                className="w-full border border-brand-text/20 rounded-md px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Active Status</label>
              <select
                value={filters.is_active?.toString() || ''}
                onChange={(e) => handleFilterChange('is_active', 
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )}
                className="w-full border border-brand-text/20 rounded-md px-3 py-2"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text/80 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.price_min || ''}
                  onChange={(e) => handleFilterChange('price_min', 
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  className="w-full border border-brand-text/20 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.price_max || ''}
                  onChange={(e) => handleFilterChange('price_max', 
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  className="w-full border border-brand-text/20 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="bg-brand-surface text-brand-text/80 px-4 py-2 rounded-md hover:bg-brand-primary/10"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
