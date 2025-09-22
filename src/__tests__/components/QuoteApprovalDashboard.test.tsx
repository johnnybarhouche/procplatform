import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteApprovalDashboard from '@/components/QuoteApprovalDashboard';
import { QuoteApproval } from '@/types/procurement';

// Mock fetch
global.fetch = jest.fn();

const mockQuoteApprovals: QuoteApproval[] = [
  {
    id: 'qa-1',
    quote_pack_id: 'qp-1',
    quote_pack: {
      id: 'qp-1',
      rfq_id: 'rfq-1',
      rfq: {
        id: 'rfq-1',
        material_request_id: 'mr-1',
        material_request: {
          id: 'mr-1',
          mrn: 'MR-001',
          project_name: 'Test Project',
          line_items: [
            {
              id: 'line-1',
              item_code: 'ITEM-001',
              description: 'Test Item',
              quantity: 10,
              unit: 'PCS',
              unit_price: 100,
              total_price: 1000,
              remarks: 'Test remarks'
            }
          ]
        },
        status: 'comparison_ready',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      status: 'pending',
      quotes: [],
      comparison_data: {
        recommended_suppliers: [],
        total_savings: 0,
        comparison_summary: {
          total_lines: 1,
          lines_with_quotes: 1,
          lowest_price_suppliers: [],
          savings_opportunities: []
        }
      },
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    status: 'pending',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    line_item_decisions: [],
    comments: null,
    approved_at: null,
    approved_by: null,
    approved_by_name: null
  }
];

describe('QuoteApprovalDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders the dashboard title', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuoteApprovals
    });

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Quote Approvals')[0]).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<QuoteApprovalDashboard userRole="admin" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays quote approvals when data is loaded', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuoteApprovals
    });

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Quote Pack for MR-001')).toBeInTheDocument();
      expect(screen.getByText('Project: Test Project')).toBeInTheDocument();
    });
  });

  it('handles filter changes', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuoteApprovals
    });

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Quote Pack for MR-001')).toBeInTheDocument();
    });

    const filterSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(filterSelect, { target: { value: 'pending' } });

    expect(filterSelect).toHaveValue('pending');
  });

  it('handles sort changes', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuoteApprovals
    });

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Quote Pack for MR-001')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('Sort by Date');
    fireEvent.change(sortSelect, { target: { value: 'status' } });

    expect(sortSelect).toHaveValue('status');
  });

  it('opens approval modal when approval is clicked', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuoteApprovals
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuoteApprovals[0]
      });

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Quote Pack for MR-001')).toBeInTheDocument();
    });

    const reviewButton = screen.getByText('Review & Approve');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText('Quote Approval')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('No quote approvals')).toBeInTheDocument();
    });
  });

  it('displays empty state when no approvals exist', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('No quote approvals')).toBeInTheDocument();
    });
  });

  it('shows toast message on successful approval', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuoteApprovals
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuoteApprovals[0]
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockQuoteApprovals[0], status: 'approved' })
      });

    render(<QuoteApprovalDashboard userRole="admin" />);
    
    await waitFor(() => {
      expect(screen.getByText('Quote Pack for MR-001')).toBeInTheDocument();
    });

    const reviewButton = screen.getByText('Review & Approve');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      expect(screen.getByText('Quote Approval')).toBeInTheDocument();
    });

    // Simulate approval submission
    const approveButton = screen.getByText('Submit Approval');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText('Quote approval submitted successfully.')).toBeInTheDocument();
    });
  });
});
