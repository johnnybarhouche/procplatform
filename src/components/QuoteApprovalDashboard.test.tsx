import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteApprovalDashboard from './QuoteApprovalDashboard';

// Mock fetch
global.fetch = jest.fn();

describe('QuoteApprovalDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<QuoteApprovalDashboard userRole="requester" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dashboard with quote approvals', async () => {
    const mockApprovals = [
      {
        id: 'qa-001',
        quote_pack_id: 'qp-001',
        quote_pack: {
          id: 'qp-001',
          rfq_id: 'rfq-001',
          status: 'sent',
          created_at: new Date().toISOString(),
          quotes: [
            {
              id: 'q-001',
              rfq_id: 'rfq-001',
              supplier_id: 'supplier-001',
              supplier: {
                id: 'supplier-001',
                name: 'ABC Construction',
                email: 'quotes@abc.com',
                category: 'Construction',
                rating: 4.5,
                quote_count: 15,
                avg_response_time: 24,
                last_quote_date: new Date().toISOString(),
                is_active: true,
                compliance_docs: []
              },
              status: 'submitted',
              submitted_at: new Date().toISOString(),
              valid_until: new Date().toISOString(),
              total_amount: 15000,
              currency: 'AED',
              line_items: [],
              attachments: [],
              created_by: 'supplier-001',
              created_by_name: 'ABC Construction'
            }
          ],
          comparison_data: {
            total_savings: 0,
            recommended_suppliers: [],
            key_differences: [],
            risk_assessment: 'Low'
          },
          created_by: 'procurement',
          created_by_name: 'Procurement Team'
        },
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        line_item_decisions: []
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApprovals,
    });

    render(<QuoteApprovalDashboard userRole="requester" />);

    await waitFor(() => {
      expect(screen.getByText('Quote Approvals')).toBeInTheDocument();
      expect(screen.getByText('Total Approvals')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('renders empty state when no approvals', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<QuoteApprovalDashboard userRole="requester" />);

    await waitFor(() => {
      expect(screen.getByText('No quote approvals')).toBeInTheDocument();
      expect(screen.getByText('No quote packs are currently pending your approval.')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<QuoteApprovalDashboard userRole="requester" />);

    await waitFor(() => {
      expect(screen.getByText('Quote Approvals')).toBeInTheDocument();
    });
  });

  it('filters approvals by status', async () => {
    const mockApprovals = [
      {
        id: 'qa-001',
        quote_pack_id: 'qp-001',
        quote_pack: {
          id: 'qp-001',
          rfq_id: 'rfq-001',
          status: 'sent',
          created_at: new Date().toISOString(),
          quotes: [],
          comparison_data: {
            total_savings: 0,
            recommended_suppliers: [],
            key_differences: [],
            risk_assessment: 'Low'
          },
          created_by: 'procurement',
          created_by_name: 'Procurement Team'
        },
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        line_item_decisions: []
      },
      {
        id: 'qa-002',
        quote_pack_id: 'qp-002',
        quote_pack: {
          id: 'qp-002',
          rfq_id: 'rfq-002',
          status: 'sent',
          created_at: new Date().toISOString(),
          quotes: [],
          comparison_data: {
            total_savings: 0,
            recommended_suppliers: [],
            key_differences: [],
            risk_assessment: 'Low'
          },
          created_by: 'procurement',
          created_by_name: 'Procurement Team'
        },
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        line_item_decisions: []
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApprovals,
    });

    render(<QuoteApprovalDashboard userRole="requester" />);

    await waitFor(() => {
      expect(screen.getByText('Quote Approvals')).toBeInTheDocument();
    });
  });
});
