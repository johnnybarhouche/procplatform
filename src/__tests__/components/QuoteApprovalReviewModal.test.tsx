import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuoteApprovalReviewModal from '@/components/QuoteApprovalReviewModal';
import { QuoteApproval, Quote, Supplier } from '@/types/procurement';

// Mock fetch
global.fetch = jest.fn();

const mockSupplier: Supplier = {
  id: 'sup-1',
  supplier_code: 'SUP-001',
  name: 'Test Supplier',
  email: 'test@supplier.com',
  phone: '+971-4-123-4567',
  address: 'Dubai, UAE',
  category: 'Construction',
  rating: 4.5,
  quote_count: 10,
  avg_response_time: 24,
  last_quote_date: '2025-01-01',
  is_active: true,
  status: 'approved',
  has_been_used: true,
  contacts: [],
  performance_metrics: {
    id: 'perf-1',
    supplier_id: 'sup-1',
    total_quotes: 10,
    successful_quotes: 8,
    avg_response_time_hours: 24,
    on_time_delivery_rate: 95,
    quality_rating: 4.5,
    communication_rating: 4.3,
    last_updated: '2025-01-01T00:00:00Z'
  },
  compliance_docs: [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  created_by: 'admin',
  created_by_name: 'Admin'
};

const mockQuote: Quote = {
  id: 'quote-1',
  rfq_id: 'rfq-1',
  supplier_id: 'sup-1',
  supplier: mockSupplier,
  status: 'submitted',
  submitted_at: '2025-01-01T00:00:00Z',
  valid_until: '2025-02-01T00:00:00Z',
  total_amount: 1000,
  currency: 'AED',
  terms_conditions: 'Standard terms',
  line_items: [
    {
      id: 'line-1-quote-1',
      quote_id: 'quote-1',
      mr_line_item_id: 'line-1',
      mr_line_item: {
        id: 'line-1',
        item_code: 'ITEM-001',
        description: 'Test Item',
        quantity: 10,
        unit: 'PCS',
        unit_price: 100,
        total_price: 1000,
        remarks: 'Test remarks'
      },
      unit_price: 100,
      quantity: 10,
      total_price: 1000,
      lead_time_days: 5,
      remarks: 'Test quote remarks',
      attachments: []
    }
  ],
  attachments: [],
  created_by: 'sup-1',
  created_by_name: 'Test Supplier'
};

const mockQuoteApproval: QuoteApproval = {
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
    quotes: [mockQuote],
    comparison_data: {
      recommended_suppliers: ['sup-1'],
      total_savings: 0,
      comparison_summary: {
        total_lines: 1,
        lines_with_quotes: 1,
        lowest_price_suppliers: ['sup-1'],
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
};

describe('QuoteApprovalReviewModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmitSuccess = jest.fn();

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockOnClose.mockClear();
    mockOnSubmitSuccess.mockClear();
  });

  it('renders the modal with approval details', () => {
    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    expect(screen.getByText('Quote Approval Review')).toBeInTheDocument();
    expect(screen.getByText('MR-001')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('displays line items with supplier quotes', () => {
    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    expect(screen.getByText('ITEM-001')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Supplier')).toBeInTheDocument();
  });

  it('allows supplier selection for each line item', () => {
    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(1); // One supplier for one line item

    fireEvent.click(radioButtons[0]);
    expect(radioButtons[0]).toBeChecked();
  });

  it('shows savings information when supplier is selected', () => {
    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    // Should show savings or variance information
    expect(screen.getByText(/Saving|vs best/)).toBeInTheDocument();
  });

  it('opens confirmation modal when approve button is clicked', () => {
    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    // Select a supplier first
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    expect(screen.getByText('Confirm Quote Approval')).toBeInTheDocument();
  });

  it('submits approval when confirmed', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockQuoteApproval, status: 'approved' })
    });

    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    // Select a supplier first
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    // Confirm in modal
    const confirmButton = screen.getByText('Confirm Approval');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/quote-approvals/${mockQuoteApproval.id}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"decision":"approved"')
        })
      );
    });

    expect(mockOnSubmitSuccess).toHaveBeenCalledWith('Quote approval submitted successfully.');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles submission errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    // Select a supplier first
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    // Confirm in modal
    const confirmButton = screen.getByText('Confirm Approval');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit quote approval.')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes modal when cancel button is clicked', () => {
    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('prevents submission without supplier selection', () => {
    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    const approveButton = screen.getByText('Approve');
    expect(approveButton).toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(
      <QuoteApprovalReviewModal
        approval={mockQuoteApproval}
        onClose={mockOnClose}
        onSubmitSuccess={mockOnSubmitSuccess}
      />
    );

    // Select a supplier first
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    // Confirm in modal
    const confirmButton = screen.getByText('Confirm Approval');
    fireEvent.click(confirmButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });
});
