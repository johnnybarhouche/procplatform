import { NextRequest, NextResponse } from 'next/server';
import { Supplier } from '@/types/procurement';

// Mock database for suppliers
const suppliers: Supplier[] = [
  {
    id: '1',
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
    compliance_docs: [
      {
        id: '1',
        name: 'Trade License',
        url: 'https://example.com/docs/trade-license.pdf',
        expiry_date: '2025-12-31',
        is_valid: true
      }
    ]
  },
  {
    id: '2',
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
    compliance_docs: [
      {
        id: '2',
        name: 'ISO 9001 Certificate',
        url: 'https://example.com/docs/iso-9001.pdf',
        expiry_date: '2025-06-30',
        is_valid: true
      }
    ]
  },
  {
    id: '3',
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
    compliance_docs: [
      {
        id: '3',
        name: 'Quality Certificate',
        url: 'https://example.com/docs/quality-cert.pdf',
        expiry_date: '2025-09-15',
        is_valid: true
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');

    let filteredSuppliers = suppliers;

    if (category) {
      filteredSuppliers = filteredSuppliers.filter(s => 
        s.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredSuppliers = filteredSuppliers.filter(s => s.is_active === activeFilter);
    }

    return NextResponse.json(filteredSuppliers);
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
    
    const newSupplier: Supplier = {
      id: (suppliers.length + 1).toString(),
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      category: body.category,
      rating: 0,
      quote_count: 0,
      avg_response_time: 0,
      last_quote_date: new Date().toISOString().split('T')[0],
      is_active: true,
      compliance_docs: []
    };

    suppliers.push(newSupplier);

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
