import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PRDashboard from './PRDashboard';

// Mock fetch
global.fetch = jest.fn();

describe('PRDashboard', () => {
  const mockPRs = [
    {
      id: 'pr-001',
      pr_number: 'PR-2025-001',
      project_id: '1',
      project_name: 'Project Alpha',
      supplier_id: 'supplier-001',
      supplier: {
        id: 'supplier-001',
        name: 'ABC Construction Supplies',
        email: 'quotes@abc.com',
        category: 'Construction',
        rating: 4.5,
        quote_count: 15,
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
      created_by: 'procurement-user',
      created_by_name: 'Procurement Team',
      line_items: [],
      approvals: [],
      quote_approval_id: 'qa-001',
      quote_approval: {
        id: 'qa-001',
        quote_pack_id: 'qp-001',
        quote_pack: {
          id: 'qp-001',
          rfq_id: 'rfq-001',
          rfq: {
            id: 'rfq-001',
            material_request_id: 'mr-001',
            material_request: {
              id: 'mr-001',
              project_id: '1',
              project_name: 'Project Alpha',
              mrn: 'MR-001',
              status: 'approved',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'user-001',
              created_by_name: 'John Doe',
              line_items: [],
              attachments: []
            },
            suppliers: [],
            due_date: new Date().toISOString(),
            status: 'sent',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'user-002',
            created_by_name: 'Jane Smith'
          },
          selected_quotes: [],
          comparison_data: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'user-002',
          created_by_name: 'Jane Smith'
        },
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: 'end-user',
        approved_by_name: 'End User',
        line_item_decisions: []
      }
    }
  ];

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders PR dashboard with loading state', () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ prs: [], pagination: { totalPages: 1 } })
      }), 100))
    );

    render(<PRDashboard userRole="procurement" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders PR list when data is loaded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        prs: mockPRs, 
        pagination: { totalPages: 1 } 
      })
    });

    render(<PRDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PR-2025-001')).toBeInTheDocument();
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('ABC Construction Supplies')).toBeInTheDocument();
    });
  });

  it('filters PRs by project', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        prs: mockPRs, 
        pagination: { totalPages: 1 } 
      })
    });

    render(<PRDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PR-2025-001')).toBeInTheDocument();
    });

    const projectSelect = screen.getByDisplayValue('All Projects');
    fireEvent.change(projectSelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('project_id=1'));
    });
  });

  it('filters PRs by status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        prs: mockPRs, 
        pagination: { totalPages: 1 } 
      })
    });

    render(<PRDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PR-2025-001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'draft' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('status=draft'));
    });
  });

  it('searches PRs by term', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        prs: mockPRs, 
        pagination: { totalPages: 1 } 
      })
    });

    render(<PRDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PR-2025-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by PR number, supplier, or project...');
    fireEvent.change(searchInput, { target: { value: 'PR-2025-001' } });

    await waitFor(() => {
      expect(screen.getByText('PR-2025-001')).toBeInTheDocument();
    });
  });

  it('shows appropriate actions for procurement role', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        prs: mockPRs, 
        pagination: { totalPages: 1 } 
      })
    });

    render(<PRDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  it('shows appropriate actions for approver role', async () => {
    const approvedPRs = [{
      ...mockPRs[0],
      status: 'submitted'
    }];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        prs: approvedPRs, 
        pagination: { totalPages: 1 } 
      })
    });

    render(<PRDashboard userRole="approver" />);
    
    await waitFor(() => {
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<PRDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('No purchase requisitions found')).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        prs: mockPRs, 
        pagination: { totalPages: 1 } 
      })
    });

    render(<PRDashboard userRole="procurement" />);
    
    await waitFor(() => {
      expect(screen.getByText('PR-2025-001')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
