'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Item, ItemSearchFilters } from '@/types/procurement';

interface ItemMasterDashboardProps {
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export default function ItemMasterDashboard({ userRole: _userRole }: ItemMasterDashboardProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ItemSearchFilters>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.category && { category: filters.category }),
        ...(filters.approval_status && { approval_status: filters.approval_status }),
        ...(filters.is_active !== undefined && { is_active: filters.is_active.toString() })
      });

      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      setItems(data.items);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filters]);

  const fetchCategories = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchItems();
  };

  const handleFilterChange = (newFilters: Partial<ItemSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === items.length 
        ? [] 
        : items.map(item => item.id)
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    try {
      // Implement bulk actions based on user role
      console.log(`Bulk ${action} for items:`, selectedItems);
      // Add actual implementation here
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Master Database</h1>
          <p className="text-gray-600">Manage your item catalog and pricing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {/* Navigate to add item */}}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Item
          </button>
          <button
            onClick={() => {/* Navigate to import */}}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Import Items
          </button>
          <button
            onClick={() => {/* Navigate to export */}}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Export Items
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items by code, description, brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.approval_status || ''}
                onChange={(e) => handleFilterChange({ approval_status: e.target.value || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
              <select
                value={filters.is_active?.toString() || ''}
                onChange={(e) => handleFilterChange({ 
                  is_active: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand/Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.item_code}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{item.description}</div>
                  <div className="text-sm text-gray-500">{item.uom}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.brand}</div>
                  <div className="text-sm text-gray-500">{item.model}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.approval_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {/* Navigate to item details */}}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {/* Navigate to edit item */}}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    {item.approval_status === 'pending' && (
                      <button
                        onClick={() => {/* Handle approval */}}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
