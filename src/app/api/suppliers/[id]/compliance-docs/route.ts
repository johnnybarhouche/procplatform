import { NextRequest, NextResponse } from 'next/server';
import { Supplier, ComplianceDoc } from '@/types/procurement';
import { createMockSupplier } from '@/lib/mock-suppliers';

// Mock database for suppliers (in a real app, this would be a database)
const suppliers: Supplier[] = [
  createMockSupplier({
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
        updated_at: '2025-01-01T00:00:00Z',
      },
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
      last_updated: '2025-01-15T00:00:00Z',
    },
    compliance_docs: [
      {
        id: '1',
        name: 'Trade License',
        url: 'https://example.com/docs/trade-license.pdf',
        expiry_date: '2025-12-31',
        is_valid: true,
      },
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    created_by: 'user1',
    created_by_name: 'John Smith',
  }),
  createMockSupplier({
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
        updated_at: '2025-01-02T00:00:00Z',
      },
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
      last_updated: '2025-01-10T00:00:00Z',
    },
    compliance_docs: [
      {
        id: '2',
        name: 'ISO 9001 Certificate',
        url: 'https://example.com/docs/iso-9001.pdf',
        expiry_date: '2025-06-30',
        is_valid: true,
      },
    ],
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    created_by: 'user2',
    created_by_name: 'Sarah Johnson',
  }),
  createMockSupplier({
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
        updated_at: '2025-01-18T00:00:00Z',
      },
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
      last_updated: '2025-01-18T00:00:00Z',
    },
    compliance_docs: [
      {
        id: '3',
        name: 'Quality Certificate',
        url: 'https://example.com/docs/quality-cert.pdf',
        expiry_date: '2025-09-15',
        is_valid: true,
      },
    ],
    created_at: '2025-01-18T00:00:00Z',
    updated_at: '2025-01-18T00:00:00Z',
    created_by: 'user3',
    created_by_name: 'Mike Wilson',
  }),
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier.compliance_docs);
  } catch (error) {
    console.error('Error fetching compliance documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance documents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { document_name, expiry_date, file_url } = body;
    
    const { id: supplierId } = await params;
    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    
    if (supplierIndex === -1) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Create new compliance document
    const newDoc: ComplianceDoc = {
      id: Date.now().toString(),
      name: document_name,
      url: file_url,
      expiry_date: expiry_date,
      is_valid: new Date(expiry_date) > new Date()
    };

    // Add document to supplier
    suppliers[supplierIndex] = {
      ...suppliers[supplierIndex],
      compliance_docs: [...suppliers[supplierIndex].compliance_docs, newDoc],
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Compliance document added successfully',
      document: newDoc
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding compliance document:', error);
    return NextResponse.json(
      { error: 'Failed to add compliance document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supplierId } = await params;
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');
    
    if (!docId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
    
    if (supplierIndex === -1) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Remove document from supplier
    const updatedDocs = suppliers[supplierIndex].compliance_docs.filter(doc => doc.id !== docId);
    
    suppliers[supplierIndex] = {
      ...suppliers[supplierIndex],
      compliance_docs: updatedDocs,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Compliance document removed successfully'
    });
  } catch (error) {
    console.error('Error removing compliance document:', error);
    return NextResponse.json(
      { error: 'Failed to remove compliance document' },
      { status: 500 }
    );
  }
}
