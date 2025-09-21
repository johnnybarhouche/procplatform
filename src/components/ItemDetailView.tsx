'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Item, ItemPrice, SupplierCapability } from '@/types/procurement';

interface ItemDetailViewProps {
  itemId: string;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export default function ItemDetailView({ itemId, userRole }: ItemDetailViewProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [prices, setPrices] = useState<ItemPrice[]>([]);
  const [capabilities, setCapabilities] = useState<SupplierCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'prices' | 'suppliers'>('details');

  const fetchItemDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch item details
      const itemResponse = await fetch(`/api/items/${itemId}`);
      if (!itemResponse.ok) throw new Error('Failed to fetch item');
      const itemData = await itemResponse.json();
      setItem(itemData);

      // Fetch price history
      const pricesResponse = await fetch(`/api/items/${itemId}/prices`);
      if (pricesResponse.ok) {
        const pricesData = await pricesResponse.json();
        setPrices(pricesData);
      }

      // Fetch supplier capabilities
      const capabilitiesResponse = await fetch(`/api/items/${itemId}/suppliers`);
      if (capabilitiesResponse.ok) {
        const capabilitiesData = await capabilitiesResponse.json();
        setCapabilities(capabilitiesData);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItemDetails();
  }, [fetchItemDetails]);

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Item not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.description}</h1>
            <div className="mt-1 text-sm text-gray-600">Item Code: {item.item_code}</div>
            <div className="mt-2 flex items-center space-x-4">
              {getStatusBadge(item.approval_status)}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {/* Navigate to edit */}}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Edit Item
            </button>
            {item.approval_status === 'pending' && userRole === 'admin' && (
              <button
                onClick={() => {/* Handle approval */}}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'details', name: 'Details' },
              { id: 'prices', name: 'Price History' },
              { id: 'suppliers', name: 'Suppliers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'details' | 'prices' | 'suppliers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Item Code</dt>
                      <dd className="text-sm text-gray-900">{item.item_code}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900">{item.description}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="text-sm text-gray-900">{item.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Unit of Measure</dt>
                      <dd className="text-sm text-gray-900">{item.uom}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Brand</dt>
                      <dd className="text-sm text-gray-900">{item.brand || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Model</dt>
                      <dd className="text-sm text-gray-900">{item.model || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd>{getStatusBadge(item.approval_status)}</dd>
                    </div>
                    {item.approved_by && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                        <dd className="text-sm text-gray-900">{item.approved_by_name}</dd>
                      </div>
                    )}
                    {item.approval_date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Approval Date</dt>
                        <dd className="text-sm text-gray-900">{new Date(item.approval_date).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {item.approval_notes && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Approval Notes</dt>
                        <dd className="text-sm text-gray-900">{item.approval_notes}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created By</dt>
                      <dd className="text-sm text-gray-900">{item.created_by_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created At</dt>
                      <dd className="text-sm text-gray-900">{new Date(item.created_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {item.specifications && Object.keys(item.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(item.specifications).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                          <dd className="text-sm text-gray-900">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prices Tab */}
          {activeTab === 'prices' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Price History</h3>
                <button
                  onClick={() => {/* Add new price */}}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Price
                </button>
              </div>

              {prices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valid From
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valid To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Min Order
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prices.map((price) => (
                        <tr key={price.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{price.supplier_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(price.unit_price, price.currency)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(price.valid_from).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {price.valid_to ? new Date(price.valid_to).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{price.lead_time_days ? `${price.lead_time_days} days` : 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{price.minimum_order_qty || 'N/A'}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No price history available</p>
                </div>
              )}
            </div>
          )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Supplier Capabilities</h3>
                <button
                  onClick={() => {/* Add supplier capability */}}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Supplier
                </button>
              </div>

              {capabilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {capabilities.map((capability) => (
                    <div key={capability.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{capability.supplier_name}</h4>
                        {capability.is_primary_supplier && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-500">Rating: </span>
                          <span className="text-sm font-medium text-gray-900">{capability.capability_rating}/5</span>
                        </div>
                        {capability.notes && (
                          <div>
                            <span className="text-sm text-gray-500">Notes: </span>
                            <span className="text-sm text-gray-900">{capability.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No supplier capabilities available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
