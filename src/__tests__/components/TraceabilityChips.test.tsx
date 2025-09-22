import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TraceabilityChips from '@/components/approvals/TraceabilityChips';
import { QuoteApproval } from '@/types/procurement';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock data
const mockQuoteApproval: QuoteApproval = {
  id: 'qa-1',
  quote_pack_id: 'qp-1',
  quote_pack: {
    id: 'qp-1',
    rfq_id: 'rfq-1',
    rfq: {
      id: 'rfq-1',
      rfq_number: 'RFQ-001',
      material_request_id: 'mr-1',
      material_request: {
        id: 'mr-1',
        mrn: 'MR-001',
        project_name: 'Test Project',
        line_items: [],
        status: 'approved',
        total_value_aed: 10000,
        total_value_usd: 2723,
        currency: 'AED',
        created_by: 'user-1',
        created_by_name: 'John Doe',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      status: 'completed',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      due_date: '2025-01-15T00:00:00Z',
      suppliers: []
    },
    status: 'completed',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  status: 'pending',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
};

describe('TraceabilityChips', () => {
  it('renders all traceability chips with correct labels', () => {
    render(<TraceabilityChips quoteApproval={mockQuoteApproval} />);

    expect(screen.getByText('MR')).toBeInTheDocument();
    expect(screen.getByText('RFQ')).toBeInTheDocument();
    expect(screen.getByText('Quote Pack')).toBeInTheDocument();
    expect(screen.getByText('Quote Approval')).toBeInTheDocument();
  });

  it('displays correct values for each chip', () => {
    render(<TraceabilityChips quoteApproval={mockQuoteApproval} />);

    expect(screen.getByText('MR-001')).toBeInTheDocument();
    expect(screen.getByText('RFQ-001')).toBeInTheDocument();
    expect(screen.getByText('qp-1')).toBeInTheDocument();
    expect(screen.getByText('qa-1')).toBeInTheDocument();
  });

  it('creates correct links for navigable chips', () => {
    render(<TraceabilityChips quoteApproval={mockQuoteApproval} />);

    const mrLink = screen.getByRole('link', { name: /Material Request context: MR-001/ });
    expect(mrLink).toHaveAttribute('href', '/material-requests/mr-1');

    const rfqLink = screen.getByRole('link', { name: /Request for Quotation details: RFQ-001/ });
    expect(rfqLink).toHaveAttribute('href', '/rfqs/rfq-1');

    const quotePackLink = screen.getByRole('link', { name: /Submitted quote bundle: qp-1/ });
    expect(quotePackLink).toHaveAttribute('href', '/quote-packs/qp-1');

    const quoteApprovalLink = screen.getByRole('link', { name: /Quote approval audit trail: qa-1/ });
    expect(quoteApprovalLink).toHaveAttribute('href', '/quote-approvals/qa-1');
  });

  it('handles missing quote approval gracefully', () => {
    render(<TraceabilityChips quoteApproval={null} />);

    expect(screen.queryByText('MR')).not.toBeInTheDocument();
    expect(screen.queryByText('RFQ')).not.toBeInTheDocument();
  });

  it('handles partial data gracefully', () => {
    const partialQuoteApproval: QuoteApproval = {
      id: 'qa-2',
      quote_pack_id: 'qp-2',
      quote_pack: {
        id: 'qp-2',
        rfq_id: 'rfq-2',
        rfq: {
          id: 'rfq-2',
          rfq_number: 'RFQ-002',
          material_request_id: 'mr-2',
          material_request: null, // Missing material request
          status: 'completed',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          due_date: '2025-01-15T00:00:00Z',
          suppliers: []
        },
        status: 'completed',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };

    render(<TraceabilityChips quoteApproval={partialQuoteApproval} />);

    // Should not render MR chip since material_request is null
    expect(screen.queryByText('MR')).not.toBeInTheDocument();
    
    // Should still render other chips
    expect(screen.getByText('RFQ')).toBeInTheDocument();
    expect(screen.getByText('Quote Pack')).toBeInTheDocument();
    expect(screen.getByText('Quote Approval')).toBeInTheDocument();
  });

  it('uses RFQ ID when RFQ number is not available', () => {
    const quoteApprovalWithoutRFQNumber: QuoteApproval = {
      ...mockQuoteApproval,
      quote_pack: {
        ...mockQuoteApproval.quote_pack,
        rfq: {
          ...mockQuoteApproval.quote_pack.rfq,
          rfq_number: undefined
        }
      }
    };

    render(<TraceabilityChips quoteApproval={quoteApprovalWithoutRFQNumber} />);

    expect(screen.getByText('rfq-1')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<TraceabilityChips quoteApproval={mockQuoteApproval} />);

    const chips = container.querySelectorAll('.inline-flex.items-center.gap-2.rounded-full');
    expect(chips.length).toBe(4);

    chips.forEach(chip => {
      expect(chip).toHaveClass('border-brand-primary/30');
      expect(chip).toHaveClass('bg-brand-primary/10');
      expect(chip).toHaveClass('text-brand-primary');
    });
  });

  it('handles custom className prop', () => {
    const { container } = render(
      <TraceabilityChips quoteApproval={mockQuoteApproval} className="custom-class" />
    );

    const chipsContainer = container.querySelector('.flex.flex-wrap.gap-2');
    expect(chipsContainer).toHaveClass('custom-class');
  });

  it('provides correct accessibility labels', () => {
    render(<TraceabilityChips quoteApproval={mockQuoteApproval} />);

    expect(screen.getByLabelText('Material Request context: MR-001')).toBeInTheDocument();
    expect(screen.getByLabelText('Request for Quotation details: RFQ-001')).toBeInTheDocument();
    expect(screen.getByLabelText('Submitted quote bundle: qp-1')).toBeInTheDocument();
    expect(screen.getByLabelText('Quote approval audit trail: qa-1')).toBeInTheDocument();
  });
});