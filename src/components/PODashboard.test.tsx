import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PODashboard from './PODashboard';

// Mock fetch
global.fetch = jest.fn();

const mockPOs = [
  {
    id: 'po-001',
    po_number: 'PO-ALPHA-001',
    project_id: '1',
    project_name: 'Project Alpha',
    supplier_id: 'supplier-001',
    supplier: {
      id: 'supplier-001',
      name: 'ABC Construction Supplies',
      email: 'quotes@abc.com',
      phone: '123-456-7890',
      address: '123 Main St',
      category: 'Construction',
      rating: 4.5,
      quote_count: 10,
      avg_response_time: 24,
      last_quote_date: new Date().toISOString(),
      is_active: true,
      compliance_docs: []
    },
    status: 'draft',
    total_value: 15000,
    currency: 'AED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user-002',
    created_by_name: 'Jane Smith',
    payment_terms: 'Net 30',
    delivery_address: 'Project Alpha Site, Dubai',
    line_items: [],
    status_history: [],
    attachments: [],
    pr_id: 'pr-001',
    pr: {
      id: 'pr-001',
      pr_number: 'PR-001',
      status: 'approved',
      total_amount: 1000,
      created_at: '2025-01-01T00:00:00Z',
      created_by: 'user1',
      created_by_name: 'John Smith'
    }
  }
];

describe('PODashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders PO dashboard with loading state', () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pos: [], pagination: { totalPages: 1, totalItems: 0 } })
    });

    render(<PODashboard userRole="procurement" />);
    expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
  });

  it('displays POs when data is loaded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        pos: mockPOs, 
        pagination: { totalPages: 1, totalItems: 1 } 
      })
    });

    render(<PODashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PO-ALPHA-001')).toBeInTheDocument();
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('ABC Construction Supplies')).toBeInTheDocument();
      expect(screen.getByText('15,000 AED')).toBeInTheDocument();
    });
  });

  it('filters POs by status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        pos: mockPOs, 
        pagination: { totalPages: 1, totalItems: 1 } 
      })
    });

    render(<PODashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PO-ALPHA-001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'draft' } });

    // Should trigger a new fetch with status filter
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('searches POs by term', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        pos: mockPOs, 
        pagination: { totalPages: 1, totalItems: 1 } 
      })
    });

    render(<PODashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PO-ALPHA-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by PO number, project, or supplier...');
    fireEvent.change(searchInput, { target: { value: 'ALPHA' } });

    // Should filter the displayed POs
    expect(screen.getByText('PO-ALPHA-001')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        pos: mockPOs, 
        pagination: { totalPages: 1, totalItems: 1 } 
      })
    });

    render(<PODashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PO-ALPHA-001')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Should trigger a new fetch
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('displays status badges correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        pos: mockPOs, 
        pagination: { totalPages: 1, totalItems: 1 } 
      })
    });

    render(<PODashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('DRAFT')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<PODashboard userRole="procurement" />);
    
    // Should not crash and should show loading state initially
    expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
  });
});
