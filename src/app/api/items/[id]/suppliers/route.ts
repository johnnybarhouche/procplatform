import { NextRequest, NextResponse } from 'next/server';
import { SupplierCapability } from '@/types/procurement';

// Mock database for supplier capabilities (in a real app, this would be a database)
const supplierCapabilities: SupplierCapability[] = [
  {
    id: '1',
    supplier_id: '1',
    supplier_name: 'ABC Construction Supplies',
    item_id: '1',
    item_code: 'ITM-001',
    is_primary_supplier: true,
    capability_rating: 4.5,
    notes: 'Primary supplier for steel reinforcement',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    supplier_id: '2',
    supplier_name: 'XYZ Steel Works',
    item_id: '1',
    item_code: 'ITM-001',
    is_primary_supplier: false,
    capability_rating: 4.2,
    notes: 'Alternative supplier with good quality',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    supplier_id: '1',
    supplier_name: 'ABC Construction Supplies',
    item_id: '2',
    item_code: 'ITM-002',
    is_primary_supplier: true,
    capability_rating: 4.8,
    notes: 'Reliable concrete supplier',
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '4',
    supplier_id: '3',
    supplier_name: 'DEF Industrial Parts',
    item_id: '2',
    item_code: 'ITM-002',
    is_primary_supplier: false,
    capability_rating: 4.0,
    notes: 'New supplier, good pricing',
    created_at: '2025-01-02T00:00:00Z'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const capabilities = supplierCapabilities.filter(cap => cap.item_id === itemId);

    // Sort by primary supplier first, then by capability rating
    capabilities.sort((a, b) => {
      if (a.is_primary_supplier && !b.is_primary_supplier) return -1;
      if (!a.is_primary_supplier && b.is_primary_supplier) return 1;
      return b.capability_rating - a.capability_rating;
    });

    return NextResponse.json(capabilities);
  } catch (error) {
    console.error('Error fetching item suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item suppliers' },
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
    const now = new Date().toISOString();

    // Check if capability already exists
    const { id: itemId } = await params;
    const existingCapability = supplierCapabilities.find(
      cap => cap.supplier_id === body.supplier_id && cap.item_id === itemId
    );

    if (existingCapability) {
      return NextResponse.json(
        { error: 'Supplier capability already exists for this item' },
        { status: 400 }
      );
    }

    const newCapability: SupplierCapability = {
      id: (supplierCapabilities.length + 1).toString(),
      supplier_id: body.supplier_id,
      supplier_name: body.supplier_name,
      item_id: itemId,
      item_code: body.item_code,
      is_primary_supplier: body.is_primary_supplier || false,
      capability_rating: body.capability_rating || 0,
      notes: body.notes,
      created_at: now
    };

    // If this is being set as primary, remove primary status from other suppliers for this item
    if (newCapability.is_primary_supplier) {
      supplierCapabilities.forEach(cap => {
        if (cap.item_id === itemId && cap.supplier_id !== body.supplier_id) {
          cap.is_primary_supplier = false;
        }
      });
    }

    supplierCapabilities.push(newCapability);

    return NextResponse.json(newCapability, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier capability:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier capability' },
      { status: 500 }
    );
  }
}
