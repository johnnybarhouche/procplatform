'use client';

import { useState } from 'react';
import MaterialRequestForm from '@/components/MaterialRequestForm';
import ProcurementDashboard from '@/components/ProcurementDashboard';
import QuoteApprovalDashboard from '@/components/QuoteApprovalDashboard';
import PRDashboard from '@/components/PRDashboard';
import PODashboard from '@/components/PODashboard';
import SupplierDashboard from '@/components/SupplierDashboard';
import ItemMasterDashboard from '@/components/ItemMasterDashboard';

export default function Home() {
  const [currentView, setCurrentView] = useState<'mr-form' | 'procurement-dashboard' | 'quote-approval' | 'pr-dashboard' | 'po-dashboard' | 'supplier-dashboard' | 'item-database'>('mr-form');
  const [userRole, setUserRole] = useState<'requester' | 'procurement' | 'approver' | 'admin'>('requester');

  // Mock projects data - in real app this would come from API
  const projects = [
    { id: '1', name: 'Project Alpha' },
    { id: '2', name: 'Project Beta' }
  ];


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Procurement Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Role:</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as 'requester' | 'procurement' | 'approver' | 'admin')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="requester">Requester</option>
                  <option value="procurement">Procurement</option>
                  <option value="approver">Approver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('mr-form')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentView === 'mr-form'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Create MR
                </button>
                <button
                  onClick={() => setCurrentView('procurement-dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentView === 'procurement-dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Procurement Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('quote-approval')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentView === 'quote-approval'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Quote Approvals
                </button>
                <button
                  onClick={() => setCurrentView('pr-dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentView === 'pr-dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Purchase Requisitions
                </button>
                <button
                  onClick={() => setCurrentView('po-dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentView === 'po-dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Purchase Orders
                </button>
                <button
                  onClick={() => setCurrentView('supplier-dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentView === 'supplier-dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Supplier Management
                </button>
                <button
                  onClick={() => setCurrentView('item-database')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentView === 'item-database'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Item Database
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'mr-form' && (
          <MaterialRequestForm 
            projects={projects}
          />
        )}
        {currentView === 'procurement-dashboard' && (
          <ProcurementDashboard userRole={userRole === 'procurement' ? 'procurement' : 'admin'} />
        )}
        {currentView === 'quote-approval' && (
          <QuoteApprovalDashboard userRole={userRole === 'approver' ? 'approver' : 'requester'} />
        )}
        {currentView === 'pr-dashboard' && (
          <PRDashboard userRole={userRole} />
        )}
        {currentView === 'po-dashboard' && (
          <PODashboard userRole={userRole} />
        )}
        {currentView === 'supplier-dashboard' && (
          <SupplierDashboard userRole={userRole} />
        )}
        {currentView === 'item-database' && (
          <ItemMasterDashboard userRole={userRole} />
        )}
      </main>
    </div>
  );
}
