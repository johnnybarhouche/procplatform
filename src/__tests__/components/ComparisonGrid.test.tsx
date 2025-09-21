import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComparisonGrid from '@/components/ComparisonGrid';
import { ComparisonSummary, RFQ, Supplier, MaterialRequest } from '@/types/procurement';

const buildSupplier = (id: string, name: string): Supplier => ({
  id,
  supplier_code: `SUP-${id}`,
  name,
  email: `${name.split(' ')[0].toLowerCase()}@example.com`,
  phone: '+971-4-123-4567',
  address: 'Dubai, UAE',
  category: 'Construction',
  rating: 4.2,
  quote_count: 12,
  avg_response_time: 24,
  last_quote_date: '2025-02-01',
  is_active: true,
  status: 'approved',
  has_been_used: true,
  contacts: [],
  performance_metrics: {
    id: `perf-${id}`,
    supplier_id: id,
    total_quotes: 12,
    successful_quotes: 8,
    avg_response_time_hours: 24,
    on_time_delivery_rate: 95,
    quality_rating: 4.3,
    communication_rating: 4.1,
    last_updated: new Date().toISOString(),
  },
  compliance_docs: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'admin',
  created_by_name: 'Admin',
});

const materialRequest: MaterialRequest = {
  id: 'mr-1',
  mrn: 'MR-1',
  project_id: 'project-1',
  project_name: 'Project Alpha',
  requester_id: 'user-1',
  requester_name: 'John Doe',
  status: 'in_progress',
  created_at: '2025-02-10T08:00:00Z',
  updated_at: '2025-02-12T09:00:00Z',
  attachments: [],
  remarks: undefined,
  line_items: [
    {
      id: 'line-1',
      item_code: 'ITEM-001',
      description: 'Steel Beam 10m',
      uom: 'EA',
      quantity: 10,
      unit_price: 0,
      location: 'Yard A',
      brand_asset: 'ArcelorMittal',
      remarks: undefined,
      serial_chassis_engine_no: undefined,
      model_year: undefined,
    },
    {
      id: 'line-2',
      item_code: 'ITEM-002',
      description: 'Concrete Mix 50kg',
      uom: 'BAG',
      quantity: 30,
      unit_price: 0,
      location: 'Plant',
      brand_asset: 'Cemex',
      remarks: undefined,
      serial_chassis_engine_no: undefined,
      model_year: undefined,
    },
  ],
};

const supplierA = buildSupplier('sup-1', 'ABC Supplies');
const supplierB = buildSupplier('sup-2', 'XYZ Materials');

const createFetchMock = () =>
  jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
  } as unknown as Response);

let fetchMock: jest.Mock;

const rfq: RFQ = {
  id: 'rfq-1',
  rfq_number: 'RFQ-1',
  material_request_id: materialRequest.id,
  material_request: materialRequest,
  status: 'quotes_received',
  created_at: '2025-02-11T08:00:00Z',
  updated_at: '2025-02-12T10:00:00Z',
  sent_at: '2025-02-11T08:30:00Z',
  due_date: '2025-02-18',
  terms: 'Net 30',
  remarks: 'Handle with care',
  suppliers: [
    {
      id: 'rfq-sup-1',
      rfq_id: 'rfq-1',
      supplier_id: supplierA.id,
      supplier: supplierA,
      status: 'responded',
      sent_at: '2025-02-11T08:30:00Z',
      responded_at: '2025-02-11T17:00:00Z',
      portal_link: 'https://example.com',
      email_tracking_id: 'track-1',
      invitation_type: 'suggested',
    },
    {
      id: 'rfq-sup-2',
      rfq_id: 'rfq-1',
      supplier_id: supplierB.id,
      supplier: supplierB,
      status: 'responded',
      sent_at: '2025-02-11T08:30:00Z',
      responded_at: '2025-02-12T08:00:00Z',
      portal_link: 'https://example.com',
      email_tracking_id: 'track-2',
      invitation_type: 'manual',
    },
  ],
  quotes: [
    {
      id: 'quote-1',
      rfq_id: 'rfq-1',
      supplier_id: supplierA.id,
      supplier: supplierA,
      status: 'submitted',
      submitted_at: '2025-02-11T17:00:00Z',
      valid_until: '2025-03-11T17:00:00Z',
      total_amount: 10 * 400 + 30 * 28,
      currency: 'AED',
      terms_conditions: 'Delivery within 7 days',
      line_items: [
        {
          id: 'line-1-quote-1',
          quote_id: 'quote-1',
          mr_line_item_id: 'line-1',
          mr_line_item: materialRequest.line_items[0],
          unit_price: 400,
          quantity: 10,
          total_price: 4000,
          lead_time_days: 5,
          remarks: undefined,
          attachments: [
            {
              id: 'att-line-1',
              filename: 'beam-spec.pdf',
              url: 'https://files.example.com/beam-spec.pdf',
              file_type: 'application/pdf',
              file_size: 2048,
              uploaded_at: '2025-02-11T17:00:00Z',
            },
          ],
        },
        {
          id: 'line-2-quote-1',
          quote_id: 'quote-1',
          mr_line_item_id: 'line-2',
          mr_line_item: materialRequest.line_items[1],
          unit_price: 29,
          quantity: 30,
          total_price: 870,
          lead_time_days: 4,
          remarks: undefined,
        },
      ],
      attachments: [],
      created_by: 'sup-1',
      created_by_name: supplierA.name,
    },
    {
      id: 'quote-2',
      rfq_id: 'rfq-1',
      supplier_id: supplierB.id,
      supplier: supplierB,
      status: 'submitted',
      submitted_at: '2025-02-12T08:00:00Z',
      valid_until: '2025-03-10T08:00:00Z',
      total_amount: 10 * 390 + 30 * 31,
      currency: 'AED',
      terms_conditions: 'Delivery within 5 days',
      line_items: [
        {
          id: 'line-1-quote-2',
          quote_id: 'quote-2',
          mr_line_item_id: 'line-1',
          mr_line_item: materialRequest.line_items[0],
          unit_price: 390,
          quantity: 10,
          total_price: 3900,
          lead_time_days: 6,
          remarks: undefined,
        },
        {
          id: 'line-2-quote-2',
          quote_id: 'quote-2',
          mr_line_item_id: 'line-2',
          mr_line_item: materialRequest.line_items[1],
          unit_price: 30,
          quantity: 30,
          total_price: 900,
          lead_time_days: 3,
          remarks: undefined,
        },
      ],
      attachments: [],
      created_by: 'sup-2',
      created_by_name: supplierB.name,
    },
  ],
  created_by: 'user-123',
  created_by_name: 'Procurement Officer',
};

describe('ComparisonGrid', () => {
  beforeEach(() => {
    fetchMock = createFetchMock();
    global.fetch = fetchMock as unknown as typeof fetch;
    const globalWithURL = globalThis as unknown as { URL: { createObjectURL?: () => string; revokeObjectURL?: () => void } };
    globalWithURL.URL.createObjectURL = () => 'blob:mock';
    globalWithURL.URL.revokeObjectURL = () => {};
  });

  afterEach(() => {
    fetchMock.mockReset();
    jest.restoreAllMocks();
  });

  it('highlights lowest price and allows supplier selection', async () => {
    const onSave = jest.fn();

    render(<ComparisonGrid rfq={rfq} onClose={jest.fn()} onSaveSelections={onSave} />);

    // Lowest price highlight present
    const cheapestCell = screen.getAllByText(/AED 390\.00/)[0];
    expect(cheapestCell).toBeInTheDocument();

    // Change selection for concrete mix line
    const radios = screen.getAllByRole('radio', { name: /XYZ Materials/i });
    fireEvent.click(radios[1]);

    fireEvent.click(screen.getByText('Save selections'));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const summary: ComparisonSummary = onSave.mock.calls[0][0];
    expect(summary.selections).toHaveLength(2);
    expect(summary.selections[1].supplier_name).toBe('XYZ Materials');

    const calls = fetchMock.mock.calls;
    expect(calls.some(([, options]) => {
      if (!options || typeof options !== 'object') return false;
      const body = (options as RequestInit).body;
      if (typeof body !== 'string') return false;
      try {
        const parsed = JSON.parse(body);
        return parsed.event === 'selection_saved';
      } catch {
        return false;
      }
    })).toBe(true);
  });

  it('exports CSV without throwing', async () => {
    const linkClick = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<ComparisonGrid rfq={rfq} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText(/Export summary/));
    await waitFor(() => expect(linkClick).toHaveBeenCalled());

    const exportCall = fetchMock.mock.calls.find(([, options]) => {
      if (!options || typeof options !== 'object') return false;
      const body = (options as RequestInit).body;
      if (typeof body !== 'string') return false;
      try {
        const parsed = JSON.parse(body);
        return parsed.event === 'exported';
      } catch {
        return false;
      }
    });
    expect(exportCall).toBeDefined();
  });

  it('shows attachment indicators for quote line items', () => {
    render(<ComparisonGrid rfq={rfq} onClose={jest.fn()} />);
    expect(screen.getByText(/Attachments: 1/)).toBeInTheDocument();
  });
});
