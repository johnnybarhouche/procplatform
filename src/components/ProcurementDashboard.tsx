'use client';

import React, { useState, useEffect } from 'react';
import { MaterialRequest, Supplier, RFQ } from '@/types/procurement';

interface ProcurementDashboardProps {
  userRole: 'procurement' | 'admin';
}

export default function ProcurementDashboard({ }: ProcurementDashboardProps) {
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mrsResponse, suppliersResponse, rfqsResponse] = await Promise.all([
        fetch('/api/mrs'),
        fetch('/api/suppliers'),
        fetch('/api/rfqs')
      ]);

      const [mrsData, suppliersData, rfqsData] = await Promise.all([
        mrsResponse.json(),
        suppliersResponse.json(),
        rfqsResponse.json()
      ]);

      // Handle API response structure
      const mrs = mrsData.mrs || mrsData;
      const suppliers = Array.isArray(suppliersData) ? suppliersData : [];
      const rfqs = Array.isArray(rfqsData) ? rfqsData : [];

      setMaterialRequests(Array.isArray(mrs) ? mrs : []);
      setSuppliers(suppliers);
      setRfqs(rfqs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMRs = (materialRequests || []).filter(mr => {
    if (filterStatus === 'all') return true;
    return mr.status === filterStatus;
  });

  const sortedMRs = [...filteredMRs].sort((a, b) => {
    switch (sortBy) {
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'project':
        return a.project_name.localeCompare(b.project_name);
      case 'requester':
        return a.requester_name.localeCompare(b.requester_name);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Procurement Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage Material Requests and RFQ processes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MR Inbox */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Material Requests Inbox</h2>
                  <div className="flex space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="created_at">Sort by Date</option>
                      <option value="project">Sort by Project</option>
                      <option value="requester">Sort by Requester</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {sortedMRs.map((mr) => (
                  <div key={mr.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            MR-{mr.mrn} - {mr.project_name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(mr.status)}`}>
                            {mr.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Requested by {mr.requester_name} • {new Date(mr.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {mr.line_items.length} line items • Total: {mr.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString()} AED
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          View Details
                        </button>
                        {mr.status === 'submitted' && (
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                            Create RFQ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier Suggestions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Supplier Suggestions</h2>
                <p className="text-sm text-gray-600">Historical suppliers and pricing</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {(suppliers || []).slice(0, 5).map((supplier) => (
                    <div key={supplier.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                          <p className="text-sm text-gray-600">{supplier.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {supplier.rating}/5.0
                          </p>
                          <p className="text-xs text-gray-500">
                            {supplier.quote_count} quotes
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Avg Response:</span>
                          <span className="text-xs font-medium">{supplier.avg_response_time}h</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">Last Quote:</span>
                          <span className="text-xs">{new Date(supplier.last_quote_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    View All Suppliers
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{(materialRequests || []).length}</p>
                    <p className="text-sm text-gray-600">Total MRs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{(rfqs || []).length}</p>
                    <p className="text-sm text-gray-600">Active RFQs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {(materialRequests || []).filter(mr => mr.status === 'submitted').length}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{(suppliers || []).length}</p>
                    <p className="text-sm text-gray-600">Suppliers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
