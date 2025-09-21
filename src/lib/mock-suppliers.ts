import { Supplier, SupplierContact, SupplierPerformanceMetrics } from '@/types/procurement';

const sanitizeSupplierCode = (value: string) => {
  const code = value.replace(/[^a-z0-9]/gi, '').toUpperCase();
  return code ? `SUP-${code}` : 'SUP-MOCK';
};

const buildDefaultContacts = (supplierId: string, email: string, phone?: string): SupplierContact[] => {
  const timestamp = new Date().toISOString();
  return [
    {
      id: `${supplierId}-contact-1`,
      supplier_id: supplierId,
      name: 'Primary Contact',
      email,
      phone: phone ?? '+971-4-000-0000',
      position: 'Sales Manager',
      is_primary: true,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];
};

const buildDefaultPerformance = (supplierId: string): SupplierPerformanceMetrics => ({
  id: `${supplierId}-metrics`,
  supplier_id: supplierId,
  total_quotes: 0,
  successful_quotes: 0,
  avg_response_time_hours: 0,
  on_time_delivery_rate: 0,
  quality_rating: 0,
  communication_rating: 0,
  last_updated: new Date().toISOString(),
});

export const createMockSupplier = (overrides: Partial<Supplier> = {}): Supplier => {
  const now = new Date().toISOString();
  const supplierId = overrides.id ?? 'supplier-mock';
  const email = overrides.email ?? 'supplier@example.com';
  const phone = overrides.phone;

  const supplier: Supplier = {
    id: supplierId,
    supplier_code: overrides.supplier_code ?? sanitizeSupplierCode(supplierId),
    name: overrides.name ?? 'Mock Supplier',
    email,
    phone,
    address: overrides.address ?? 'Dubai, UAE',
    category: overrides.category ?? 'General Supplies',
    rating: overrides.rating ?? 0,
    quote_count: overrides.quote_count ?? 0,
    avg_response_time: overrides.avg_response_time ?? 0,
    last_quote_date: overrides.last_quote_date ?? now.split('T')[0],
    is_active: overrides.is_active ?? true,
    compliance_docs: overrides.compliance_docs ?? [],
    status: overrides.status ?? 'pending',
    approval_date: overrides.approval_date,
    approved_by: overrides.approved_by,
    approved_by_name: overrides.approved_by_name,
    approval_notes: overrides.approval_notes,
    contacts: overrides.contacts ?? buildDefaultContacts(supplierId, email, phone),
    performance_metrics: overrides.performance_metrics
      ? {
          ...buildDefaultPerformance(supplierId),
          ...overrides.performance_metrics,
          supplier_id: overrides.performance_metrics.supplier_id ?? supplierId,
        }
      : buildDefaultPerformance(supplierId),
    created_at: overrides.created_at ?? now,
    updated_at: overrides.updated_at ?? now,
    created_by: overrides.created_by ?? 'system',
    created_by_name: overrides.created_by_name ?? 'System',
    has_been_used: overrides.has_been_used ?? false,
  };

  return supplier;
};

export const cloneSupplier = (supplier: Supplier, overrides: Partial<Supplier> = {}): Supplier => {
  return createMockSupplier({ ...supplier, ...overrides });
};
