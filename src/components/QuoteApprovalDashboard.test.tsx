import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteApprovalDashboard from './QuoteApprovalDashboard';
import { createMockSupplier } from '@/lib/mock-suppliers';
import { QuoteApproval } from '@/types/procurement';

// Mock fetch
global.fetch = jest.fn();

const buildMockQuoteApproval = (overrides: Partial<QuoteApproval> = {}): QuoteApproval => {
  const now = new Date().toISOString();
  const supplierA = createMockSupplier({
    id: 'supplier-001',
    supplier_code: 'SUP-001',
    name: 'ABC Construction',
    email: 'quotes@abc.com',
    category: 'Construction',
    rating: 4.5,
    last_quote_date: now.slice(0, 10),
    status: 'approved',
    has_been_used: true,
  });

  const supplierB = createMockSupplier({
    id: 'supplier-002',
    supplier_code: 'SUP-002',
    name: 'XYZ Electrical',
    email: 'sales@xyz.com',
    category: 'Electrical',
    rating: 4.2,
    last_quote_date: now.slice(0, 10),
    status: 'approved',
    has_been_used: true,
  });

  const materialRequest = {
    id: 'mr-001',
    mrn: 'MR-001',
    project_id: '1',
    project_name: 'Project Alpha',
    requester_id: 'user-001',
    requester_name: 'Jane Doe',
    status: 'submitted' as const,
    created_at: now,
    updated_at: now,
    line_items: [
      {
        id: 'mr-line-1',
        item_code: 'ITEM-001',
        description: 'Concrete Mix 50kg',
        uom: 'BAG',
        quantity: 30,
        unit_price: 0,
        remarks: 'Standard mix',
        location: undefined,
        brand_asset: undefined,
        serial_chassis_engine_no: undefined,
        model_year: undefined,
      },
    ],
    attachments: [],
  };

  const rfq = {
    id: 'rfq-001',
    rfq_number: 'RFQ-001',
    material_request_id: materialRequest.id,
    material_request: materialRequest,
    status: 'comparison_ready' as const,
    created_at: now,
    updated_at: now,
    sent_at: now,
    due_date: now.slice(0, 10),
    terms: 'Net 30',
    remarks: undefined,
    suppliers: [],
    quotes: [] as QuoteApproval['quote_pack']['quotes'],
    created_by: 'procurement-user',
    created_by_name: 'Procurement Officer',
    comparison_summary: undefined,
  };

  const quoteA = {
    id: 'quote-001',
    rfq_id: rfq.id,
    supplier_id: supplierA.id,
    supplier: supplierA,
    status: 'submitted' as const,
    submitted_at: now,
    valid_until: now,
    total_amount: 12000,
    currency: 'AED',
    terms_conditions: 'Delivery in 7 days',
    line_items: [
      {
        id: 'qli-001',
        quote_id: 'quote-001',
        mr_line_item_id: materialRequest.line_items[0].id,
        mr_line_item: materialRequest.line_items[0],
        unit_price: 400,
        quantity: 30,
        total_price: 12000,
        lead_time_days: 7,
        remarks: undefined,
        attachments: [],
      },
    ],
    attachments: [],
    created_by: supplierA.id,
    created_by_name: supplierA.name,
  };

  const quoteB = {
    id: 'quote-002',
    rfq_id: rfq.id,
    supplier_id: supplierB.id,
    supplier: supplierB,
    status: 'submitted' as const,
    submitted_at: now,
    valid_until: now,
    total_amount: 13500,
    currency: 'AED',
    terms_conditions: 'Delivery in 5 days',
    line_items: [
      {
        id: 'qli-002',
        quote_id: 'quote-002',
        mr_line_item_id: materialRequest.line_items[0].id,
        mr_line_item: materialRequest.line_items[0],
        unit_price: 450,
        quantity: 30,
        total_price: 13500,
        lead_time_days: 5,
        remarks: undefined,
        attachments: [],
      },
    ],
    attachments: [],
    created_by: supplierB.id,
    created_by_name: supplierB.name,
  };

  rfq.quotes = [quoteA, quoteB];

  const quotePack = {
    id: 'qp-001',
    rfq_id: rfq.id,
    rfq,
    status: 'sent' as const,
    created_at: now,
    quotes: rfq.quotes,
    comparison_data: {
      total_savings: 0,
      recommended_suppliers: [],
      key_differences: [],
      risk_assessment: 'Low',
    },
    created_by: rfq.created_by,
    created_by_name: rfq.created_by_name,
  };

  return {
    id: 'qa-001',
    quote_pack_id: quotePack.id,
    quote_pack: quotePack,
    status: 'pending',
    created_at: now,
    updated_at: now,
    line_item_decisions: [],
    ...overrides,
  } as QuoteApproval;
};

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
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [buildMockQuoteApproval()],
    });

    render(<QuoteApprovalDashboard userRole="requester" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Quote Approvals/i })).toBeInTheDocument();
      expect(screen.getByText('Total Approvals')).toBeInTheDocument();
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
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
      expect(screen.getByRole('heading', { level: 1, name: /Quote Approvals/i })).toBeInTheDocument();
    });
  });

  it('filters approvals by status', async () => {
    const pendingApproval = buildMockQuoteApproval();
    const approvedApproval = buildMockQuoteApproval({ id: 'qa-002', status: 'approved' });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [pendingApproval, approvedApproval],
    });

    render(<QuoteApprovalDashboard userRole="requester" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Quote Approvals/i })).toBeInTheDocument();
    });
  });

  it('opens review modal when selecting an approval', async () => {
    const approval = buildMockQuoteApproval();

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [approval],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => approval,
      });

    render(<QuoteApprovalDashboard userRole="requester" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Quote Approvals/i })).toBeInTheDocument();
    });

    const reviewButton = screen.getByRole('button', { name: /review & approve/i });
    reviewButton.click();

    await waitFor(() => {
      expect(screen.getByText('Quote Approval')).toBeInTheDocument();
      expect(screen.getByText(/Material Request/)).toBeInTheDocument();
    });
  });
});
