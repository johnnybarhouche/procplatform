import { NextRequest, NextResponse } from 'next/server';
import { Supplier } from '@/types/procurement';

// Mock database for suppliers
export const supplierStore: Supplier[] = [
  {
    id: '1',
    supplier_code: 'SUP-001',
    name: 'ABC Construction Supplies',
    email: 'quotes@abcconstruction.com',
    phone: '+971-4-123-4567',
    address: 'Dubai, UAE',
    category: 'Construction Materials',
    rating: 4.5,
    quote_count: 25,
    avg_response_time: 24,
    last_quote_date: '2025-01-15',
    is_active: true,
    status: 'approved',
    approval_date: '2025-01-01',
    approved_by: 'user1',
    approved_by_name: 'John Smith',
    approval_notes: 'All compliance documents verified',
    has_been_used: true,
    contacts: [
      {
        id: '1',
        supplier_id: '1',
        name: 'Ahmed Al-Rashid',
        email: 'ahmed@abcconstruction.com',
        phone: '+971-4-123-4567',
        position: 'Sales Manager',
        is_primary: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    ],
    performance_metrics: {
      id: '1',
      supplier_id: '1',
      total_quotes: 25,
      successful_quotes: 20,
      avg_response_time_hours: 24,
      on_time_delivery_rate: 95.0,
      quality_rating: 4.5,
      communication_rating: 4.3,
      last_updated: '2025-01-15T00:00:00Z'
    },
    compliance_docs: [
      {
        id: '1',
        name: 'Trade License',
        url: 'https://example.com/docs/trade-license.pdf',
        expiry_date: '2025-12-31',
        is_valid: true
      }
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    created_by: 'user1',
    created_by_name: 'John Smith'
  },
  {
    id: '2',
    supplier_code: 'SUP-002',
    name: 'XYZ Electrical Solutions',
    email: 'procurement@xyzelectrical.com',
    phone: '+971-4-234-5678',
    address: 'Abu Dhabi, UAE',
    category: 'Electrical Equipment',
    rating: 4.2,
    quote_count: 18,
    avg_response_time: 36,
    last_quote_date: '2025-01-10',
    is_active: true,
    status: 'approved',
    approval_date: '2025-01-02',
    approved_by: 'user2',
    approved_by_name: 'Sarah Johnson',
    approval_notes: 'Financial stability verified',
    has_been_used: true,
    contacts: [
      {
        id: '2',
        supplier_id: '2',
        name: 'Mohammed Hassan',
        email: 'mohammed@xyzelectrical.com',
        phone: '+971-4-234-5678',
        position: 'Procurement Director',
        is_primary: true,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      }
    ],
    performance_metrics: {
      id: '2',
      supplier_id: '2',
      total_quotes: 18,
      successful_quotes: 15,
      avg_response_time_hours: 36,
      on_time_delivery_rate: 88.0,
      quality_rating: 4.2,
      communication_rating: 4.0,
      last_updated: '2025-01-10T00:00:00Z'
    },
    compliance_docs: [
      {
        id: '2',
        name: 'ISO 9001 Certificate',
        url: 'https://example.com/docs/iso-9001.pdf',
        expiry_date: '2025-06-30',
        is_valid: true
      }
    ],
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    created_by: 'user2',
    created_by_name: 'Sarah Johnson'
  },
  {
    id: '3',
    supplier_code: 'SUP-003',
    name: 'DEF Industrial Parts',
    email: 'sales@defindustrial.com',
    phone: '+971-4-345-6789',
    address: 'Sharjah, UAE',
    category: 'Industrial Equipment',
    rating: 4.8,
    quote_count: 42,
    avg_response_time: 12,
    last_quote_date: '2025-01-18',
    is_active: true,
    status: 'pending',
    has_been_used: false,
    contacts: [
      {
        id: '3',
        supplier_id: '3',
        name: 'Fatima Al-Zahra',
        email: 'fatima@defindustrial.com',
        phone: '+971-4-345-6789',
        position: 'Business Development Manager',
        is_primary: true,
        created_at: '2025-01-18T00:00:00Z',
        updated_at: '2025-01-18T00:00:00Z'
      }
    ],
    performance_metrics: {
      id: '3',
      supplier_id: '3',
      total_quotes: 42,
      successful_quotes: 38,
      avg_response_time_hours: 12,
      on_time_delivery_rate: 98.0,
      quality_rating: 4.8,
      communication_rating: 4.7,
      last_updated: '2025-01-18T00:00:00Z'
    },
    compliance_docs: [
      {
        id: '3',
        name: 'Quality Certificate',
        url: 'https://example.com/docs/quality-cert.pdf',
        expiry_date: '2025-09-15',
        is_valid: true
      }
    ],
    created_at: '2025-01-18T00:00:00Z',
    updated_at: '2025-01-18T00:00:00Z',
    created_by: 'user3',
    created_by_name: 'Mike Wilson'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredSuppliers = [...supplierStore];

    // Apply filters
    if (category) {
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (status) {
      filteredSuppliers = filteredSuppliers.filter(s => s.status === status);
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredSuppliers = filteredSuppliers.filter(s => s.is_active === activeFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        s.category.toLowerCase().includes(searchLower) ||
        s.supplier_code.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredSuppliers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    return NextResponse.json({
      suppliers: paginatedSuppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    
    // Generate unique supplier code
    const nextId = supplierStore.length + 1;
    const supplierCode = body.supplier_code || `SUP-${String(nextId).padStart(3, '0')}`;
    
    const newSupplier: Supplier = {
      id: nextId.toString(),
      supplier_code: supplierCode,
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      category: body.category,
      rating: 0,
      quote_count: 0,
      avg_response_time: 0,
      last_quote_date: now.split('T')[0],
      is_active: true,
      status: 'pending',
      has_been_used: false,
      contacts: body.contacts || [],
      performance_metrics: {
        id: `perf-${nextId}`,
        supplier_id: nextId.toString(),
        total_quotes: 0,
        successful_quotes: 0,
        avg_response_time_hours: 0,
        on_time_delivery_rate: 0,
        quality_rating: 0,
        communication_rating: 0,
        last_updated: now
      },
      compliance_docs: [],
      created_at: now,
      updated_at: now,
      created_by: body.created_by || 'system',
      created_by_name: body.created_by_name || 'System'
    };

    supplierStore.push(newSupplier);

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
