import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import POStatusTimeline from '@/components/approvals/POStatusTimeline';
import { PurchaseOrder } from '@/types/procurement';

// Mock data
const mockPO: PurchaseOrder = {
  id: 'po-1',
  po_number: 'PO-001',
  pr_id: 'pr-1',
  pr: {
    id: 'pr-1',
    pr_number: 'PR-001',
    project_name: 'Test Project',
    supplier: {
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
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    status: 'approved',
    total_value_aed: 15000,
    total_value_usd: 4085,
    currency: 'AED',
    created_by: 'user-1',
    created_by_name: 'John Doe',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    approved_at: '2025-01-02T00:00:00Z',
    line_items: [],
    approvals: [],
    quote_approval: null
  },
  supplier: {
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
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  status: 'sent',
  total_value_aed: 15000,
  total_value_usd: 4085,
  currency: 'AED',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  sent_at: '2025-01-03T00:00:00Z',
  acknowledged_at: null,
  line_items: [],
  status_history: [
    {
      id: 'hist-1',
      po_id: 'po-1',
      status: 'draft',
      changed_at: '2025-01-01T00:00:00Z',
      changed_by: 'user-1',
      changed_by_name: 'John Doe'
    },
    {
      id: 'hist-2',
      po_id: 'po-1',
      status: 'approved',
      changed_at: '2025-01-02T00:00:00Z',
      changed_by: 'user-2',
      changed_by_name: 'Jane Manager'
    },
    {
      id: 'hist-3',
      po_id: 'po-1',
      status: 'sent',
      changed_at: '2025-01-03T00:00:00Z',
      changed_by: 'user-1',
      changed_by_name: 'John Doe'
    }
  ]
};

describe('POStatusTimeline', () => {
  it('renders timeline with correct structure', () => {
    render(<POStatusTimeline po={mockPO} />);

    expect(screen.getByText('PO Status Timeline')).toBeInTheDocument();
    expect(screen.getByText('Tracks the lifecycle of the purchase order from creation through supplier acknowledgement.')).toBeInTheDocument();
  });

  it('displays all timeline steps', () => {
    render(<POStatusTimeline po={mockPO} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Sent to Supplier')).toBeInTheDocument();
    expect(screen.getByText('Acknowledged')).toBeInTheDocument();
  });

  it('shows correct step descriptions', () => {
    render(<POStatusTimeline po={mockPO} />);

    expect(screen.getByText('PO generated from approved PR')).toBeInTheDocument();
    expect(screen.getByText('Approval matrix satisfied and PO released')).toBeInTheDocument();
    expect(screen.getByText('Dispatch completed via email/portal')).toBeInTheDocument();
    expect(screen.getByText('Supplier confirmed PO receipt')).toBeInTheDocument();
  });

  it('displays timestamps when available', () => {
    render(<POStatusTimeline po={mockPO} />);

    // Check for formatted timestamps
    expect(screen.getByText(/Jan 1, 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 2, 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 3, 2025/)).toBeInTheDocument();
  });

  it('shows actors for completed steps', () => {
    render(<POStatusTimeline po={mockPO} />);

    expect(screen.getAllByText(/John Doe/)).toHaveLength(2);
    expect(screen.getByText(/Jane Manager/)).toBeInTheDocument();
  });

  it('handles PO with acknowledged status', () => {
    const acknowledgedPO: PurchaseOrder = {
      ...mockPO,
      status: 'acknowledged',
      acknowledged_at: '2025-01-04T00:00:00Z',
      status_history: [
        ...mockPO.status_history,
        {
          id: 'hist-4',
          po_id: 'po-1',
          status: 'acknowledged',
          changed_at: '2025-01-04T00:00:00Z',
          changed_by: 'supplier-1',
          changed_by_name: 'Supplier User'
        }
      ]
    };

    render(<POStatusTimeline po={acknowledgedPO} />);

    expect(screen.getByText(/Supplier User/)).toBeInTheDocument();
  });

  it('handles PO with draft status', () => {
    const draftPO: PurchaseOrder = {
      ...mockPO,
      status: 'draft',
      sent_at: null,
      status_history: [
        {
          id: 'hist-1',
          po_id: 'po-1',
          status: 'draft',
          changed_at: '2025-01-01T00:00:00Z',
          changed_by: 'user-1',
          changed_by_name: 'John Doe'
        }
      ]
    };

    render(<POStatusTimeline po={draftPO} />);

    // Only draft step should be completed
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('applies correct CSS classes for different states', () => {
    const { container } = render(<POStatusTimeline po={mockPO} />);

    // Check for active step classes (animate-pulse)
    const activeStep = container.querySelector('.animate-pulse');
    expect(activeStep).toBeInTheDocument();
  });

  it('handles missing status history gracefully', () => {
    const poWithoutHistory: PurchaseOrder = {
      ...mockPO,
      status_history: []
    };

    render(<POStatusTimeline po={poWithoutHistory} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});