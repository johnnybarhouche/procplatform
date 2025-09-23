import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProcurementDashboard from '@/components/ProcurementDashboard';
import { MaterialRequest, RFQ, Supplier } from '@/types/procurement';

jest.mock('@/components/RFQWizard', () => ({
  __esModule: true,
  default: ({ onCreated, onClose }: { onCreated: (rfq: RFQ) => void; onClose: () => void }) => (
    <div data-testid="rfq-wizard">
      <button onClick={() => onCreated({
        id: 'rfq-1',
        rfq_number: 'RFQ-1',
        material_request_id: 'mr-1',
        material_request: {} as MaterialRequest,
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        suppliers: [],
        quotes: [],
        created_by: 'user',
        created_by_name: 'User',
      })}>
        Dispatch
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/ComparisonGrid', () => ({
  __esModule: true,
  default: () => null,
}));

describe('ProcurementDashboard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (globalThis as { fetch?: typeof fetch }).fetch;
  });

  function arrange() {
    const mockMRs = {
      success: true,
      mrs: [
        {
          id: 'mr-1',
          mrn: 'MR-1',
          project_id: 'project-1',
          project_name: 'Project Alpha',
          requester_id: 'user-1',
          requester_name: 'John Doe',
          status: 'submitted',
          created_at: '2025-02-17T10:00:00Z',
          updated_at: '2025-02-17T10:00:00Z',
          line_items: [
            {
              id: 'line-1',
              item_code: 'ITEM-001',
              description: 'Steel Beam 10m',
              uom: 'EA',
              quantity: 10,
              unit_price: 0,
            },
          ],
          attachments: [],
        },
      ],
      total: 1,
    };

    const mockSuppliers: Supplier[] = [
      {
        id: 'sup-1',
        supplier_code: 'SUP-001',
        name: 'ABC Construction Supplies',
        email: 'rfq@abc.com',
        phone: '+971-4-123-4567',
        address: 'Dubai',
        category: 'Construction',
        rating: 4.5,
        quote_count: 10,
        avg_response_time: 24,
        last_quote_date: '2025-01-01',
        is_active: true,
        status: 'approved',
        has_been_used: true,
        contacts: [
          {
            id: 'contact-1',
            supplier_id: 'sup-1',
            name: 'Ahmed Ali',
            email: 'ahmed@abc.com',
            phone: '+971-4-123-4567',
            position: 'Sales Manager',
            is_primary: true,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        ],
        performance_metrics: {
          id: 'perf-1',
          supplier_id: 'sup-1',
          total_quotes: 10,
          successful_quotes: 8,
          avg_response_time_hours: 24,
          on_time_delivery_rate: 95,
          quality_rating: 4.5,
          communication_rating: 4.2,
          last_updated: '2025-01-01T00:00:00Z',
        },
        compliance_docs: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        created_by: 'user',
        created_by_name: 'User',
      },
    ];

    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      if (typeof input === 'string' && input.includes('/api/mrs')) {
        return {
          ok: true,
          json: async () => mockMRs,
        } as Response;
      }
      if (typeof input === 'string' && input.includes('/api/suppliers')) {
        return {
          ok: true,
          json: async () => ({ suppliers: mockSuppliers }),
        } as Response;
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({}),
      } as Response;
    });

    (globalThis as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  }

  it('displays MR status chips and updates status after RFQ dispatch', async () => {
    arrange();

    render(<ProcurementDashboard userRole="procurement" />);

    await waitFor(() => expect(screen.getByText('MR-1')).toBeInTheDocument());
    const newRequestBadge = screen.getByText(
      (content, element) => content === 'New Request' && element?.tagName === 'SPAN'
    );
    expect(newRequestBadge).toBeInTheDocument();

    fireEvent.click(screen.getByText('Create RFQ'));
    const wizard = await screen.findByTestId('rfq-wizard');
    expect(wizard).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dispatch'));

    await waitFor(() =>
      expect(
        screen.getByText((content, element) => content === 'RFQ Sent' && element?.tagName === 'SPAN')
      ).toBeInTheDocument()
    );
  });

  it('opens detail modal when viewing MR details', async () => {
    arrange();

    render(<ProcurementDashboard userRole="procurement" />);

    await waitFor(() => expect(screen.getByText('MR-1')).toBeInTheDocument());

    fireEvent.click(screen.getByText('View Details'));

    expect(await screen.findByText('Line items')).toBeInTheDocument();
    expect(screen.getByText('Steel Beam 10m')).toBeInTheDocument();
  });
});
