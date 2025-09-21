import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SupplierDashboard from './SupplierDashboard';

// Mock fetch
global.fetch = jest.fn();

const mockSuppliers = [
  {
    id: '1',
    name: 'ABC Construction Supplies',
    email: 'quotes@abcconstruction.com',
    phone: '+971-4-123-4567',
    address: 'Dubai, UAE',
    category: 'Construction Materials',
    rating: 4.5,
    quote_count: 25,
    avg_response_time: 24,
    last_quote_date: '2025-01-15',
    is_active: true,
    status: 'approved',
    approval_date: '2025-01-01',
    approved_by: 'user1',
    approved_by_name: 'John Smith',
    approval_notes: 'All compliance documents verified',
    contacts: [],
    performance_metrics: {
      id: '1',
      supplier_id: '1',
      total_quotes: 25,
      successful_quotes: 20,
      avg_response_time_hours: 24,
      on_time_delivery_rate: 95.0,
      quality_rating: 4.5,
      communication_rating: 4.3,
      last_updated: '2025-01-15T00:00:00Z'
    },
    compliance_docs: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    created_by: 'user1',
    created_by_name: 'John Smith'
  },
  {
    id: '2',
    name: 'XYZ Electrical Solutions',
    email: 'procurement@xyzelectrical.com',
    phone: '+971-4-234-5678',
    address: 'Abu Dhabi, UAE',
    category: 'Electrical Equipment',
    rating: 4.2,
    quote_count: 18,
    avg_response_time: 36,
    last_quote_date: '2025-01-10',
    is_active: true,
    status: 'pending',
    contacts: [],
    performance_metrics: {
      id: '2',
      supplier_id: '2',
      total_quotes: 18,
      successful_quotes: 15,
      avg_response_time_hours: 36,
      on_time_delivery_rate: 88.0,
      quality_rating: 4.2,
      communication_rating: 4.0,
      last_updated: '2025-01-10T00:00:00Z'
    },
    compliance_docs: [],
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    created_by: 'user2',
    created_by_name: 'Sarah Johnson'
  }
];

describe('SupplierDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders supplier dashboard with title', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('Supplier Management')).toBeInTheDocument();
    });
  });

  it('displays suppliers list', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('ABC Construction Supplies')).toBeInTheDocument();
      expect(screen.getByText('XYZ Electrical Solutions')).toBeInTheDocument();
    });
  });

  it('shows add supplier button for procurement role', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Supplier')).toBeInTheDocument();
    });
  });

  it('does not show add supplier button for requester role', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="requester" />);
    
    await waitFor(() => {
      expect(screen.queryByText('Add Supplier')).not.toBeInTheDocument();
    });
  });

  it('filters suppliers by category', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('ABC Construction Supplies')).toBeInTheDocument();
    });

    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'Construction Materials' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=Construction%20Materials')
      );
    });
  });

  it('filters suppliers by status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('ABC Construction Supplies')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'approved' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=approved')
      );
    });
  });

  it('searches suppliers by name', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('ABC Construction Supplies')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search suppliers...');
    fireEvent.change(searchInput, { target: { value: 'ABC' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=ABC')
      );
    });
  });

  it('displays supplier ratings with stars', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
    });
  });

  it('shows status badges', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        suppliers: mockSuppliers,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SupplierDashboard userRole="procurement" />);
    
    expect(screen.getByText('Loading suppliers...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('retries on error', async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          suppliers: mockSuppliers,
          pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
        })
      });

    render(<SupplierDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(screen.getByText('ABC Construction Supplies')).toBeInTheDocument();
    });
  });
});

