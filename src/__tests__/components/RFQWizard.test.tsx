import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RFQWizard from '@/components/RFQWizard';
import { MaterialRequest, Supplier, RFQ } from '@/types/procurement';

const materialRequest: MaterialRequest = {
  id: 'mr-1',
  mrn: 'MR-1001',
  project_id: 'project-1',
  project_name: 'Project Alpha',
  requester_id: 'requester-1',
  requester_name: 'John Doe',
  status: 'new_request',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  line_items: [
    {
      id: 'line-1',
      item_code: 'ITEM-001',
      description: 'Steel Beam 10m',
      uom: 'EA',
      quantity: 10,
      unit_price: 0,
      location: 'Yard A',
      brand_asset: undefined,
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
      location: 'Warehouse',
      brand_asset: undefined,
      remarks: undefined,
      serial_chassis_engine_no: undefined,
      model_year: undefined,
    },
  ],
  attachments: [],
  remarks: undefined,
};

const suppliers: Supplier[] = [
  {
    id: '1',
    supplier_code: 'SUP-001',
    name: 'ABC Construction Supplies',
    email: 'rfq@abc.com',
    phone: '+971-4-123-4567',
    address: 'Dubai, UAE',
    category: 'Construction',
    rating: 4.5,
    quote_count: 12,
    avg_response_time: 24,
    last_quote_date: '2025-01-10',
    is_active: true,
    status: 'approved',
    approval_date: '2024-12-01',
    approved_by: 'admin',
    approved_by_name: 'Admin',
    approval_notes: undefined,
    has_been_used: true,
    contacts: [],
    performance_metrics: {
      id: 'perf-1',
      supplier_id: '1',
      total_quotes: 12,
      successful_quotes: 8,
      avg_response_time_hours: 24,
      on_time_delivery_rate: 95,
      quality_rating: 4.4,
      communication_rating: 4.2,
      last_updated: new Date().toISOString(),
    },
    compliance_docs: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin',
    created_by_name: 'Admin',
  },
];

describe('RFQWizard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    const globalWithFetch = globalThis as { fetch?: typeof fetch };
    delete globalWithFetch.fetch;
  });

  it('guides user through RFQ creation and dispatches request', async () => {
    const onClose = jest.fn();
    const onCreated = jest.fn();

    const mockRFQ: RFQ = {
      id: 'RFQ-1',
      rfq_number: 'RFQ-1',
      material_request_id: materialRequest.id,
      material_request: materialRequest,
      status: 'sent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      due_date: '2025-02-20',
      terms: 'Net 30',
      remarks: 'Handle with care',
      suppliers: [],
      quotes: [],
      created_by: 'user-123',
      created_by_name: 'Procurement Officer',
    };

    const mockResponse = {
      ok: true,
      json: async () => mockRFQ,
    } as unknown as Response;

    const mockFetch = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>(
      async () => mockResponse
    );

    (globalThis as { fetch?: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

    render(<RFQWizard materialRequest={materialRequest} suppliers={suppliers} onClose={onClose} onCreated={onCreated} />);

    // Step 1: Line items
    fireEvent.click(screen.getByText('Clear'));
    expect(screen.getByText('Next')).toBeDisabled();

    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);
    expect(screen.getByText('Next')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Supplier selection
    const supplierCheckbox = screen.getByLabelText('Invite ABC Construction Supplies for Steel Beam 10m');
    fireEvent.click(supplierCheckbox);
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Details
    fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: '2025-02-20' } });
    fireEvent.change(screen.getByLabelText(/Payment or delivery terms/i), { target: { value: 'Net 30' } });
    fireEvent.change(screen.getByLabelText(/Remarks for suppliers/i), { target: { value: 'Handle with care' } });
    fireEvent.click(screen.getByText('Next'));

    // Step 4: Review & dispatch
    fireEvent.click(screen.getByText('Dispatch RFQ'));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(mockRFQ));
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/rfqs',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('line_suppliers'),
      }),
    );
  });
});
